import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

loadLocalEnv();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CONVEX_URL = process.env.CONVEX_URL;
const ALLOWED_CHAT_IDS = parseIdList(process.env.TELEGRAM_ALLOWED_CHAT_IDS);
const POLL_TIMEOUT_SECONDS = Number(process.env.TELEGRAM_POLL_TIMEOUT_SECONDS || 25);
const MAX_RESULTS = Number(process.env.TELEGRAM_MAX_RESULTS || 8);
const LOW_STOCK_THRESHOLD = Number(process.env.TELEGRAM_LOW_STOCK_THRESHOLD || 2);
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const EXA_API_KEY = process.env.EXA_API_KEY;
const EXA_MAX_RESULTS = Number(process.env.EXA_MAX_RESULTS || 5);
const REQUIRE_AUTH = process.env.TELEGRAM_REQUIRE_AUTH !== "false";
const SILENT_UNAUTHORIZED = process.env.TELEGRAM_SILENT_UNAUTHORIZED !== "false";
const CONVERSATION_MEMORY_LIMIT = Number(process.env.CONVERSATION_MEMORY_LIMIT || 8);
const ONLY_PARTS_MODE = process.env.TELEGRAM_ONLY_PARTS !== "false";
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
const mainMenuReplyMarkup = {
  keyboard: [
    [{ text: "/resumen" }, { text: "/pendientes" }],
    [{ text: "/stock_bajo" }, { text: "/repuestos" }],
    [{ text: "/precio" }, { text: "/mi_usuario" }],
    [{ text: "/ayuda" }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
  input_field_placeholder: "Elige una opcion o escribe tu consulta",
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

console.log("Bot de Telegram iniciado.");
if (ALLOWED_CHAT_IDS.size === 0) {
  console.warn("TELEGRAM_ALLOWED_CHAT_IDS no esta definido: solo /mi_chat_id estara disponible.");
}
if (!GOOGLE_AI_API_KEY) {
  console.warn("GOOGLE_AI_API_KEY no esta definido: el comando /ia quedara desactivado.");
}
if (!EXA_API_KEY) {
  console.warn("EXA_API_KEY no esta definido: /ia solo usara contexto interno de Convex.");
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
    console.error("Error en polling:", error.message);
    await sleep(2500);
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
    console.warn(`Chat no autorizado intento usar el bot: ${chatId}`);
    if (!SILENT_UNAUTHORIZED) {
      await sendMessage(chatId, "Este chat no esta autorizado para usar el bot.");
    }
    return;
  }

  try {
    const pendingIntent = pendingIntentByChat.get(String(chatId));
    if (pendingIntent && pendingIntent.type === "login_username" && !text.startsWith("/")) {
      pendingIntentByChat.set(String(chatId), {
        type: "login_password",
        username: text,
      });
      await sendMessage(chatId, "Ahora escribe tu contrasena.");
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
    }

    switch (command) {
      case "/start":
      case "/menu":
      case "/help":
      case "/ayuda":
        await sendHelp(chatId);
        break;
      case "/login":
        await loginChatUser(chatId, args);
        break;
      case "/cancelar":
        pendingIntentByChat.delete(String(chatId));
        await sendMessage(chatId, "Listo, cancele la accion pendiente.");
        break;
      case "/logout":
        await logoutChatUser(chatId);
        break;
      case "/mi_usuario":
        await sendCurrentChatUser(chatId);
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
        if (ONLY_PARTS_MODE) {
          await sendOnlyPartsMessage(chatId);
          break;
        }
        if (command === "/reparaciones") await searchRepairs(chatId, args);
        if (command === "/reparacion") await searchRepairByNumber(chatId, args);
        if (command === "/notas") await listNotes(chatId);
        if (command === "/nota") await createNote(chatId, message.from, args);
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
      case "/ia":
      case "/ai":
        await answerWithAi(chatId, args);
        break;
      case "/reset":
      case "/reiniciar":
        conversationHistoryByChat.delete(String(chatId));
        pendingIntentByChat.delete(String(chatId));
        await sendMessage(chatId, "Listo, borre la memoria de esta conversacion.");
        break;
      default:
        if (!text.startsWith("/") && GOOGLE_AI_API_KEY && isResearchQuestion(text)) {
          await answerWithAi(chatId, text);
          break;
        }
        if (!text.startsWith("/") && isCustomerPriceQuestion(text)) {
          await searchParts(chatId, text, { priceOnly: true });
          break;
        }
        if (!text.startsWith("/") && isNaturalPartsLookup(text)) {
          await searchParts(chatId, text);
          break;
        }
        if (GOOGLE_AI_API_KEY && !text.startsWith("/")) {
          await answerWithAi(chatId, text);
        } else {
          await sendMessage(chatId, "No conozco ese comando. Usa /ayuda para ver opciones.");
        }
    }
  } catch (error) {
    console.error(`Error atendiendo ${command}:`, error);
    if (error.code === "MISSING_BOT_CREDENTIALS") {
      await sendMessage(
        chatId,
        "Encontre la busqueda, pero para mostrar precios necesito configurar TELEGRAM_APP_USERNAME y TELEGRAM_APP_PASSWORD en .env.local.",
      );
      return;
    }
    if (error.code === "LOGIN_REQUIRED") {
      await sendMessage(chatId, "Primero inicia sesion con /login.");
      return;
    }
    if (error.code === "ADMIN_REQUIRED") {
      await sendMessage(chatId, "Solo root o administrador pueden ver esos datos.");
      return;
    }
    await sendMessage(chatId, "No pude completar la accion. Revisa la consola del bot.");
  }
}

async function sendHelp(chatId) {
  await sendMessage(
    chatId,
    [
      "Bot Doctor Movil",
      "",
      "Comandos:",
      "/menu - muestra botones para no recordar comandos",
      "/buscar texto - busca repuestos por nombre, marca, modelo o categoria",
      "/repuestos texto - busca repuestos por nombre, marca, modelo o categoria",
      "/stock texto - igual que repuestos, pero solo con existencia",
      "/stock_bajo - lista repuestos agotados o con poca existencia",
      "/precio texto - muestra el precio a cliente final",
      "/resumen - muestra un resumen operativo del dia",
      "/pendientes - lista reparaciones listas, por vencer y catalogo pendiente",
      "/login - inicia sesion con tu usuario del sistema",
      "/logout - cierra la sesion de este chat",
      "/mi_usuario - muestra con que usuario estas conectado",
      "/ia pregunta - responde con Gemini usando Convex y referencias web si EXA_API_KEY esta configurado",
      "/mi_chat_id - muestra el ID para autorizar este chat",
      "/reset - borra la memoria conversacional del chat",
      "",
      "Ejemplos:",
      "/buscar samsung a12",
      "/repuestos iphone 11",
      "/stock pantalla motorola",
      "/precio samsung a12",
      "/resumen",
      "/pendientes",
      "Tambien puedes escribir una pregunta normal sobre repuestos.",
    ].join("\n"),
    { reply_markup: mainMenuReplyMarkup },
  );
}

async function sendOnlyPartsMessage(chatId) {
  await sendMessage(
    chatId,
    "Por ahora el bot esta en modo pruebas y solo consulta repuestos. Escribe /repuestos seguido de una marca o modelo, por ejemplo: /repuestos iPhone 11.",
  );
}

async function searchRepairs(chatId, search) {
  if (!search) {
    await sendMessage(chatId, "Escribe que quieres buscar. Ejemplo: /buscar samsung");
    return;
  }

  const repairs = await listRepairsForBot({ search, limit: 20 });

  if (repairs.length === 0) {
    await sendMessage(chatId, "No encontre reparaciones con esa busqueda.");
    return;
  }

  await sendMessage(chatId, formatRepairs(repairs.slice(0, MAX_RESULTS)));
}

async function searchRepairByNumber(chatId, repairNumber) {
  const normalized = repairNumber.trim();
  if (!/^\d+$/.test(normalized)) {
    await sendMessage(chatId, "Escribe un numero de reparacion. Ejemplo: /reparacion 1205");
    return;
  }

  const repairs = await listRepairsForBot({ search: normalized, limit: 20 });
  const exact = repairs.filter((repair) => String(repair.repairNumber) === normalized);

  if (exact.length === 0) {
    await sendMessage(chatId, `No encontre la reparacion #${normalized}.`);
    return;
  }

  await sendMessage(chatId, formatRepairs(exact.slice(0, MAX_RESULTS)));
}

async function sendDailySummary(chatId) {
  await requireRootOrAdminChat(chatId);
  await sendChatAction(chatId, "typing");

  const [parts, repairs, pendingCatalog, notes] = await Promise.all([
    listPartsForBot(chatId),
    listRepairsForBot({ limit: 1000 }),
    listCatalogPendingForBot(),
    listNotesForBot().catch(() => []),
  ]);

  const now = new Date();
  const todayRepairs = repairs.filter((repair) => isSameLocalDay(repair.createdAt, now));
  const deliveredToday = repairs.filter((repair) => isSameLocalDay(repair.deliveredAt, now));
  const readyRepairs = getReadyRepairs(repairs);
  const dueRepairs = getDueRepairAlerts(repairs);
  const lowStockParts = getLowStockParts(parts);
  const pendingNotes = notes.filter((note) => !note.done);
  const todayIncome = todayRepairs.reduce((total, repair) => total + Number(repair.repairPrice || 0), 0);

  await sendMessage(
    chatId,
    [
      "Resumen de hoy",
      "",
      `Reparaciones ingresadas: ${todayRepairs.length}`,
      `Reparaciones entregadas: ${deliveredToday.length}`,
      `Ingreso potencial de reparaciones nuevas: ${formatCurrency(todayIncome)}`,
      `Listas para entregar: ${readyRepairs.length}`,
      `Por vencer o vencidas: ${dueRepairs.length}`,
      `Pendientes de catalogo: ${pendingCatalog.length}`,
      `Notas pendientes: ${pendingNotes.length}`,
      `Repuestos con stock bajo: ${lowStockParts.length}`,
      "",
      formatShortRepairList("Listas para entregar", readyRepairs.slice(0, 5)),
      formatShortRepairList("Por vencer o vencidas", dueRepairs.slice(0, 5)),
      formatShortPartList("Stock bajo", lowStockParts.slice(0, 5)),
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

async function sendLowStock(chatId) {
  await requireRootOrAdminChat(chatId);
  const parts = await listPartsForBot(chatId);
  const lowStockParts = getLowStockParts(parts).slice(0, MAX_RESULTS);

  if (lowStockParts.length === 0) {
    await sendMessage(chatId, `No encontre repuestos con stock de ${LOW_STOCK_THRESHOLD} o menos.`);
    return;
  }

  await sendMessage(chatId, formatShortPartList(`Stock bajo (${LOW_STOCK_THRESHOLD} o menos)`, lowStockParts));
}

async function sendOperationalAlerts(chatId) {
  await requireRootOrAdminChat(chatId);
  await sendChatAction(chatId, "typing");

  const [repairs, pendingCatalog, parts] = await Promise.all([
    listRepairsForBot({ limit: 1000 }),
    listCatalogPendingForBot(),
    listPartsForBot(chatId),
  ]);
  const readyRepairs = getReadyRepairs(repairs).slice(0, MAX_RESULTS);
  const dueRepairs = getDueRepairAlerts(repairs).slice(0, MAX_RESULTS);
  const lowStockParts = getLowStockParts(parts).slice(0, MAX_RESULTS);

  if (!readyRepairs.length && !dueRepairs.length && !pendingCatalog.length && !lowStockParts.length) {
    await sendMessage(chatId, "No encontre pendientes operativos por ahora.");
    return;
  }

  await sendMessage(
    chatId,
    [
      "Pendientes operativos",
      "",
      formatShortRepairList("Listas para entregar", readyRepairs),
      formatShortRepairList("Por vencer o vencidas", dueRepairs),
      formatCatalogPending(pendingCatalog.slice(0, MAX_RESULTS)),
      formatShortPartList("Stock bajo", lowStockParts),
    ]
      .filter(Boolean)
      .join("\n\n"),
  );
}

async function loginChatUser(chatId, args) {
  const [username = "", ...passwordParts] = String(args || "").trim().split(/\s+/);
  const password = passwordParts.join(" ");

  if (!username) {
    pendingIntentByChat.set(String(chatId), { type: "login_username" });
    await sendMessage(chatId, "Escribe tu usuario.");
    return;
  }

  if (!password) {
    pendingIntentByChat.set(String(chatId), {
      type: "login_password",
      username,
    });
    await sendMessage(chatId, "Ahora escribe tu contrasena.");
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

  userSessionByChat.set(String(chatId), { sessionToken, user });
  pendingIntentByChat.delete(String(chatId));
  await sendMessage(chatId, `Sesion iniciada como ${user.username}.`);
}

async function logoutChatUser(chatId) {
  const session = userSessionByChat.get(String(chatId));
  if (session?.sessionToken) {
    await convex.mutation(api.auth.logout, { sessionToken: session.sessionToken }).catch(() => null);
  }

  userSessionByChat.delete(String(chatId));
  pendingIntentByChat.delete(String(chatId));
  await sendMessage(chatId, "Sesion cerrada.");
}

async function sendCurrentChatUser(chatId) {
  const session = await getActiveChatSession(chatId);
  if (!session) {
    await sendMessage(chatId, "No has iniciado sesion. Usa /login.");
    return;
  }

  const modules = Array.isArray(session.user.modules) ? session.user.modules : [];
  await sendMessage(
    chatId,
    [`Estas conectado como ${session.user.username}.`, `Rol: ${session.user.role}`, modules.length ? `Permisos: ${modules.join(", ")}` : null]
      .filter(Boolean)
      .join("\n"),
  );
}

async function searchParts(chatId, search, options = {}) {
  if (needsPartQualifier(search)) {
    pendingIntentByChat.set(String(chatId), {
      type: "parts_search",
      options,
    });
    await sendMessage(
      chatId,
      options.priceOnly
        ? "Claro. De que marca o modelo quieres ver el precio a cliente final? Puedes escribir algo como: iPhone 11, Samsung A12 o Motorola G20."
        : "Claro. Que marca o modelo quieres consultar? Puedes escribir algo como: iPhone 11, Samsung A12, Motorola G20 o bateria Huawei.",
    );
    return;
  }

  const parts = await listPartsForBot(chatId, { requirePrices: options.priceOnly });
  if (!options.priceOnly && isBrandOnlySearch(search, parts)) {
    await sendMessage(chatId, formatBrandModelSummary(parts, search));
    return;
  }

  const matches = findMatchingParts(parts, search)
    .filter((part) => !options.onlyWithStock || Number(part.stock) > 0)
    .slice(0, MAX_RESULTS);

  if (matches.length === 0) {
    await sendMessage(chatId, "No encontre repuestos con esa busqueda.");
    return;
  }

  await sendMessage(
    chatId,
    options.priceOnly ? formatCustomerPrices(matches) : formatParts(matches),
  );
}

async function listNotes(chatId) {
  const notes = await listNotesForBot();
  const pendingNotes = notes.filter((note) => !note.done).slice(0, MAX_RESULTS);

  if (pendingNotes.length === 0) {
    await sendMessage(chatId, "No hay notas pendientes.");
    return;
  }

  await sendMessage(
    chatId,
    pendingNotes
      .map((note, index) => `${index + 1}. ${note.text}\nPor: ${note.authorName || note.authorUsername}`)
      .join("\n\n"),
  );
}

async function createNote(chatId, from, text) {
  if (!text) {
    await sendMessage(chatId, "Escribe el texto de la nota. Ejemplo: /nota pedir pantalla iphone 11");
    return;
  }

  const authorName = [from?.first_name, from?.last_name].filter(Boolean).join(" ") || "Telegram";
  const authorUsername = from?.username ? `@${from.username}` : String(from?.id || "telegram");
  const now = new Date().toISOString();

  await ensureConvexSession();

  await convex.mutation(api.notas.create, {
    sessionToken: convexSessionToken,
    sourceId: `telegram:${from?.id || "unknown"}:${now}`,
    text,
    authorName,
    authorUsername,
    done: false,
    createdAt: now,
    updatedAt: now,
  });

  await sendMessage(chatId, "Nota guardada.");
}

async function answerWithAi(chatId, question) {
  if (!GOOGLE_AI_API_KEY) {
    await sendMessage(chatId, "Falta GOOGLE_AI_API_KEY en .env.local para usar inteligencia artificial.");
    return;
  }

  if (!question) {
    await sendMessage(chatId, "Escribe tu pregunta. Ejemplo: /ia que repuestos tienen poco stock?");
    return;
  }

  if (isPartsQuestion(question) && needsPartQualifier(question)) {
    pendingIntentByChat.set(String(chatId), {
      type: "parts_search",
      options: { fromAiPrompt: true },
    });
    const response =
      "Para revisar repuestos necesito la marca o el modelo. Cual quieres consultar? Ejemplo: iPhone 11, Samsung A12 o pantalla Motorola G20.";
    rememberConversation(chatId, "Usuario", question);
    rememberConversation(chatId, "Bot", response);
    await sendMessage(chatId, response);
    return;
  }

  await sendChatAction(chatId, "typing");

  const context = await buildBusinessContext(question);
  const history = getConversationHistory(chatId);
  const answer = await askGemini([
    "Eres un asistente interno para Doctor Movil.",
    "Hablas de forma natural, amable y directa, como un companero de mostrador.",
    "Responde en espanol mexicano, breve y practico.",
    "Durante esta prueba solo ayudas con repuestos e inventario.",
    "No respondas sobre reparaciones, notas, clientes u otros modulos.",
    "Usa el contexto interno de Convex como fuente principal para stock, precios e inventario real.",
    "Usa las referencias web solo como informacion externa de apoyo.",
    "Distingue claramente entre inventario interno y referencias de internet.",
    "Puedes explicar que comando usar si conviene consultar algo exacto.",
    "Si el contexto no alcanza, dilo y sugiere el comando exacto que podria ayudar.",
    "",
    history ? `Historial reciente:\n${history}\n` : "",
    `Pregunta: ${question}`,
    "",
    "Contexto:",
    context || "No se encontro contexto relevante en Convex para esta pregunta.",
  ].join("\n"));

  rememberConversation(chatId, "Usuario", question);
  rememberConversation(chatId, "Bot", answer);
  await sendMessage(chatId, answer);
}

async function buildBusinessContext(question) {
  const parts = await listPartsForBot(null).catch(() => []);
  const matchingParts = findMatchingParts(parts, question).slice(0, 12);
  const lowStockParts = parts.filter((part) => Number(part.stock) <= 2).slice(0, 12);
  const webReferences = await searchExaForBot(question, matchingParts).catch((error) => {
    console.warn("Exa no pudo responder:", error.message);
    return [];
  });

  return [
    matchingParts.length ? `Inventario interno encontrado en Convex:\n${formatParts(matchingParts)}` : "",
    lowStockParts.length ? `Inventario interno con stock bajo:\n${formatParts(lowStockParts)}` : "",
    webReferences.length ? `Referencias externas encontradas con Exa:\n${formatExaReferences(webReferences)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 12000);
}

async function searchExaForBot(question, matchingParts = []) {
  if (!EXA_API_KEY) return [];
  if (!shouldUseWebReferences(question, matchingParts)) return [];

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXA_API_KEY,
    },
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
    throw new Error(result.error || result.message || "Exa no pudo buscar referencias.");
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
    return null;
  }

  session.user = user;
  userSessionByChat.set(String(chatId), session);
  return session;
}

async function requireRootOrAdminChat(chatId) {
  const session = await getActiveChatSession(chatId);
  if (!session) {
    const error = new Error("Sesion requerida.");
    error.code = "LOGIN_REQUIRED";
    throw error;
  }

  if (!["root", "admin", "administrador"].includes(normalize(session.user.role))) {
    const error = new Error("Solo root o administrador pueden ver estos datos.");
    error.code = "ADMIN_REQUIRED";
    throw error;
  }

  return session;
}

async function getPartsSessionToken(chatId, options = {}) {
  const chatSession = await getActiveChatSession(chatId);
  if (chatSession?.sessionToken) return chatSession.sessionToken;

  if (!TELEGRAM_APP_USERNAME || !TELEGRAM_APP_PASSWORD) {
    if (options.requirePrices) {
      const error = new Error("Faltan credenciales para mostrar precios.");
      error.code = "MISSING_BOT_CREDENTIALS";
      throw error;
    }
    return "";
  }

  await ensureConvexSession();
  return convexSessionToken;
}

async function listPartsForBot(chatId, options = {}) {
  const sessionToken = await getPartsSessionToken(chatId, options);
  return await convex.query(api.repuestos.list, sessionToken ? { sessionToken } : {});
}

async function listRepairsForBot(options = {}) {
  await ensureConvexSession();
  return await convex.query(api.reparaciones.list, {
    sessionToken: convexSessionToken,
    search: options.search,
    limit: options.limit || 1000,
  });
}

async function listNotesForBot() {
  await ensureConvexSession();
  return await convex.query(api.notas.list, { sessionToken: convexSessionToken });
}

async function listCatalogPendingForBot() {
  await ensureConvexSession();
  return await convex.query(api.catalogoPendientes.list, { sessionToken: convexSessionToken, status: "pending", limit: 100 });
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
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Gemini no pudo responder.");
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

function formatParts(parts) {
  return parts
    .map((part) =>
      [
        `${part.name}`,
        `${part.brand} ${part.model} - ${part.category}`,
        `Calidad: ${part.quality}`,
        `Stock: ${part.stock}`,
        `Cliente: ${formatCustomerPriceLabel(part)}`,
        part.supplier ? `Proveedor: ${part.supplier}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
}

function formatCustomerPrices(parts) {
  return parts
    .map((part) =>
      [
        `${part.name}`,
        `${part.brand} ${part.model} - ${part.category}`,
        `Stock: ${part.stock}`,
        `Precio cliente final: ${formatCustomerPriceLabel(part)}`,
      ].join("\n"),
    )
    .join("\n\n");
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

function formatShortRepairList(title, repairs) {
  if (!repairs.length) return "";

  return [
    `${title}:`,
    ...repairs.map((repair) => {
      const dueLabel = repair.estimatedDeliveryAt ? ` | vence ${formatDateLabel(repair.estimatedDeliveryAt)}` : "";
      return `#${repair.repairNumber} ${repair.customer || "Sin cliente"} - ${formatDeviceLabel(repair)} - ${repair.status}${dueLabel}`;
    }),
  ].join("\n");
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

function formatShortPartList(title, parts) {
  if (!parts.length) return "";

  return [
    `${title}:`,
    ...parts.map((part) => `${part.name} - ${part.brand} ${part.model} | stock ${Number(part.stock) || 0}`),
  ].join("\n");
}

function formatCatalogPending(pendingItems) {
  if (!pendingItems.length) return "";

  return [
    "Pendientes de catalogo:",
    ...pendingItems.map((item) => `#${item.repairNumber} ${item.brand} ${item.model} - ${item.partName}`),
  ].join("\n");
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
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.description || `Telegram ${method} fallo.`);
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
  return isPartsQuestion(normalized) && hasAny(normalized, ["precio", "precios", "cuesta", "costaria", "cliente"]);
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

function shouldUseWebReferences(question, matchingParts = []) {
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

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function shutdown(signal) {
  console.log(`Bot detenido por ${signal}.`);
  process.exit(0);
}
