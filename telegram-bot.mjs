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
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const REQUIRE_AUTH = process.env.TELEGRAM_REQUIRE_AUTH !== "false";
const SILENT_UNAUTHORIZED = process.env.TELEGRAM_SILENT_UNAUTHORIZED !== "false";
const CONVERSATION_MEMORY_LIMIT = Number(process.env.CONVERSATION_MEMORY_LIMIT || 8);
const ONLY_PARTS_MODE = process.env.TELEGRAM_ONLY_PARTS !== "false";
const TELEGRAM_APP_USERNAME = process.env.TELEGRAM_APP_USERNAME;
const TELEGRAM_APP_PASSWORD = process.env.TELEGRAM_APP_PASSWORD;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Falta TELEGRAM_BOT_TOKEN en el entorno o en .env.local.");
}

if (!CONVEX_URL) {
  throw new Error("Falta CONVEX_URL en el entorno o en .env.local.");
}

const convex = new ConvexHttpClient(CONVEX_URL);
const telegramApi = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

let offset = 0;
const conversationHistoryByChat = new Map();
const pendingIntentByChat = new Map();
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
    if (pendingIntent && !text.startsWith("/")) {
      pendingIntentByChat.delete(String(chatId));
      if (pendingIntent.type === "parts_search") {
        await searchParts(chatId, text, pendingIntent.options || {});
        return;
      }
    }

    switch (command) {
      case "/start":
      case "/help":
      case "/ayuda":
        await sendHelp(chatId);
        break;
      case "/buscar":
        await searchParts(chatId, args);
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
        if (!text.startsWith("/") && isCustomerPriceQuestion(text)) {
          await searchParts(chatId, text, { priceOnly: true });
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
      "/buscar texto - busca repuestos por nombre, marca, modelo o categoria",
      "/repuestos texto - busca repuestos por nombre, marca, modelo o categoria",
      "/stock texto - igual que repuestos, pero solo con existencia",
      "/precio texto - muestra el precio a cliente final",
      "/ia pregunta - responde con Gemini usando solo contexto de repuestos",
      "/mi_chat_id - muestra el ID para autorizar este chat",
      "/reset - borra la memoria conversacional del chat",
      "",
      "Ejemplos:",
      "/buscar samsung a12",
      "/repuestos iphone 11",
      "/stock pantalla motorola",
      "/precio samsung a12",
      "Tambien puedes escribir una pregunta normal sobre repuestos.",
    ].join("\n"),
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

  const repairs = await convex.query(api.reparaciones.list, {
    search,
    limit: 20,
  });

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

  const repairs = await convex.query(api.reparaciones.list, {
    search: normalized,
    limit: 20,
  });
  const exact = repairs.filter((repair) => String(repair.repairNumber) === normalized);

  if (exact.length === 0) {
    await sendMessage(chatId, `No encontre la reparacion #${normalized}.`);
    return;
  }

  await sendMessage(chatId, formatRepairs(exact.slice(0, MAX_RESULTS)));
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

  const parts = await convex.query(api.repuestos.list, {});
  const normalizedSearch = normalize(search);
  const filtered = parts
    .filter((part) => !options.onlyWithStock || Number(part.stock) > 0)
    .filter((part) => {
      if (!normalizedSearch) return true;
      return [
        part.name,
        part.brand,
        part.model,
        part.category,
        part.quality,
        part.supplier,
      ].some((field) => normalize(field).includes(normalizedSearch));
    });

  if (filtered.length === 0) {
    await sendMessage(chatId, "No encontre repuestos con esa busqueda.");
    return;
  }

  await sendMessage(
    chatId,
    options.priceOnly ? formatCustomerPrices(filtered.slice(0, MAX_RESULTS)) : formatParts(filtered.slice(0, MAX_RESULTS)),
  );
}

async function listNotes(chatId) {
  const notes = await convex.query(api.notas.list, {});
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

  if (!TELEGRAM_APP_USERNAME || !TELEGRAM_APP_PASSWORD) {
    throw new Error("Faltan TELEGRAM_APP_USERNAME y TELEGRAM_APP_PASSWORD para guardar notas.");
  }
  if (!convexSessionReady) {
    await convex.mutation(api.auth.login, {
      username: TELEGRAM_APP_USERNAME,
      password: TELEGRAM_APP_PASSWORD,
      sessionToken: convexSessionToken,
    });
    convexSessionReady = true;
  }

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
    "Usa solo el contexto proporcionado cuando hables de repuestos.",
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
  const normalizedQuestion = normalize(question);
  const parts = await convex.query(api.repuestos.list, {}).catch(() => []);

  const matchingParts = parts
    .filter((part) => {
      if (!normalizedQuestion) return true;
      return [part.name, part.brand, part.model, part.category, part.quality, part.supplier].some((field) =>
        normalize(field).includes(normalizedQuestion),
      );
    })
    .slice(0, 12);
  const lowStockParts = parts.filter((part) => Number(part.stock) <= 2).slice(0, 12);

  return [
    matchingParts.length ? `Repuestos encontrados:\n${formatParts(matchingParts)}` : "",
    lowStockParts.length ? `Repuestos con stock bajo:\n${formatParts(lowStockParts)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 12000);
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
        `${repair.brand} ${repair.model} (${repair.deviceType})`,
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
        `Cliente: ${formatCurrency(part.customerPrice)}`,
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
        `Precio cliente final: ${formatCurrency(part.customerPrice)}`,
      ].join("\n"),
    )
    .join("\n\n");
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

async function sendMessage(chatId, text) {
  for (const chunk of splitMessage(text)) {
    await telegram("sendMessage", {
      chat_id: chatId,
      text: chunk,
      disable_web_page_preview: true,
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
