import { canAccess, userModules, availableCommands } from './bot-access.js';
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

loadLocalEnv();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CONVEX_URL = process.env.CONVEX_URL;
const ALLOWED_CHAT_IDS = parseIdList(process.env.TELEGRAM_ALLOWED_CHAT_IDS);
const POLL_TIMEOUT_SECONDS = Number(process.env.TELEGRAM_POLL_TIMEOUT_SECONDS || 25);
const MAX_RESULTS = Number(process.env.TELEGRAM_MAX_RESULTS || 8);
const SUMMARY_RESULTS = Number(process.env.TELEGRAM_SUMMARY_RESULTS || 5);
const LOW_STOCK_THRESHOLD = Number(process.env.TELEGRAM_LOW_STOCK_THRESHOLD || 2);
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const EXA_API_KEY = process.env.EXA_API_KEY;
const EXA_MAX_RESULTS = Number(process.env.EXA_MAX_RESULTS || 5);
const TELEGRAM_FETCH_TIMEOUT_MS = Number(process.env.TELEGRAM_FETCH_TIMEOUT_MS || POLL_TIMEOUT_SECONDS * 1000 + 10000);
const GEMINI_FETCH_TIMEOUT_MS = Number(process.env.GEMINI_FETCH_TIMEOUT_MS || 25000);
const EXA_FETCH_TIMEOUT_MS = Number(process.env.EXA_FETCH_TIMEOUT_MS || 12000);
const REQUIRE_AUTH = process.env.TELEGRAM_REQUIRE_AUTH !== "false";
const SILENT_UNAUTHORIZED = process.env.TELEGRAM_SILENT_UNAUTHORIZED !== "false";
const CONVERSATION_MEMORY_LIMIT = Number(process.env.CONVERSATION_MEMORY_LIMIT || 8);
const TELEGRAM_APP_USERNAME = process.env.TELEGRAM_APP_USERNAME;
const TELEGRAM_APP_PASSWORD = process.env.TELEGRAM_APP_PASSWORD;
const KNOWN_BRANDS = new Map([
  ["apple", "apple"],
  ["iphone", "apple"],
  ["samsung", "samsung"],
  ["galaxy", "samsung"],
  ["motorola", "motorola"],
  ["moto", "motorola"],
  ["xiaomi", "xiaomi redmi"],
  ["redmi", "xiaomi redmi"],
  ["huawei", "huawei"],
  ["honor", "honor"],
  ["zte", "zte"],
  ["tcl", "tcl"],
  ["infinix", "infinix"],
]);
const KNOWN_SUPPLIERS = new Map([
  ["dameray", "dame ray"],
  ["dame ray", "dame ray"],
  ["celularclick", "celular click"],
  ["celular click", "celular click"],
  ["drmovil", "dr movil"],
  ["dr movil", "dr movil"],
]);

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Falta TELEGRAM_BOT_TOKEN en el entorno o en .env.local.");
}

if (!CONVEX_URL) {
  throw new Error("Falta CONVEX_URL en el entorno o en .env.local.");
}

const convex = new ConvexHttpClient(CONVEX_URL);
const telegramApi = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;


const forceReplyMarkup = {
  force_reply: true,
  input_field_placeholder: "Escribe aqui la informacion solicitada",
};
const BOT_RESPONSE_GUIDELINES = [
  "Eres un asistente tecnico y profesional para Doctor Movil.",
  "Responde en espanol mexicano, con tono formal, claro y directo.",
  "No uses bromas, lenguaje casual excesivo ni suposiciones no verificadas.",
  "Tu fuente principal para inventario, stock y precios es Convex.",
  "No inventes productos, precios, disponibilidad, caracteristicas ni procedimientos.",
  "Si un producto o dato no aparece en el inventario interno, responde: No encontre ese dato registrado en inventario.",
  "Si falta informacion para responder, pide una aclaracion concreta.",
  "Si no entiendes el contexto, responde: No entiendo completamente el contexto de tu solicitud. Por favor proporciona mas detalles.",
  "Para preguntas simples, responde breve. Para problemas tecnicos, usa pasos ordenados.",
  "No solicites ni reveles credenciales, contrasenas, tokens, datos privados o informacion sensible.",
  "Si una solicitud requiere revision humana, indicalo de forma clara.",
];
const BUSINESS_CONTEXT = [
  "Doctor Movil es un negocio de venta y reparacion de celulares.",
  "El sistema administra repuestos, reparaciones, ventas, productos, contactos, usuarios, notas, auditoria y respaldos.",
  "La fuente de verdad del inventario, stock y precios es Convex.",
  "El bot de Telegram se usa como asistente operativo para consultas rapidas desde el telefono.",
  "El inventario relevante para el bot son piezas y refacciones: pantallas, baterias, displays, modulos y categorias similares.",
  "Los precios internos y datos operativos deben tratarse como informacion restringida segun permisos de usuario.",
];
const ACTIVE_BOT_SCOPE = [
  "El acceso depende de los modulos del usuario conectado. No sugieras comandos fuera de su lista autorizada.",
  "La atencion a clientes requiere revision humana para decisiones de garantias y quejas.",
];
const BOT_MESSAGES = {
  unknownCommand: "No reconozco ese comando. Usa /ayuda para ver las opciones disponibles.",
  missingContext: "No entiendo completamente el contexto de tu solicitud. Por favor proporciona mas detalles.",
  notRegisteredInInventory: "No encontre ese dato registrado en inventario.",
  actionCancelled: "Accion pendiente cancelada.",
  loginRequired: "Para consultar esa informacion primero inicia sesion con /login.",
  adminRequired: "Esta informacion solo esta disponible para usuarios root o administradores.",
  generalError: "No pude completar la solicitud. Revisa la consola del bot para ver el detalle tecnico.",
  memoryReset: "Memoria conversacional del chat borrada.",
  aiNotConfigured: "La funcion de IA no esta disponible porque falta GOOGLE_AI_API_KEY en .env.local.",
  researchNotConfigured: "Para responder esa consulta tecnica necesito GOOGLE_AI_API_KEY configurado en .env.local.",
  sensitiveRequestDenied:
    "No puedo solicitar, mostrar ni recuperar credenciales, contrasenas, tokens o datos privados. Indica que operacion necesitas realizar y te puedo orientar con un procedimiento seguro.",
  aiUnavailable:
    "No pude completar la consulta de IA en este momento. Intenta de nuevo o usa un comando directo como /repuestos, /precio o /stock_bajo.",
  greeting:
    "Hola. Soy el asistente tecnico de Doctor Movil. Puedo ayudarte con inventario de repuestos, stock, precios a cliente final y consultas operativas disponibles.",
  futureCustomerSupport:
    "Esa solicitud corresponde a atencion a clientes. Por ahora puedo orientarte con inventario y repuestos; para este caso se requiere revision manual.",
  customerSupportPrompt:
    "Describe el caso de atencion a clientes. Incluye solo lo necesario: numero de reparacion si existe, modelo del equipo y motivo de la solicitud.",
  onlyParts:
    "Por ahora el bot esta configurado para consultar repuestos e inventario. Escribe /repuestos seguido de una marca o modelo. Ejemplo: /repuestos iPhone 11.",
  partsQualifier:
    "Para revisar inventario necesito una marca, modelo o tipo de pieza. Ejemplo: iPhone 11, Samsung A12, Motorola G20 o bateria Huawei.",
  priceQualifier:
    "Para revisar precio a cliente final necesito una marca o modelo. Ejemplo: iPhone 11, Samsung A12 o Motorola G20.",
  repairSearchQualifier: "Escribe el dato de la reparacion que quieres buscar. Ejemplo: /reparaciones samsung",
  repairNumberQualifier: "Escribe un numero de reparacion valido. Ejemplo: /reparacion 1205",
  noRepairsFound: "No encontre reparaciones con esa busqueda.",
  noOperationalAlerts: "No hay pendientes operativos registrados por ahora.",
  noNotes: "No hay notas pendientes registradas.",
  noteQualifier: "Escribe el texto de la nota. Ejemplo: /nota pedir pantalla iphone 11",
  noteSaved: "Nota guardada.",
  usernamePrompt: "Escribe tu usuario.",
  passwordPrompt: "Ahora escribe tu contrasena.",
  loggedOut: "Sesion cerrada.",
};
const INTENT_TYPES = {
  CUSTOMER_SUPPORT: "customer_support",
  GREETING: "greeting",
  PARTS_LOOKUP: "parts_lookup",
  PRICE_LOOKUP: "price_lookup",
  RESEARCH: "research",
  UNKNOWN: "unknown",
};

