import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canAccess, availableCommands, userModules } from './bot-access.js';
const mock = vi.hoisted(() => ({ query: vi.fn(), mutation: vi.fn() }));
vi.mock('convex/browser', () => ({ ConvexHttpClient: class { query = mock.query; mutation = mock.mutation; } }));
process.env.TELEGRAM_REQUIRE_AUTH = 'false';
process.env.TELEGRAM_APP_USERNAME = '';
process.env.TELEGRAM_APP_PASSWORD = '';
process.env.CONVEX_URL = 'https://test.convex.cloud';
process.env.TELEGRAM_BOT_TOKEN = 'test';
// Prevent loading local credentials in this isolated test process.
vi.mock('node:fs', async importOriginal => ({ ...await importOriginal(), existsSync: () => false }));
const { handleUpdate, buildBusinessContext } = await import('./telegram-bot.mjs');
let user, sent, tokens, nextChat = 100;
const refName = ref => typeof ref === 'string' ? ref : String(ref[Symbol.for('functionName')]);
async function send(chatId, text, type = 'private') { await handleUpdate({ message: { chat: { id: chatId, type }, text, from: { id: chatId } } }); }
async function login() { const id = nextChat++; await send(id, '/login tester password'); return id; }
beforeEach(() => {
  user = { username: 'tester', role: 'user', modules: ['parts'] };
  sent = []; tokens = [];
  mock.query.mockReset(); mock.mutation.mockReset();
  mock.mutation.mockImplementation(async (ref, args) => {
    if (refName(ref) === 'auth:login') { tokens.push(args.sessionToken); return { ...user }; }
    return 'saved';
  });
  mock.query.mockImplementation(async ref => refName(ref) === 'auth:currentSession' ? { ...user } : []);
  vi.stubGlobal('fetch', vi.fn(async (_url, options) => { sent.push(JSON.parse(options.body)); return { json: async () => ({ ok: true, result: {} }) }; }));
});
describe('module access', () => {
  it('respects explicit restrictions and root, and prevents activador writes', () => {
    expect(canAccess({ role: 'admin', modules: [] }, 'parts')).toBe(false);
    expect(canAccess({ role: 'root', modules: [] }, 'notes', true)).toBe(true);
    expect(canAccess({ role: 'activador', modules: ['notes'] }, 'notes', true)).toBe(false);
    expect(canAccess({ role: 'unknown', modules: ['parts'] }, 'parts')).toBe(false);
    expect(userModules({ role: 'activador' })).toEqual(['parts', 'partsCustomerPrice']);
    expect(availableCommands({ role: 'user', modules: ['notes'] })).toContain('/cliente');
    expect(availableCommands({ role: 'user', modules: ['parts'] })).not.toContain('/precio');
  });
  it('requires login even when an internal account exists', async () => {
    await send(nextChat++, '/repuestos iphone 11');
    expect(mock.query).not.toHaveBeenCalled();
    expect(sent.at(-1).text).toContain('/login');
  });
  it('hides commands and blocks direct and natural requests without permission', async () => {
    const id = await login();
    expect(sent.at(-1).reply_markup.keyboard.flat().map(x => x.text)).not.toContain('/notas');
    await send(id, '/reparaciones iphone');
    await send(id, 'garantia pantalla iphone 11');
    expect(mock.query.mock.calls.every(([ref]) => refName(ref) === 'auth:currentSession')).toBe(true);
    expect(mock.mutation.mock.calls).toHaveLength(1);
  });
  it('uses the root chat session for repairs and note writes', async () => {
    user = { username: 'root', role: 'root', modules: [] };
    const id = await login();
    await send(id, '/reparaciones iphone');
    await send(id, '/nota prueba');
    const query = mock.query.mock.calls.find(([ref]) => refName(ref) === 'reparaciones:list');
    const mutation = mock.mutation.mock.calls.find(([ref]) => refName(ref) === 'notas:create');
    expect(query[1].sessionToken).toBe(tokens[0]);
    expect(mutation[1].sessionToken).toBe(tokens[0]);
  });
  it('allows custom notes permissions without requiring an admin role', async () => {
    user.modules = ['notes'];
    const id = await login();
    await send(id, '/cliente garantia pantalla');
    expect(mock.query.mock.calls.some(([ref]) => refName(ref) === 'reparaciones:list')).toBe(false);
    expect(mock.mutation.mock.calls.some(([ref]) => refName(ref) === 'notas:create')).toBe(true);
  });
  it('queries only permitted sections of alerts', async () => {
    const id = await login();
    await send(id, '/pendientes');
    expect(mock.query.mock.calls.filter(([ref]) => refName(ref) !== 'auth:currentSession').map(([ref]) => refName(ref))).toEqual(['repuestos:list']);
  });
  it('does not load internal AI inventory for users without parts', async () => {
    user.modules = ['notes'];
    const id = await login();
    const context = await buildBusinessContext(id, 'hola');
    expect(context.text).toBe('');
    expect(mock.query.mock.calls.every(([ref]) => refName(ref) === 'auth:currentSession')).toBe(true);
  });
  it('refreshes permissions and rejects revoked or expired access', async () => {
    const id = await login();
    user.modules = [];
    await send(id, '/repuestos iphone 11');
    expect(sent.at(-1).text).toContain('no tiene permiso');
    mock.query.mockResolvedValue(null);
    await send(id, '/notas');
    expect(sent.at(-1).text).toContain('/login');
  });
  it('omits restricted prices from AI context even if the backend returns them', async () => {
    const id = await login();
    mock.query.mockImplementation(async ref => refName(ref) === 'auth:currentSession' ? { ...user } : [{ name: 'Pantalla iphone 11', brand: 'Apple', model: 'iphone 11', stock: 1, customerPrice: 7654, customerPriceCents: 765400, price: 5432 }]);
    const context = await buildBusinessContext(id, 'iphone 11');
    expect(context.text).toContain('Pantalla');
    expect(context.text).not.toContain('Cliente:');
    expect(context.text).not.toContain('7654');
    expect(context.text).not.toContain('5432');
  });
  it('keeps sessions isolated between chats and requires login after logout', async () => {
    const first = await login();
    const second = await login();
    await send(first, '/repuestos iphone 11');
    await send(second, '/repuestos iphone 11');
    expect(mock.query.mock.calls.filter(([ref]) => refName(ref) === 'repuestos:list').map(([, args]) => args.sessionToken)).toEqual(tokens);
    await send(first, '/logout');
    mock.query.mockClear();
    await send(first, '/repuestos iphone 11');
    expect(mock.query).not.toHaveBeenCalled();
    expect(sent.at(-1).text).toContain('/login');
  });
  it('rejects shared group sessions', async () => {
    await send(nextChat++, '/login root password', 'group');
    expect(mock.mutation).not.toHaveBeenCalled();
    expect(sent.at(-1).text).toContain('chat privado');
  });
  it('lists only own notes for /nota and /notas, including completed notes', async () => {
    user.modules = ['notes'];
    const id = await login();
    mock.query.mockImplementation(async ref => refName(ref) === 'auth:currentSession' ? { ...user } : [
      { text: 'Propia terminada', authorUsername: 'tester', done: true },
      { text: 'Ajena privada', authorUsername: 'other', done: false },
    ]);
    for (const command of ['/nota', '/notas']) {
      await send(id, command);
      expect(sent.at(-1).text).toContain('Propia terminada');
      expect(sent.at(-1).text).toContain('Completada');
      expect(sent.at(-1).text).not.toContain('Ajena privada');
    }
    expect(mock.mutation.mock.calls).toHaveLength(1);
  });
  it('shows root notes from all authors', async () => {
    user.role = 'root';
    const id = await login();
    mock.query.mockImplementation(async ref => refName(ref) === 'auth:currentSession' ? { ...user } : [
      { text: 'Nota ajena', authorUsername: 'other' },
    ]);
    await send(id, '/nota');
    expect(sent.at(-1).text).toContain('Notas de todos los usuarios');
    expect(sent.at(-1).text).toContain('Nota ajena');
  });
});
