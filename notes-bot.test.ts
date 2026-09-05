import { beforeEach, expect, it, vi } from 'vitest';
const auth = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }));
vi.mock('./convex/authorization', () => ({ requireModuleRead: auth.read, requireModuleWrite: auth.write }));
vi.mock('./convex/_generated/server', () => ({ query: (x: unknown) => x, mutation: (x: unknown) => x }));
import { listForBot, create } from './convex/notas';
beforeEach(() => {
  auth.read.mockReset(); auth.write.mockReset();
});
it.each(['user', 'admin', 'activador'])('filters %s notes before applying the result limit', async role => {
  auth.read.mockResolvedValue({ username: 'ana', role });
  const take = vi.fn().mockResolvedValue([]);
  const filter = vi.fn(predicate => {
    expect(predicate({ field: (name: string) => name, eq: (field: string, value: string) => [field, value] })).toEqual(['authorUsername', 'ana']);
    return { take };
  });
  const ctx = { db: { query: () => ({ order: () => ({ filter }) }) } };
  await (listForBot as any).handler(ctx, { sessionToken: 'session' });
  expect(filter).toHaveBeenCalledOnce();
  expect(take).toHaveBeenCalledWith(500);
});
it('lets root list every author', async () => {
  auth.read.mockResolvedValue({ role: 'root' });
  const take = vi.fn().mockResolvedValue(['all']);
  expect(await (listForBot as any).handler({ db: { query: () => ({ order: () => ({ take }) }) } }, { sessionToken: 'session' })).toEqual(['all']);
});
it('stamps the authenticated system author instead of trusting client author fields', async () => {
  auth.write.mockResolvedValue({ username: 'ana', name: 'Ana' });
  const insert = vi.fn().mockResolvedValue('new-note');
  await (create as any).handler({ db: { insert } }, { sessionToken: 'session', text: 'Mi nota', authorUsername: 'root', authorName: 'Root' });
  expect(insert).toHaveBeenCalledWith('notas', { text: 'Mi nota', authorUsername: 'ana', authorName: 'Ana' });
});