let offset = 0;
const conversationHistoryByChat = new Map();
const pendingIntentByChat = new Map();
const userSessionByChat = new Map();
const convexSessionToken = crypto.randomUUID();
let convexSessionReady = false;
const PART_GENERIC_WORDS = new Set([
  "hay",
  "tienes",
  "tiene",
  "tendras",
  "quiero",
  "busco",
  "buscar",
  "consulta",
  "consultar",
  "repuesto",
  "repuestos",
  "stock",
  "inventario",
  "pieza",
  "piezas",
  "pantalla",
  "pantallas",
  "bateria",
  "baterias",
  "display",
  "modulo",
  "para",
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "un",
  "una",
  "unos",
  "unas",
  "en",
  "por",
  "favor",
  "precio",
  "precios",
  "costo",
  "costos",
  "cuanto",
  "cuantos",
  "cuantas",
  "me",
  "puedes",
  "checar",
  "revisar",
]);

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun && process.argv.includes("--self-test")) {
  runSelfTest();
} else if (isDirectRun) {
  await main();
}

async function main() {
  logInfo("telegram", "Bot de Telegram iniciado.");
  recordBotAuditEvent("BOT_INICIO", "Bot de Telegram iniciado.", { pid: process.pid });
  if (ALLOWED_CHAT_IDS.size === 0) {
    logWarn("telegram", "TELEGRAM_ALLOWED_CHAT_IDS no esta definido: solo /mi_chat_id estara disponible.");
  }
  if (!GOOGLE_AI_API_KEY) {
    logWarn("gemini", "GOOGLE_AI_API_KEY no esta definido: el comando /ia quedara desactivado.");
  }
  if (!EXA_API_KEY) {
    logWarn("exa", "EXA_API_KEY no esta definido: /ia solo usara contexto interno de Convex.");
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  while (true) {
    try {
      const updates = await telegram("getUpdates", {
        offset,
        timeout: POLL_TIMEOUT_SECONDS,
        allowed_updates: ["message"],
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        await handleUpdate(update);
      }
    } catch (error) {
      logError("telegram", "Error en polling.", error);
      await sleep(2500);
    }
  }
}

async function handleUpdate(update) {
  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim();

  if (!chatId || !text) return;

  const [commandToken = "", ...rest] = text.split(/\s+/);
  const command = commandToken.split("@")[0].toLowerCase();
  const args = rest.join(" ").trim();

  if (command === "/mi_chat_id" || command === "/chat_id") {
    await sendMessage(chatId, `Tu chat_id es: ${chatId}`);
    return;
  }

  if (!isAuthorized(chatId)) {
    logWarn("telegram", "Chat no autorizado intento usar el bot.", { chatId });
    recordBotAuditEvent("BOT_CHAT_NO_AUTORIZADO", "Chat no autorizado intento usar el bot.", { chatId });
    if (!SILENT_UNAUTHORIZED) {
      await sendMessage(chatId, "Este chat no esta autorizado para usar el bot.");
    }
    return;
  }

  if (message.chat.type !== 'private') {
    await sendMessage(chatId, 'Para usar tu sesion del sistema, abre un chat privado con el bot.');
    return;
  }
  try {
    recordBotAuditEvent("BOT_COMANDO", `Comando recibido: ${text.startsWith("/") ? command : "texto"}`, {
      chatId,
      command: text.startsWith("/") ? command : "texto",
      hasArgs: Boolean(args),
    });
    const pendingIntent = pendingIntentByChat.get(String(chatId));
    if (pendingIntent && pendingIntent.type === "login_username" && !text.startsWith("/")) {
      pendingIntentByChat.set(String(chatId), {
        type: "login_password",
        username: text,
      });
      await sendMessage(chatId, BOT_MESSAGES.passwordPrompt);
      return;
    }
    if (pendingIntent && pendingIntent.type === "login_password" && !text.startsWith("/")) {
      pendingIntentByChat.delete(String(chatId));
      await completeChatLogin(chatId, pendingIntent.username, text);
      return;
    }

    if (pendingIntent && !text.startsWith("/")) {
      pendingIntentByChat.delete(String(chatId));
      if (pendingIntent.type === "parts_search") {
        await searchParts(chatId, text, pendingIntent.options || {});
        return;
      }
      if (pendingIntent.type === "ai_question") {
        await answerWithAi(chatId, text);
        return;
      }
      if (pendingIntent.type === "customer_support") {
        await handleCustomerSupportRequest(chatId, text, message.from);
        return;
      }
    }

    switch (command) {
      case "/start":
      case "/menu":
        await sendMenu(chatId);
        break;
      case "/help":
      case "/ayuda":
        await sendHelp(chatId);
        break;
      case "/login":
        await loginChatUser(chatId, args);
        break;
      case "/cancelar":
        pendingIntentByChat.delete(String(chatId));
        await sendMessage(chatId, BOT_MESSAGES.actionCancelled);
        break;
      case "/logout":
        await logoutChatUser(chatId);
        break;
      case "/mi_usuario":
        await sendCurrentChatUser(chatId);
        break;
      case "/estado":
      case "/status":
        await sendBotStatus(chatId);
        break;
      case "/buscar":
        await searchParts(chatId, args);
        break;
      case "/resumen":
        await sendDailySummary(chatId);
        break;
      case "/stock_bajo":
      case "/bajo_stock":
        await sendLowStock(chatId);
        break;
      case "/pendientes":
      case "/alertas":
        await sendOperationalAlerts(chatId);
        break;
      case "/reparaciones":
      case "/reparacion":
      case "/notas":
      case "/nota":
        if (command === "/reparaciones") await searchRepairs(chatId, args);
        if (command === "/reparacion") await searchRepairByNumber(chatId, args);
        if (command === "/notas") await listNotes(chatId);
        if (command === "/nota") {
          if (args) await createNote(chatId, message.from, args);
          else await listNotes(chatId);
        }
        break;
      case "/repuestos":
      case "/inventario":
        await searchParts(chatId, args);
        break;
      case "/stock":
        await searchParts(chatId, args, { onlyWithStock: true });
        break;
      case "/precio":
      case "/precio_cliente":
        await searchParts(chatId, args, { priceOnly: true });
        break;
      case "/cliente":
      case "/atencion":
        await handleCustomerSupportRequest(chatId, args, message.from);
        break;
      case "/ia":
      case "/ai":
        await answerWithAi(chatId, args);
        break;
      case "/web":
      case "/investigar":
        await answerWithAi(chatId, args, { forceWebReferences: true });
        break;
      case "/reset":
      case "/reiniciar":
        conversationHistoryByChat.delete(String(chatId));
        pendingIntentByChat.delete(String(chatId));
        await sendMessage(chatId, BOT_MESSAGES.memoryReset);
        break;
      default:
        await routeNaturalMessage(chatId, text);
    }
  } catch (error) {
    logError("telegram", `Error atendiendo ${text.startsWith('/') ? command : 'texto'}.`, error, { chatId });
    if (error.code === "MISSING_BOT_CREDENTIALS") {
      await sendMessage(
        chatId,
        "Encontre la busqueda, pero para mostrar precios necesito configurar TELEGRAM_APP_USERNAME y TELEGRAM_APP_PASSWORD en .env.local.",
      );
      return;
    }
    if (error.code === "LOGIN_REQUIRED") {
      await sendMessage(chatId, BOT_MESSAGES.loginRequired);
      return;
    }
    if (error.code === 'MODULE_REQUIRED') {
      await sendMessage(chatId, error.message);
      return;
    }
    if (error.code === "ADMIN_REQUIRED") {
      await sendMessage(chatId, BOT_MESSAGES.adminRequired);
      return;
    }
    await sendMessage(chatId, BOT_MESSAGES.generalError);
  }
}

async function sendHelp(chatId) { await sendMenu(chatId); }
async function sendMenu(chatId) {
  const session = await getActiveChatSession(chatId);
  const commands = availableCommands(session?.user);
  const keyboard = [];
  for (let i = 0; i < commands.length; i += 2) keyboard.push(commands.slice(i, i + 2).map(text => ({ text })));
  await sendMessage(chatId, [
    'Menu del bot',
    session ? 'Usuario: ' + session.user.username + ' | Rol: ' + session.user.role : 'Inicia sesion con /login para consultar datos del sistema.',
    session ? 'Modulos del sistema (' + userModules(session.user).length + '): ' + userModules(session.user).join(', ') : '',
    'Comandos disponibles:', ...commands,
    'Los modulos sin comandos propios se consultan desde la web.',
  ].filter(Boolean).join('\n'), { reply_markup: { keyboard, resize_keyboard: true } });
}

async function sendOnlyPartsMessage(chatId) {
  await sendMessage(
    chatId,
    BOT_MESSAGES.onlyParts,
  );
}

async function routeNaturalMessage(chatId, text) {
  if (text.startsWith("/")) {
    await sendMessage(chatId, BOT_MESSAGES.unknownCommand);
    return;
  }

  if (isSensitiveCredentialRequest(text)) {
    await sendMessage(chatId, BOT_MESSAGES.sensitiveRequestDenied);
    return;
  }

  const intent = detectMessageIntent(text);

  switch (intent.type) {
    case INTENT_TYPES.RESEARCH:
      if (GOOGLE_AI_API_KEY) {
        await answerWithAi(chatId, text);
      } else {
        await sendMessage(chatId, BOT_MESSAGES.researchNotConfigured);
      }
      break;
    case INTENT_TYPES.PRICE_LOOKUP:
      await searchParts(chatId, text, { priceOnly: true });
      break;
    case INTENT_TYPES.PARTS_LOOKUP:
      await searchParts(chatId, text);
      break;
    case INTENT_TYPES.GREETING:
      await sendMessage(chatId, BOT_MESSAGES.greeting);
      break;
    case INTENT_TYPES.CUSTOMER_SUPPORT:
      await handleCustomerSupportRequest(chatId, text);
      break;
    default:
      if (GOOGLE_AI_API_KEY) {
        await answerWithAi(chatId, text);
      } else {
        await sendMessage(chatId, BOT_MESSAGES.missingContext);
      }
  }
}

async function handleCustomerSupportRequest(chatId, text, from) {
  const session = await requireChatModule(chatId, 'notes', true);
  if (!text) {
    pendingIntentByChat.set(String(chatId), { type: "customer_support" });
    await sendMessage(chatId, BOT_MESSAGES.customerSupportPrompt, { reply_markup: forceReplyMarkup });
    return;
  }

  await sendChatAction(chatId, "typing");
  const relatedRepairs = await (canAccess(session.user, 'repairs') ? findCustomerSupportRepairs(chatId, text) : Promise.resolve([])).catch((error) => {
    logError("convex", "No se pudieron consultar reparaciones para /cliente.", error, { chatId });
    return [];
  });
  const caseType = detectCustomerSupportCaseType(text);
  const noteSaved = await createCustomerSupportNote({ chatId, from, text, caseType, relatedRepairs }).catch((error) => {
    logError("convex", "No se pudo guardar el caso de cliente.", error, { chatId, caseType });
    return false;
  });
  await sendMessage(chatId, formatCustomerSupportEscalation(text, relatedRepairs, { noteSaved }));
}

async function createCustomerSupportNote({ chatId, from, text, caseType, relatedRepairs = [] }) {
  const authorName = [from?.first_name, from?.last_name].filter(Boolean).join(" ") || "Telegram";
  const authorUsername = from?.username ? `@${from.username}` : String(from?.id || chatId || "telegram");
  const now = new Date().toISOString();
  const relatedRepairNumbers = relatedRepairs
    .slice(0, 3)
    .map((repair) => `#${repair.repairNumber}`)
    .join(", ");

  const session = await requireChatModule(chatId, 'notes', true);

  await convex.mutation(api.notas.create, {
    sessionToken: session.sessionToken,
    sourceId: `telegram:cliente:${chatId}:${now}`,
    text: [
      `[Cliente] ${caseType}`,
      `Solicitud: ${text}`,
      relatedRepairNumbers ? `Reparaciones relacionadas: ${relatedRepairNumbers}` : "Reparaciones relacionadas: no encontradas",
      `Origen: Telegram ${authorUsername}`,
    ].join("\n"),
    authorName,
    authorUsername,
    done: false,
    createdAt: now,
    updatedAt: now,
  });

  recordBotAuditEvent("BOT_CLIENTE_GUARDADO", "Caso de cliente guardado como pendiente interno.", {
    chatId,
    caseType,
    relatedRepairs: relatedRepairs.slice(0, 3).map((repair) => repair.repairNumber),
  });

  return true;
}

async function searchRepairs(chatId, search) {
  await requireChatModule(chatId, 'repairs');
  if (!search) {
    await sendMessage(chatId, BOT_MESSAGES.repairSearchQualifier);
    return;
  }

  const repairs = await listRepairsForBot(chatId, { search, limit: 20 });

  if (repairs.length === 0) {
    await sendMessage(chatId, BOT_MESSAGES.noRepairsFound);
    return;
  }

  await sendMessage(chatId, formatRepairs(repairs.slice(0, MAX_RESULTS)));
}

async function searchRepairByNumber(chatId, repairNumber) {
  await requireChatModule(chatId, 'repairs');
  const normalized = repairNumber.trim();
  if (!/^\d+$/.test(normalized)) {
    await sendMessage(chatId, BOT_MESSAGES.repairNumberQualifier);
    return;
  }

  const repairs = await listRepairsForBot(chatId, { search: normalized, limit: 20 });
  const exact = repairs.filter((repair) => String(repair.repairNumber) === normalized);

  if (exact.length === 0) {
    await sendMessage(chatId, `No encontre la reparacion #${normalized}.`);
    return;
  }

  await sendMessage(chatId, formatRepairs(exact.slice(0, MAX_RESULTS)));
}

async function operationalReport(chatId, summary = false) {
  const session = await requireChatModule(chatId, summary ? 'statistics' : undefined);
  const user = session.user;
  const sections = [];
  if (canAccess(user, 'repairs')) {
    const repairs = await listRepairsForBot(chatId, { limit: 1000 });
    sections.push(formatShortRepairList('Listas para entregar', getReadyRepairs(repairs).slice(0, MAX_RESULTS)));
    sections.push(formatShortRepairList('Por vencer o vencidas', getDueRepairAlerts(repairs).slice(0, MAX_RESULTS)));
    if (summary) {
      const today = repairs.filter(r => isSameLocalDay(r.createdAt, new Date()));
      sections.push('Reparaciones ingresadas hoy: ' + today.length);
      sections.push('Reparaciones entregadas hoy: ' + repairs.filter(r => isSameLocalDay(r.deliveredAt, new Date())).length);
      sections.push('Ingreso potencial de reparaciones nuevas: ' + formatCurrency(today.reduce((sum, r) => sum + Number(r.repairPrice || 0), 0)));
    }
  }
  if (canAccess(user, 'parts')) sections.push(formatShortPartList('Stock bajo', getLowStockParts(await listPartsForBot(chatId)).slice(0, MAX_RESULTS)));
  if (canAccess(user, 'statistics')) sections.push(formatCatalogPending((await listCatalogPendingForBot(chatId)).slice(0, MAX_RESULTS)));
  if (canAccess(user, 'notes')) sections.push('Notas pendientes: ' + (await listNotesForBot(chatId)).filter(n => !n.done).length);
  await sendMessage(chatId, [summary ? 'Resumen de hoy' : 'Pendientes operativos', 'Solo se incluyen tus modulos autorizados.', ...sections.filter(Boolean), sections.length ? '' : 'No tienes modulos operativos disponibles.'].filter(Boolean).join('\n\n'));
}
async function sendDailySummary(chatId) { await operationalReport(chatId, true); }
async function sendOperationalAlerts(chatId) { await operationalReport(chatId); }
async function sendLowStock(chatId) {
  const parts = getLowStockParts(await listPartsForBot(chatId)).slice(0, MAX_RESULTS);
  await sendMessage(chatId, parts.length ? formatShortPartList('Stock bajo', parts) : 'No hay repuestos con stock bajo.');
}

async function loginChatUser(chatId, args) {
  const [username = "", ...passwordParts] = String(args || "").trim().split(/\s+/);
  const password = passwordParts.join(" ");

  if (!username) {
    pendingIntentByChat.set(String(chatId), { type: "login_username" });
    await sendMessage(chatId, BOT_MESSAGES.usernamePrompt);
    return;
  }

  if (!password) {
    pendingIntentByChat.set(String(chatId), {
      type: "login_password",
      username,
    });
    await sendMessage(chatId, BOT_MESSAGES.passwordPrompt);
    return;
  }

  await completeChatLogin(chatId, username, password);
}

async function completeChatLogin(chatId, username, password) {
  const sessionToken = crypto.randomUUID();
  const user = await convex.mutation(api.auth.login, {
    username,
    password,
    sessionToken,
  });

  conversationHistoryByChat.delete(String(chatId));
  userSessionByChat.set(String(chatId), { sessionToken, user });
  pendingIntentByChat.delete(String(chatId));
  await sendMessage(chatId, `Sesion iniciada como ${user.username}. Si necesitas ayuda usa /menu.`);
  await sendMenu(chatId);
}

async function logoutChatUser(chatId) {
  const session = userSessionByChat.get(String(chatId));
  if (session?.sessionToken) {
    await convex.mutation(api.auth.logout, { sessionToken: session.sessionToken }).catch(() => null);
  }

  userSessionByChat.delete(String(chatId));
  pendingIntentByChat.delete(String(chatId));
  conversationHistoryByChat.delete(String(chatId));
  await sendMessage(chatId, BOT_MESSAGES.loggedOut);
  await sendMenu(chatId);
}

async function sendBotStatus(chatId) {
  const session = await getActiveChatSession(chatId);
  await sendMessage(
    chatId,
    formatTemplate({
      title: "Estado del bot",
      sections: [
        {
          title: "Servicios",
          lines: [
            `Telegram: activo`,
            `Convex: ${CONVEX_URL ? "configurado" : "no configurado"}`,
            `IA: ${GOOGLE_AI_API_KEY ? "configurada" : "no configurada"}`,
            `Exa: ${EXA_API_KEY ? "configurado" : "no configurado"}`,
          ],
        },
        {
          title: "Modo operativo",
          lines: [
            `Acceso: segun los modulos del usuario conectado`,
            `Resultados maximos: ${MAX_RESULTS}`,
            `Resumenes maximos: ${SUMMARY_RESULTS}`,
            `Stock bajo: ${LOW_STOCK_THRESHOLD} o menos`,
          ],
        },
        {
          title: "Sesion del chat",
          lines: session
            ? [`Usuario: ${session.user.username}`, `Rol: ${session.user.role}`]
            : ["Sin sesion iniciada. Usa /login si necesitas datos restringidos."],
        },
      ],
      footer: "Este reporte no muestra tokens, contrasenas ni llaves API.",
    }),
  );
}

async function sendCurrentChatUser(chatId) {
  const session = await getActiveChatSession(chatId);
  if (!session) {
    await sendMessage(chatId, BOT_MESSAGES.loginRequired);
    return;
  }

  const modules = userModules(session.user);
  await sendMessage(
    chatId,
    [`Estas conectado como ${session.user.username}.`, `Rol: ${session.user.role}`, modules.length ? `Permisos: ${modules.join(", ")}` : null]
      .filter(Boolean)
      .join("\n"),
  );
}

async function searchParts(chatId, search, options = {}) {
  await getPartsSessionToken(chatId, { requirePrices: options.priceOnly });
  if (needsPartQualifier(search)) {
    pendingIntentByChat.set(String(chatId), {
      type: "parts_search",
      options,
    });
    await sendMessage(
      chatId,
      options.priceOnly
        ? BOT_MESSAGES.priceQualifier
        : BOT_MESSAGES.partsQualifier,
      { reply_markup: forceReplyMarkup },
    );
    return;
  }

  const parts = await listPartsForBot(chatId, { requirePrices: options.priceOnly });
  if (!options.priceOnly && isBrandOnlySearch(search, parts)) {
    await sendMessage(chatId, formatBrandModelSummary(parts, search));
    return;
  }

  const allMatches = findMatchingParts(parts, search)
    .filter((part) => !options.onlyWithStock || Number(part.stock) > 0);
  const matches = allMatches.slice(0, MAX_RESULTS);

  if (matches.length === 0) {
    await sendMessage(chatId, BOT_MESSAGES.notRegisteredInInventory);
    return;
  }

  await sendMessage(
    chatId,
    options.priceOnly
      ? formatCustomerPrices(matches, { total: allMatches.length })
      : formatParts(matches, { total: allMatches.length }),
  );
}

async function listNotes(chatId) {
  const session = await requireChatModule(chatId, 'notes');
  const notes = await listNotesForBot(chatId);
  const visibleNotes = notes.slice(0, MAX_RESULTS);

  if (visibleNotes.length === 0) {
    await sendMessage(chatId, session.user.role === 'root' ? 'No hay notas registradas.' : 'No tienes notas registradas con tu usuario.');
    return;
  }

  await sendMessage(
    chatId,
    [session.user.role === 'root' ? 'Notas de todos los usuarios' : `Mis notas (${session.user.username})`,
      `Mostrando ${visibleNotes.length} de ${notes.length}${notes.length === 500 ? ' o mas' : ''}.`,
      ...visibleNotes.map((note, index) => `${index + 1}. [${note.done ? 'Completada' : 'Pendiente'}] ${note.text}\nPor: ${note.authorName || note.authorUsername}`),
      'Para crear una nota: /nota texto de la nota',
    ].join("\n\n"),
  );
}

async function createNote(chatId, from, text) {
  await requireChatModule(chatId, 'notes', true);
  if (!text) {
    await sendMessage(chatId, BOT_MESSAGES.noteQualifier);
    return;
  }

  const authorName = [from?.first_name, from?.last_name].filter(Boolean).join(" ") || "Telegram";
  const authorUsername = from?.username ? `@${from.username}` : String(from?.id || "telegram");
  const now = new Date().toISOString();

  const session = await requireChatModule(chatId, 'notes', true);

  await convex.mutation(api.notas.create, {
    sessionToken: session.sessionToken,
    sourceId: `telegram:${from?.id || "unknown"}:${now}`,
    text,
    authorName,
    authorUsername,
    done: false,
    createdAt: now,
    updatedAt: now,
  });

  await sendMessage(chatId, BOT_MESSAGES.noteSaved);
}

async function answerWithAi(chatId, question, options = {}) {
  const session = await requireChatModule(chatId);
  if (!GOOGLE_AI_API_KEY) {
    await sendMessage(chatId, BOT_MESSAGES.aiNotConfigured);
    return;
  }

  if (!question) {
    pendingIntentByChat.set(String(chatId), { type: "ai_question" });
    await sendMessage(
      chatId,
      "Escribe la consulta tecnica que quieres revisar. Ejemplo: que repuestos tienen poco stock?",
      { reply_markup: forceReplyMarkup },
    );
    return;
  }

  if (isSensitiveCredentialRequest(question)) {
    await sendMessage(chatId, BOT_MESSAGES.sensitiveRequestDenied);
    return;
  }

  if (isPartsQuestion(question) && needsPartQualifier(question)) {
    pendingIntentByChat.set(String(chatId), {
      type: "parts_search",
      options: { fromAiPrompt: true },
    });
    const response = BOT_MESSAGES.partsQualifier;
    rememberConversation(chatId, "Usuario", question);
    rememberConversation(chatId, "Bot", response);
    await sendMessage(chatId, response);
    return;
  }

  await sendChatAction(chatId, "typing");

  const contextResult = await buildBusinessContext(chatId, question, options);
  const context = contextResult.text;
  const history = getConversationHistory(chatId);
  const prompt = [
    ...BOT_RESPONSE_GUIDELINES,
    "",
    "Contexto del negocio:",
    ...BUSINESS_CONTEXT,
    "",
    "Alcance actual:",
    ...ACTIVE_BOT_SCOPE,
    `Comandos autorizados: ${availableCommands(session.user).join(', ')}`,
    "Usa el contexto interno de Convex como fuente principal para stock, precios e inventario real.",
    "Usa las referencias web solo como informacion externa de apoyo.",
    "Distingue claramente entre inventario interno y referencias de internet.",
    "Puedes explicar que comando usar si conviene consultar algo exacto.",
    "Si el contexto no alcanza, no intentes completar la respuesta con suposiciones.",
    "Cuando aplique, sugiere el comando exacto que podria ayudar.",
    "",
    history ? `Historial reciente:\n${history}\n` : "",
    `Pregunta: ${question}`,
    "",
    "Contexto:",
    context || "No se encontro contexto relevante en Convex para esta pregunta.",
  ].join("\n");
  const answer = await askGemini(prompt).catch((error) => {
    logError("gemini", "Gemini no pudo responder.", error, { chatId });
    return BOT_MESSAGES.aiUnavailable;
  });

  rememberConversation(chatId, "Usuario", question);
  rememberConversation(chatId, "Bot", answer);
  await sendMessage(chatId, appendExternalReferenceStatus(answer, contextResult.web));
}

async function buildBusinessContext(chatId, question, options = {}) {
  const session = await requireChatModule(chatId);
  const parts = canAccess(session.user, 'parts') ? await listPartsForBot(chatId) : [];
  const matchingParts = findMatchingParts(parts, question).slice(0, 12);
  const lowStockParts = parts.filter((part) => Number(part.stock) <= 2).slice(0, 12);
  const shouldUseWeb = shouldUseWebReferences(question, matchingParts, options);
  const webReferences = shouldUseWeb ? await searchExaForBot(question, matchingParts, options).catch((error) => {
    logError("exa", "Exa no pudo responder.", error);
    return [];
  }) : [];
  const webStatus = getExternalReferenceStatus({ shouldUseWeb, webReferences });

  const text = [
    matchingParts.length ? `Inventario interno encontrado en Convex:\n${formatParts(matchingParts)}` : "",
    lowStockParts.length ? `Inventario interno con stock bajo:\n${formatParts(lowStockParts)}` : "",
    webReferences.length ? `Referencias externas encontradas con Exa:\n${formatExaReferences(webReferences)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 12000);

  return { text, web: webStatus };
}

async function searchExaForBot(question, matchingParts = [], options = {}) {
  if (!EXA_API_KEY) return [];
  if (!shouldUseWebReferences(question, matchingParts, options)) return [];

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXA_API_KEY,
    },
    signal: AbortSignal.timeout(EXA_FETCH_TIMEOUT_MS),
    body: JSON.stringify({
      query: buildExaQuery(question, matchingParts),
      type: "auto",
      numResults: Math.min(Math.max(EXA_MAX_RESULTS, 1), 10),
      contents: {
        highlights: true,
      },
    }),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createServiceError("Exa no pudo buscar referencias.", {
      status: response.status,
      statusText: response.statusText,
      detail: result.error || result.message,
    });
  }

  return Array.isArray(result.results) ? result.results : [];
}

async function ensureConvexSession() {
  if (!TELEGRAM_APP_USERNAME || !TELEGRAM_APP_PASSWORD) {
    const error = new Error("Faltan TELEGRAM_APP_USERNAME y TELEGRAM_APP_PASSWORD para consultar datos privados del bot.");
    error.code = "MISSING_BOT_CREDENTIALS";
    throw error;
  }
  if (convexSessionReady) return;

  await convex.mutation(api.auth.login, {
    username: TELEGRAM_APP_USERNAME,
    password: TELEGRAM_APP_PASSWORD,
    sessionToken: convexSessionToken,
  });
  convexSessionReady = true;
}

async function getActiveChatSession(chatId) {
  if (!chatId) return null;

  const session = userSessionByChat.get(String(chatId));
  if (!session?.sessionToken) return null;

  const user = await convex.query(api.auth.currentSession, { sessionToken: session.sessionToken }).catch(() => null);
  if (!user) {
    userSessionByChat.delete(String(chatId));
    conversationHistoryByChat.delete(String(chatId));
    pendingIntentByChat.delete(String(chatId));
    return null;
  }

  if (JSON.stringify(session.user) !== JSON.stringify(user)) conversationHistoryByChat.delete(String(chatId));
  session.user = user;
  userSessionByChat.set(String(chatId), session);
  return session;
}

async function requireChatModule(chatId, module, write = false) {
  const session = await getActiveChatSession(chatId);
  if (!session) throw Object.assign(new Error(BOT_MESSAGES.loginRequired), { code: 'LOGIN_REQUIRED' });
  if (module && !canAccess(session.user, module, write)) {
    throw Object.assign(new Error('Tu usuario no tiene permiso ' + (write ? 'de escritura' : 'de lectura') + ' en el modulo ' + module + '.'), { code: 'MODULE_REQUIRED' });
  }
  return session;
}
async function getPartsSessionToken(chatId, options = {}) {
  const session = await requireChatModule(chatId, 'parts');
  if (options.requirePrices) await requireChatModule(chatId, 'partsCustomerPrice');
  return session.sessionToken;
}
async function listPartsForBot(chatId, options = {}) {
  const sessionToken = await getPartsSessionToken(chatId, options);
  const session = await requireChatModule(chatId, 'parts');
  const parts = await convex.query(api.repuestos.list, { sessionToken });
  return parts.map(part => {
    const result = { ...part };
    if (!canAccess(session.user, 'partsCustomerPrice')) {
      delete result.customerPrice;
      delete result.customerPriceCents;
    }
    if (!canAccess(session.user, 'partsCost')) {
      delete result.price;
      delete result.priceCents;
    }
    return result;
  });
}
async function listRepairsForBot(chatId, options = {}) {
  const session = await requireChatModule(chatId, 'repairs');
  return convex.query(api.reparaciones.list, { sessionToken: session.sessionToken, ...options });
}
async function listNotesForBot(chatId) {
  const session = await requireChatModule(chatId, 'notes');
  const notes = await convex.query(api.notas.listForBot, { sessionToken: session.sessionToken });
  const pendingNotes = notes.filter(note => !note.done);
  return session.user.role === 'root' ? pendingNotes : pendingNotes.filter(note => note.authorUsername === session.user.username);
}
async function listCatalogPendingForBot(chatId) {
  const session = await requireChatModule(chatId, 'statistics');
  return convex.query(api.catalogoPendientes.list, { sessionToken: session.sessionToken, status: 'pending', limit: 100 });
}

async function askGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GOOGLE_AI_API_KEY,
      },
      signal: AbortSignal.timeout(GEMINI_FETCH_TIMEOUT_MS),
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createServiceError("Gemini no pudo responder.", {
      status: response.status,
      statusText: response.statusText,
      detail: result.error?.message,
    });
  }

  const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  return text || "Gemini no devolvio una respuesta con texto.";
}

function formatRepairs(repairs) {
  return repairs
    .map((repair) =>
      [
        `#${repair.repairNumber} - ${repair.customer}`,
        `${formatDeviceLabel(repair)} (${repair.deviceType || "Equipo"})`,
        `Trabajo: ${repair.repairType}`,
        `Estado: ${repair.status}`,
        `Telefono: ${repair.phone || "sin telefono"}`,
        `Precio: ${formatCurrency(repair.repairPrice)}`,
        repair.notes ? `Notas: ${repair.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
}

function formatParts(parts, options = {}) {
  const body = parts
    .map((part) =>
      [
        `${part.name}`,
        `${part.brand} ${part.model} - ${part.category}`,
        `Calidad: ${part.quality}`,
        `Stock: ${part.stock}`,
        part.customerPrice !== undefined || part.customerPriceCents !== undefined ? `Cliente: ${formatCustomerPriceLabel(part)}` : null,
        part.supplier ? `Proveedor: ${part.supplier}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  return withResultSummary("Repuestos encontrados", body, parts.length, options.total);
}

function formatCustomerPrices(parts, options = {}) {
  const body = parts
    .map((part) =>
      [
        `${part.name}`,
        `${part.brand} ${part.model} - ${part.category}`,
        `Stock: ${part.stock}`,
        `Precio cliente final: ${formatCustomerPriceLabel(part)}`,
      ].join("\n"),
    )
    .join("\n\n");

  return withResultSummary("Precios encontrados", body, parts.length, options.total);
}

function formatExaReferences(results) {
  return results
    .slice(0, EXA_MAX_RESULTS)
    .map((result, index) => {
      const highlights = Array.isArray(result.highlights) ? result.highlights : [];
      const highlight = highlights
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" ")
        .slice(0, 700);

      return [
        `${index + 1}. ${result.title || "Referencia sin titulo"}`,
        result.url ? `URL: ${result.url}` : null,
        result.publishedDate ? `Fecha publicada: ${result.publishedDate}` : null,
        highlight ? `Resumen relevante: ${highlight}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function formatShortRepairList(title, repairs, options = {}) {
  if (!repairs.length) return "";

  return [
    `${title}:`,
    ...repairs.map((repair) => {
      const dueLabel = repair.estimatedDeliveryAt ? ` | vence ${formatDateLabel(repair.estimatedDeliveryAt)}` : "";
      return `#${repair.repairNumber} ${repair.customer || "Sin cliente"} - ${formatDeviceLabel(repair)} - ${repair.status}${dueLabel}`;
    }),
    formatMoreResultsFooter(repairs.length, options.total),
  ].filter(Boolean).join("\n");
}

function formatDeviceLabel(repair) {
  const brand = String(repair?.brand || "").trim();
  const model = String(repair?.model || "").trim();
  if (!brand && !model) return String(repair?.deviceType || "Equipo").trim();
  if (!brand) return model;
  if (!model) return brand;
  if (normalize(brand) === normalize(model)) return brand;
  return `${brand} ${model}`;
}

function formatShortPartList(title, parts, options = {}) {
  if (!parts.length) return "";

  return [
    `${title}:`,
    ...parts.map((part) => `${part.name} - ${part.brand} ${part.model} | stock ${Number(part.stock) || 0}`),
    formatMoreResultsFooter(parts.length, options.total),
  ].filter(Boolean).join("\n");
}

function formatCatalogPending(pendingItems) {
  if (!pendingItems.length) return "";

  return [
    "Pendientes de catalogo:",
    ...pendingItems.map((item) => `#${item.repairNumber} ${item.brand} ${item.model} - ${item.partName}`),
  ].join("\n");
}

function formatCustomerSupportEscalation(text, relatedRepairs = [], options = {}) {
  const caseType = detectCustomerSupportCaseType(text);
  const guidance = getCustomerSupportGuidance(caseType, relatedRepairs);
  return formatTemplate({
    title: "Atencion a clientes",
    subtitle: `Tipo detectado: ${caseType}`,
    sections: [
      {
        title: "Solicitud recibida",
        lines: [text],
      },
      relatedRepairs.length
        ? {
            title: "Reparaciones relacionadas",
            lines: relatedRepairs.slice(0, 3).map(formatCustomerSupportRepairLine),
          }
        : {
            title: "Reparaciones relacionadas",
            lines: ["No encontre una reparacion exacta con esos datos."],
          },
      {
        title: "Respuesta sugerida",
        lines: guidance.response,
      },
      {
        title: "Datos minimos sugeridos",
        lines: guidance.requiredData,
      },
      {
        title: "Siguiente accion",
        lines: guidance.nextActions,
      },
    ],
    footer: options.noteSaved
      ? "Caso guardado como pendiente interno."
      : "No pude guardar el caso como pendiente interno; revisalo manualmente.",
  });
}

function detectCustomerSupportCaseType(value) {
  const normalized = normalize(value);
  if (hasAny(normalized, ["garantia", "garantias"])) return "garantia";
  if (hasAny(normalized, ["queja", "reclamo", "molestia", "inconforme"])) return "queja o reclamo";
  if (hasAny(normalized, ["estatus", "estado", "mi equipo", "orden", "ticket", "reparacion"])) return "seguimiento de reparacion";
  if (hasAny(normalized, ["cotizacion", "cotizar", "presupuesto"])) return "cotizacion";
  return "atencion a clientes";
}

async function findCustomerSupportRepairs(chatId, text) {
  const repairs = await listRepairsForBot(chatId, { limit: 1000 });
  return repairs
    .map((repair) => ({ repair, score: scoreCustomerSupportRepair(repair, text) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ repair }) => repair)
    .slice(0, MAX_RESULTS);
}

function scoreCustomerSupportRepair(repair, text) {
  const normalizedText = normalize(text);
  const textTokens = tokenizeSearch(normalizedText);
  const repairNumber = String(repair.repairNumber || "");
  const phoneDigits = onlyDigits(repair.phone);
  const textDigits = onlyDigits(text);
  const repairText = normalize([
    repairNumber,
    repair.customer,
    repair.phone,
    repair.email,
    repair.deviceType,
    repair.brand,
    repair.model,
    repair.repairType,
    repair.status,
    repair.notes,
  ].filter(Boolean).join(" "));

  let score = 0;
  if (repairNumber && normalizedText.includes(repairNumber)) score += 80;
  if (phoneDigits && textDigits.length >= 4 && phoneDigits.includes(textDigits)) score += 70;
  for (const token of textTokens) {
    if (token.length < 2) continue;
    if (repairText.includes(token)) score += token.length >= 4 ? 12 : 6;
  }

  return score;
}

function formatCustomerSupportRepairLine(repair) {
  const balance = Math.max(0, Number(repair.repairPrice || 0) - Number(repair.abono || 0));
  return [
    `#${repair.repairNumber} - ${repair.customer || "Sin cliente"}`,
    `${formatDeviceLabel(repair)} | ${repair.status || "sin estado"}`,
    `Trabajo: ${repair.repairType || "sin trabajo registrado"}`,
    `Saldo aprox.: ${formatCurrency(balance)}`,
    repair.estimatedDeliveryAt ? `Entrega estimada: ${formatDateLabel(repair.estimatedDeliveryAt)}` : "",
  ].filter(Boolean).join("\n");
}

function getCustomerSupportGuidance(caseType, relatedRepairs = []) {
  const hasRepair = relatedRepairs.length > 0;
  const commonRequiredData = [
    "- Numero de reparacion, si existe.",
    "- Nombre o telefono para localizar el caso.",
    "- Modelo del equipo.",
    "- Motivo concreto de la solicitud.",
  ];

  if (caseType === "garantia") {
    return {
      response: hasRepair
        ? ["Hay una reparacion relacionada. Antes de prometer garantia, revisa fecha de entrega, trabajo realizado, pieza usada y notas del tecnico."]
        : ["Puedo tomar el caso como posible garantia, pero necesito localizar la reparacion antes de confirmar cobertura."],
      requiredData: ["- Numero de reparacion o telefono del cliente.", "- Falla actual.", "- Fecha aproximada de entrega.", "- Si el equipo tuvo golpe, humedad o intervencion externa."],
      nextActions: ["Validar la reparacion en el sistema y escalar a revision tecnica antes de autorizar cambio, ajuste o garantia."],
    };
  }

  if (caseType === "cotizacion") {
    return {
      response: hasRepair
        ? ["Hay datos relacionados para orientar la cotizacion. Confirma pieza, calidad y disponibilidad antes de dar precio final."]
        : ["Para cotizar con precision necesito modelo exacto, falla y pieza requerida. Si es repuesto, conviene revisar /precio o /repuestos."],
      requiredData: ["- Marca y modelo exacto.", "- Falla o pieza solicitada.", "- Calidad deseada si aplica.", "- Si requiere instalacion o solo pieza."],
      nextActions: ["Buscar pieza en inventario y confirmar precio final antes de enviarlo al cliente."],
    };
  }

  if (caseType === "seguimiento de reparacion") {
    return {
      response: hasRepair
        ? ["Hay reparacion relacionada. Usa el estado registrado como base, pero confirma internamente antes de prometer hora o entrega."]
        : ["No encontre una reparacion exacta. Pide numero de reparacion o telefono para consultar el seguimiento."],
      requiredData: ["- Numero de reparacion o telefono.", "- Nombre del cliente si no aparece con el numero.", "- Equipo o modelo."],
      nextActions: ["Consultar el registro exacto y responder solo con estado, saldo y entrega estimada confirmados."],
    };
  }

  if (caseType === "queja o reclamo") {
    return {
      response: ["Registrar el reclamo, mantener respuesta neutral y no admitir responsabilidad antes de revisar evidencia y notas del caso."],
      requiredData: ["- Numero de reparacion o telefono.", "- Motivo de la queja.", "- Que solucion espera el cliente.", "- Fotos o evidencia si aplica."],
      nextActions: ["Escalar a responsable, revisar historial y responder con una solucion autorizada."],
    };
  }

  return {
    response: hasRepair
      ? ["Hay informacion relacionada. Revisa el registro antes de confirmar garantia, costo, fecha o solucion."]
      : ["Solicitud recibida para revision manual. Faltan datos para ubicar un caso exacto."],
    requiredData: commonRequiredData,
    nextActions: ["Completar datos minimos y revisar el sistema antes de responder al cliente."],
  };
}

function withResultSummary(title, body, shown, total = shown) {
  const normalizedShown = Number(shown) || 0;
  const normalizedTotal = Number(total) || normalizedShown;
  const header = normalizedTotal === 1 ? title.replace(/s encontrados$/, " encontrado") : `${title}: ${normalizedTotal}`;
  const footer = normalizedTotal > normalizedShown
    ? `Mostrando ${normalizedShown} de ${normalizedTotal}. Refina la busqueda con marca, modelo, categoria o calidad.`
    : "";

  return formatTemplate({
    title: header,
    sections: [{ lines: [body] }],
    footer,
  });
}

function formatMoreResultsFooter(shown, total = shown) {
  const normalizedShown = Number(shown) || 0;
  const normalizedTotal = Number(total) || normalizedShown;
  return normalizedTotal > normalizedShown ? `Mostrando ${normalizedShown} de ${normalizedTotal}.` : "";
}

function formatTemplate({ title, subtitle, sections = [], footer } = {}) {
  const lines = [];
  if (title) lines.push(title);
  if (subtitle) lines.push(subtitle);

  for (const section of sections) {
    const sectionLines = (section.lines || []).filter(Boolean);
    if (!section.title && sectionLines.length === 0) continue;
    if (lines.length) lines.push("");
    if (section.title) lines.push(`${section.title}:`);
    lines.push(...sectionLines);
  }

  if (footer) {
    if (lines.length) lines.push("");
    lines.push(footer);
  }

  return lines.filter((line) => line !== null && line !== undefined).join("\n");
}

function getLowStockParts(parts) {
  return [...parts]
    .filter((part) => Number(part.stock) <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
}

function getReadyRepairs(repairs) {
  return repairs.filter((repair) => normalize(repair.status) === "listo");
}

function getDueRepairAlerts(repairs) {
  const now = Date.now();
  const leadMs = 60 * 60 * 1000;

  return repairs
    .filter((repair) => {
      if (isClosedRepairStatus(repair.status)) return false;
      const estimatedTime = new Date(repair.estimatedDeliveryAt || "").getTime();
      return Number.isFinite(estimatedTime) && estimatedTime - now <= leadMs;
    })
    .sort((a, b) => new Date(a.estimatedDeliveryAt || 0).getTime() - new Date(b.estimatedDeliveryAt || 0).getTime());
}

function isClosedRepairStatus(status) {
  return ["entregado", "cancelado"].includes(normalize(status));
}

function isSameLocalDay(value, date) {
  const current = new Date(value || "");
  if (Number.isNaN(current.getTime())) return false;
  return current.getFullYear() === date.getFullYear()
    && current.getMonth() === date.getMonth()
    && current.getDate() === date.getDate();
}

function formatDateLabel(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "sin fecha";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatBrandModelSummary(parts, search) {
  const normalizedBrand = normalizeBrandSearch(search);
  const brandParts = parts.filter((part) => normalizeBrandSearch(part.brand) === normalizedBrand);
  const models = new Set();

  for (const part of brandParts) {
    const model = String(part.model || "Sin modelo").trim();
    models.add(model);
  }

  if (models.size === 0) return "No encontre modelos para esa marca.";

  const brandName = brandParts.find((part) => part.brand)?.brand || search;
  const lines = [...models]
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true, sensitivity: "base" }))
    .slice(0, MAX_RESULTS)
    .map((model) => `- ${model}`);

  return [`De ${brandName} tengo estos modelos:`, "", ...lines, "", "Escribe el modelo que quieres consultar."].join("\n");
}

function formatCustomerPriceLabel(part) {
  const priceCents = getMoneyCents(part, "customerPrice", "customerPriceCents");
  return priceCents > 0 ? formatCurrency(priceCents / 100) : "pendiente de cargar";
}

function getMoneyCents(record, moneyField, centsField) {
  const cents = Number(record?.[centsField]);
  if (Number.isInteger(cents)) return cents;

  const value = Number(record?.[moneyField]);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

async function telegram(method, payload) {
  const response = await fetch(`${telegramApi}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(TELEGRAM_FETCH_TIMEOUT_MS),
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));

  if (!result.ok) {
    throw createServiceError(`Telegram ${method} fallo.`, {
      method,
      status: response.status,
      statusText: response.statusText,
      detail: result.description,
      errorCode: result.error_code,
    });
  }

  return result.result;
}

async function sendMessage(chatId, text, options = {}) {
  for (const chunk of splitMessage(text)) {
    await telegram("sendMessage", {
      chat_id: chatId,
      text: chunk,
      disable_web_page_preview: true,
      ...options,
    });
  }
}

async function sendChatAction(chatId, action) {
  await telegram("sendChatAction", {
    chat_id: chatId,
    action,
  }).catch(() => null);
}

function splitMessage(text) {
  const chunks = [];
  let remaining = text;

  while (remaining.length > 3900) {
    const splitAt = remaining.lastIndexOf("\n\n", 3900);
    const index = splitAt > 0 ? splitAt : 3900;
    chunks.push(remaining.slice(0, index));
    remaining = remaining.slice(index).trimStart();
  }

  chunks.push(remaining);
  return chunks;
}

function loadLocalEnv() {
  const envPath = resolve(".env.local");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    const commentIndex = value.indexOf(" #");
    if (commentIndex !== -1) value = value.slice(0, commentIndex).trim();
    value = value.replace(/^["']|["']$/g, "");

    if (!process.env[key]) process.env[key] = value;
  }
}

function parseIdList(value = "") {
  return new Set(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function isAuthorized(chatId) {
  if (!REQUIRE_AUTH) return true;
  return ALLOWED_CHAT_IDS.has(String(chatId));
}

function getConversationHistory(chatId) {
  const messages = conversationHistoryByChat.get(String(chatId)) || [];
  return messages.map((message) => `${message.role}: ${message.text}`).join("\n");
}

function rememberConversation(chatId, role, text) {
  const key = String(chatId);
  const messages = conversationHistoryByChat.get(key) || [];
  messages.push({ role, text: String(text).slice(0, 900) });
  conversationHistoryByChat.set(key, messages.slice(-CONVERSATION_MEMORY_LIMIT));
}

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function onlyDigits(value = "") {
  return String(value).replace(/\D+/g, "");
}

function tokenizeSearch(value = "") {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !PART_GENERIC_WORDS.has(word));
}

function getPartSearchFields(part) {
  const fields = [
    part.name,
    part.brand,
    part.model,
    part.category,
    part.quality,
    part.supplier,
  ].map((field) => normalize(field));
  const compactFields = fields
    .filter(Boolean)
    .map((field) => field.replace(/[^a-z0-9]+/g, ""));
  fields.push(...compactFields);
  const brand = normalize(part.brand);
  const model = normalize(part.model);
  if (brand === "apple") {
    fields.push("iphone");
    if (model) fields.push(`iphone ${model}`);
  }
  return fields;
}

function scorePartMatch(part, search) {
  const normalizedSearch = normalize(search);
  const compactSearch = normalizedSearch.replace(/[^a-z0-9]+/g, "");
  const tokens = tokenizeSearch(search);
  const fields = getPartSearchFields(part);
  const combined = fields.filter(Boolean).join(" ");
  if (!normalizedSearch || tokens.length === 0) return 1;

  let score = 0;
  if (combined.includes(normalizedSearch)) score += 80;
  if (compactSearch && fields.some((field) => field === compactSearch)) score += 80;

  for (const token of tokens) {
    if (fields.some((field) => field === token)) {
      score += 25;
    } else if (fields.some((field) => field.split(/\s+/).includes(token))) {
      score += 18;
    } else if (combined.includes(token)) {
      score += 10;
    } else {
      score -= 30;
    }
  }

  const model = normalize(part.model);
  if (model && tokens.every((token) => model.includes(token) || combined.includes(token))) score += 15;
  return score;
}

function getRequestedModel(search) {
  const tokens = tokenizeSearch(search);
  const modelTokens = tokens.filter((token) => !KNOWN_BRANDS.has(token));
  return modelTokens.join(" ");
}

function normalizeBrandSearch(value = "") {
  const normalized = normalize(value).replace(/[^a-z0-9]+/g, " ").trim();
  return KNOWN_BRANDS.get(normalized) || normalized;
}

function isBrandOnlySearch(search, parts = []) {
  const tokens = tokenizeSearch(search);
  if (tokens.length !== 1) return false;
  const normalizedBrand = normalizeBrandSearch(tokens[0]);
  return parts.some((part) => normalizeBrandSearch(part.brand) === normalizedBrand);
}

function hasExactRequestedModel(part, requestedModel) {
  if (!requestedModel) return false;
  const model = normalize(part.model).replace(/[^a-z0-9]+/g, " ").trim();
  const compactModel = model.replace(/\s+/g, "");
  const compactRequestedModel = requestedModel.replace(/\s+/g, "");
  if (model === requestedModel || compactModel === compactRequestedModel) return true;
  return /^[a-z]+\d+$/i.test(compactRequestedModel) && compactModel.startsWith(compactRequestedModel);
}

function findMatchingParts(parts, search) {
  const tokens = tokenizeSearch(search);
  const requestedModel = getRequestedModel(search);
  const exactModelMatches = requestedModel
    ? parts.filter((part) => hasExactRequestedModel(part, requestedModel) && scorePartMatch(part, search) > 0)
    : [];
  const candidates = exactModelMatches.length ? exactModelMatches : parts;

  return [...candidates]
    .map((part) => ({ part, score: scorePartMatch(part, search) }))
    .filter(({ score }) => (tokens.length ? score >= Math.min(12, tokens.length * 8) : true))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Number(b.part.stock || 0) - Number(a.part.stock || 0);
    })
    .map(({ part }) => part);
}

function hasAny(value, terms) {
  return terms.some((term) => value.includes(term));
}

function isPartsQuestion(value) {
  const normalized = normalize(value);
  return hasAny(normalized, [
    "repuesto",
    "repuestos",
    "stock",
    "inventario",
    "pieza",
    "piezas",
    "pantalla",
    "pantallas",
    "bateria",
    "baterias",
    "display",
    "modulo",
  ]);
}

function isCustomerPriceQuestion(value) {
  const normalized = normalize(value);
  const mentionsPrice = hasAny(normalized, ["precio", "precios", "cuesta", "costaria", "cliente"]);
  return mentionsPrice && (isPartsQuestion(normalized) || isNaturalPartsLookup(normalized));
}

function isResearchQuestion(value) {
  const normalized = normalize(value);
  return hasAny(normalized, [
    "internet",
    "web",
    "google",
    "investiga",
    "investigar",
    "referencia",
    "referencias",
    "compatible",
    "compatibles",
    "compatibilidad",
    "especificacion",
    "especificaciones",
    "ficha tecnica",
    "caracteristicas",
  ]);
}

function isNaturalPartsLookup(value) {
  const normalized = normalize(value);
  const tokens = tokenizeSearch(normalized);
  if (isPartsQuestion(normalized)) return true;
  if (tokens.length === 1 && KNOWN_BRANDS.has(tokens[0])) return true;
  if (tokens.length === 1 && KNOWN_SUPPLIERS.has(tokens[0])) return true;
  if (tokens.length >= 2) return true;
  return /\b[a-z]{1,4}\d{1,4}[a-z]?\b|\b\d{1,4}[a-z]{1,3}\b/.test(normalized);
}

function detectMessageIntent(value) {
  const normalized = normalize(value);
  if (!normalized) return { type: INTENT_TYPES.UNKNOWN };

  if (isGreeting(normalized)) return { type: INTENT_TYPES.GREETING };
  if (isResearchQuestion(normalized)) return { type: INTENT_TYPES.RESEARCH };
  if (isCustomerPriceQuestion(normalized)) return { type: INTENT_TYPES.PRICE_LOOKUP };
  if (isCustomerSupportQuestion(normalized)) return { type: INTENT_TYPES.CUSTOMER_SUPPORT };
  if (isNaturalPartsLookup(normalized)) return { type: INTENT_TYPES.PARTS_LOOKUP };
  return { type: INTENT_TYPES.UNKNOWN };
}

function isGreeting(value) {
  return /^(hola|buen dia|buenos dias|buenas tardes|buenas noches|hey|saludos)\b/.test(value);
}

function isCustomerSupportQuestion(value) {
  return hasAny(value, [
    "garantia",
    "garantias",
    "queja",
    "reclamo",
    "cliente",
    "clientes",
    "cotizacion",
    "cotizar",
    "reparacion",
    "reparaciones",
    "estatus",
    "estado de mi equipo",
    "mi equipo",
    "orden",
    "ticket",
  ]);
}

function isSensitiveCredentialRequest(value) {
  const normalized = normalize(value);
  if (!normalized) return false;

  const sensitiveTerms = [
    "credencial",
    "credenciales",
    "contrasena",
    "contrasenas",
    "password",
    "passwords",
    "token",
    "tokens",
    "api key",
    "apikey",
    "llave api",
    "secret",
    "secreto",
    "root",
    "admin",
    "administrador",
  ];
  const requestTerms = [
    "dame",
    "dime",
    "muestra",
    "mostrar",
    "ver",
    "recupera",
    "recuperar",
    "obtener",
    "obtiene",
    "cual es",
    "cuales son",
    "necesito",
  ];

  return hasAny(normalized, sensitiveTerms) && hasAny(normalized, requestTerms);
}

function shouldUseWebReferences(question, matchingParts = [], options = {}) {
  if (options.forceWebReferences) return true;

  const normalized = normalize(question);
  if (!normalized) return false;

  if (hasAny(normalized, [
    "internet",
    "web",
    "google",
    "investiga",
    "investigar",
    "referencia",
    "referencias",
    "compatible",
    "compatibles",
    "compatibilidad",
    "especificacion",
    "especificaciones",
    "ficha tecnica",
    "caracteristicas",
    "modelo",
    "modelos",
    "proveedor",
    "proveedores",
  ])) {
    return true;
  }

  return matchingParts.length === 0 && isPartsQuestion(normalized);
}

function getExternalReferenceStatus({ shouldUseWeb, webReferences }) {
  if (!EXA_API_KEY) return { label: "no configuradas", detail: "falta EXA_API_KEY" };
  if (!shouldUseWeb) return { label: "no usadas", detail: "la consulta no lo requirio" };
  if (webReferences.length) return { label: "usadas", detail: `${webReferences.length} resultado(s) de Exa` };
  return { label: "intentadas sin resultados", detail: "Exa no devolvio referencias utiles" };
}

function appendExternalReferenceStatus(answer, webStatus) {
  const detail = webStatus?.detail ? ` (${webStatus.detail})` : "";
  return [answer, "", `Referencias externas: ${webStatus?.label || "no usadas"}${detail}.`].join("\n");
}

function buildExaQuery(question, matchingParts = []) {
  const partContext = matchingParts
    .slice(0, 3)
    .map((part) => [part.name, part.brand, part.model, part.category].filter(Boolean).join(" "))
    .filter(Boolean)
    .join("; ");

  return [
    "Busca informacion tecnica y comercial util para un negocio de reparacion de celulares en Mexico.",
    `Pregunta del usuario: ${question}`,
    partContext ? `Repuestos relacionados del inventario: ${partContext}` : "",
    "Prioriza compatibilidad de modelos, especificaciones de piezas, nombres alternativos y referencias de proveedores.",
  ]
    .filter(Boolean)
    .join(" ");
}

function needsPartQualifier(value = "") {
  const normalized = normalize(value);
  if (!normalized) return true;

  const words = normalized
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !PART_GENERIC_WORDS.has(word));

  const hasModelLikeToken = /\b[a-z]{1,4}\d{1,4}[a-z]?\b|\b\d{1,4}[a-z]{1,3}\b/.test(normalized);
  return words.length === 0 && !hasModelLikeToken;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}

function runSelfTest() {
  const checks = [
    ["detecta saludo", detectMessageIntent("hola").type === INTENT_TYPES.GREETING],
    ["detecta precio", detectMessageIntent("precio cliente samsung a12").type === INTENT_TYPES.PRICE_LOOKUP],
    ["detecta inventario", detectMessageIntent("pantalla iphone 11").type === INTENT_TYPES.PARTS_LOOKUP],
    ["detecta investigacion", detectMessageIntent("compatibilidad pantalla iphone 11").type === INTENT_TYPES.RESEARCH],
    ["detecta atencion a clientes", detectMessageIntent("quiero revisar garantia de mi equipo").type === INTENT_TYPES.CUSTOMER_SUPPORT],
    ["detecta tipo garantia", detectCustomerSupportCaseType("garantia pantalla iphone 11") === "garantia"],
    ["bloquea credenciales", isSensitiveCredentialRequest("dime la contrasena de root")],
    ["fuerza referencias web", shouldUseWebReferences("iphone 11", [], { forceWebReferences: true })],
    [
      "muestra estado de referencias",
      appendExternalReferenceStatus("Respuesta", { label: "usadas", detail: "2 resultado(s) de Exa" }).includes("Referencias externas: usadas"),
    ],
    [
      "formatea atencion a clientes",
      formatCustomerSupportEscalation("garantia pantalla iphone 11", [{ repairNumber: 10, customer: "Cliente", brand: "Apple", model: "iPhone 11", status: "listo", repairType: "pantalla", repairPrice: 1000, abono: 200 }]).includes("Reparaciones relacionadas"),
    ],
    [
      "muestra guardado de caso cliente",
      formatCustomerSupportEscalation("garantia pantalla iphone 11", [], { noteSaved: true }).includes("Caso guardado como pendiente interno"),
    ],
    [
      "formatea resultados recortados",
      withResultSummary("Repuestos encontrados", "Pantalla iPhone 11", 1, 3).includes("Mostrando 1 de 3"),
    ],
    [
      "formatea logs con categoria",
      formatLogEntry("error", "telegram", "Fallo", { method: "getUpdates" }).includes("[telegram] Fallo"),
    ],
  ];
  const failed = checks.filter(([, passed]) => !passed);

  if (failed.length) {
    console.error("Self-test del bot fallo:");
    for (const [name] of failed) console.error(`- ${name}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Self-test del bot correcto: ${checks.length} validaciones.`);
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function shutdown(signal) {
  logInfo("telegram", `Bot detenido por ${signal}.`);
  await recordBotAuditEvent("BOT_DORMIDO", "Bot de Telegram detenido.", { signal, pid: process.pid });
  process.exit(0);
}

function createServiceError(message, details = {}) {
  const error = new Error(details.detail ? `${message} ${details.detail}` : message);
  error.details = details;
  return error;
}

function logInfo(service, message, details) {
  console.log(formatLogEntry("info", service, message, details));
}

function logWarn(service, message, details) {
  console.warn(formatLogEntry("warn", service, message, details));
}

function logError(service, message, error, details) {
  const formattedDetails = {
    ...details,
    ...formatErrorDetails(error),
  };
  console.error(formatLogEntry("error", service, message, formattedDetails));
  if (service !== "convex") {
    recordBotAuditEvent(`BOT_ERROR_${String(service).toUpperCase()}`, message, formattedDetails);
  }
}

function formatLogEntry(level, service, message, details) {
  const timestamp = new Date().toISOString();
  const detailText = details && Object.keys(details).length
    ? ` ${JSON.stringify(redactLogDetails(details))}`
    : "";
  return `[${timestamp}] [${String(level).toUpperCase()}] [${service}] ${message}${detailText}`;
}

function formatErrorDetails(error) {
  if (!error) return {};
  return {
    error: error.message || String(error),
    ...(error.code ? { code: error.code } : {}),
    ...(error.name ? { name: error.name } : {}),
    ...(error.details || {}),
  };
}

function redactLogDetails(value) {
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (/(token|password|contrasena|api.?key|secret)/i.test(key)) return [key, "[redacted]"];
      return [key, item];
    }),
  );
}

function recordBotAuditEvent(tipo, descripcion, datos = {}) {
  if (!convexSessionReady && !TELEGRAM_APP_USERNAME) return;
  return ensureConvexSession()
      .then(() => convex.mutation(api.auditoria.registrarBot, {
        sessionToken: convexSessionToken,
        tipo,
        descripcion,
        datos: JSON.stringify(redactLogDetails(datos)),
      }))
      .catch((error) => {
        console.warn(formatLogEntry("warn", "convex", "No se pudo registrar bitacora del bot.", formatErrorDetails(error)));
      });
}

export {
  handleUpdate,
  buildBusinessContext,
  INTENT_TYPES,
  appendExternalReferenceStatus,
  detectCustomerSupportCaseType,
  detectMessageIntent,
  formatLogEntry,
  formatCustomerSupportEscalation,
  isSensitiveCredentialRequest,
  shouldUseWebReferences,
  withResultSummary,
};
