import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireModuleRead, requireModuleWrite } from "./authorization";
import { requireRoot } from "./authorization";

function getNextDailyBackupAt(now = new Date()) {
  const offsetMinutes = Number(process.env.BACKUP_TIMEZONE_OFFSET_MINUTES || "-360");
  const local = new Date(now.getTime() + offsetMinutes * 60 * 1000);
  const nextLocal = new Date(Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
    18, 0, 0, 0,
  ));
  if (local >= nextLocal) nextLocal.setUTCDate(nextLocal.getUTCDate() + 1);
  return new Date(nextLocal.getTime() - offsetMinutes * 60 * 1000).toISOString();
}

export const record = mutation({
  args: {
    sessionToken: v.string(),
    apiLatencyMs: v.number(),
    apiStatus: v.string(),
    botStatus: v.string(),
    backupStatus: v.string(),
    securityStatus: v.string(),
  },
  handler: async (ctx, args) => {
    // El historial es parte del modulo de salud. Asi una cuenta a la que root
    // delegue ese modulo puede dejar constancia de sus revisiones, sin darle
    // privilegios de administracion total.
    await requireModuleWrite(ctx, args.sessionToken, "health");
    const latest = await ctx.db
      .query("saludHistorial")
      .withIndex("by_created_at")
      .order("desc")
      .first();
    const sameStatus = latest &&
      latest.apiStatus === args.apiStatus &&
      latest.botStatus === args.botStatus &&
      latest.backupStatus === args.backupStatus &&
      latest.securityStatus === args.securityStatus;
    const checkedRecently = latest &&
      Date.now() - new Date(latest.createdAt).getTime() < 15 * 60 * 1000;
    if (sameStatus && checkedRecently) return { recorded: false };
    await ctx.db.insert("saludHistorial", {
      apiLatencyMs: Math.max(0, Math.round(args.apiLatencyMs)),
      apiStatus: args.apiStatus,
      botStatus: args.botStatus,
      backupStatus: args.backupStatus,
      securityStatus: args.securityStatus,
      createdAt: new Date().toISOString(),
    });
    return { recorded: true };
  },
});

export const monitoringSummary = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireRoot(ctx, args.sessionToken);
    const now = Date.now();
    const latestBackup = await ctx.db
      .query("respaldos")
      .withIndex("by_created_at")
      .order("desc")
      .first();
    const securitySince = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const recentEvents = await ctx.db
      .query("auditoria")
      .withIndex("by_fecha", (q) => q.gte("fecha", securitySince))
      .collect();
    const failedLogins = recentEvents.filter((event) =>
      ["LOGIN_FALLIDO", "VERIFICACION_PRIVILEGIADA_FALLIDA", "VERIFICACION_PRIVILEGIADA_BLOQUEADA"].includes(event.tipo)
    ).length;
    const blockedUsers = recentEvents.filter((event) => event.tipo === "USUARIO_BLOQUEADO").length;
    const alerts = [] as { code: string; message: string }[];
    if (!latestBackup) {
      alerts.push({ code: "BACKUP_MISSING", message: "No hay respaldos registrados en el sistema." });
    } else if (now - new Date(latestBackup.createdAt).getTime() > 26 * 60 * 60 * 1000) {
      alerts.push({ code: "BACKUP_STALE", message: "El ultimo respaldo registrado tiene mas de 26 horas." });
    }
    const latestBot = (await ctx.db.query("botInstances").take(100))
      .filter((instance) => instance.allowed)
      .sort((left, right) => right.lastSeen - left.lastSeen)[0];
    if (latestBot && now - latestBot.lastSeen > 90_000) {
      alerts.push({ code: "BOT_OFFLINE", message: "El bot de Telegram no ha enviado una senal reciente." });
    }
    if (failedLogins || blockedUsers) {
      alerts.push({ code: "SECURITY_ALERT", message: `Seguridad: ${failedLogins} intentos fallidos y ${blockedUsers} bloqueos en las ultimas 24 horas.` });
    }
    return { alerts };
  },
});

export const externalMonitor = query({
  args: { monitorSecret: v.string() },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.HEALTH_MONITOR_SECRET;
    if (!expectedSecret || args.monitorSecret !== expectedSecret) throw new Error("No autorizado.");
    const now = Date.now();
    const alerts = [] as { code: string; message: string }[];
    const latestBackup = await ctx.db.query("respaldos").withIndex("by_created_at").order("desc").first();
    if (!latestBackup) {
      alerts.push({ code: "BACKUP_MISSING", message: "No hay respaldos registrados en el sistema." });
    } else if (now - new Date(latestBackup.createdAt).getTime() > 26 * 60 * 60 * 1000) {
      alerts.push({ code: "BACKUP_STALE", message: "El ultimo respaldo registrado tiene mas de 26 horas." });
    }
    const latestBot = (await ctx.db.query("botInstances").take(100))
      .filter((instance) => instance.allowed)
      .sort((left, right) => right.lastSeen - left.lastSeen)[0];
    if (latestBot && now - latestBot.lastSeen > 90_000) {
      alerts.push({ code: "BOT_OFFLINE", message: "El bot de Telegram no ha enviado una senal reciente." });
    }
    const securitySince = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const securityEvents = await ctx.db.query("auditoria").withIndex("by_fecha", (q) => q.gte("fecha", securitySince)).collect();
    const failedLogins = securityEvents.filter((event) => ["LOGIN_FALLIDO", "VERIFICACION_PRIVILEGIADA_FALLIDA", "VERIFICACION_PRIVILEGIADA_BLOQUEADA"].includes(event.tipo)).length;
    const blockedUsers = securityEvents.filter((event) => event.tipo === "USUARIO_BLOQUEADO").length;
    if (failedLogins || blockedUsers) {
      alerts.push({ code: "SECURITY_ALERT", message: `Seguridad: ${failedLogins} intentos fallidos y ${blockedUsers} bloqueos en las ultimas 24 horas.` });
    }
    return { checkedAt: new Date(now).toISOString(), alerts };
  },
});

// Punto de comprobacion pequeño y autenticado. No expone datos operativos;
// sirve para verificar que Convex, la API y la sesion siguen respondiendo.
export const check = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireModuleRead(ctx, args.sessionToken, "health");
    const now = Date.now();
    const instances = await ctx.db.query("botInstances").take(100);
    const latestApprovedBot = instances
      .filter((instance) => instance.allowed)
      .sort((left, right) => right.lastSeen - left.lastSeen)[0];
    const bot = latestApprovedBot
      ? {
          status: now - latestApprovedBot.lastSeen <= 90_000 ? "online" : "offline",
          lastSeen: latestApprovedBot.lastSeen,
          hostname: latestApprovedBot.hostname,
          version: latestApprovedBot.botVersion || "Sin version",
        }
      : { status: "unconfigured" };
    const pendingBot = instances
      .filter((instance) => !instance.allowed)
      .sort((left, right) => right.lastSeen - left.lastSeen)[0];
    const latestBackup = await ctx.db
      .query("respaldos")
      .withIndex("by_created_at")
      .order("desc")
      .first();
    const backup = latestBackup
      ? {
          status: now - new Date(latestBackup.createdAt).getTime() <= 26 * 60 * 60 * 1000 ? "current" : "stale",
          createdAt: latestBackup.createdAt,
          cadence: latestBackup.cadence,
          recordCount: latestBackup.recordCount,
          bytes: latestBackup.bytes,
        }
      : { status: "unconfigured" };
    const securitySince = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const recentSecurityEvents = await ctx.db
      .query("auditoria")
      .withIndex("by_fecha", (q) => q.gte("fecha", securitySince))
      .collect();
    const failedLogins = recentSecurityEvents.filter((event) =>
      ["LOGIN_FALLIDO", "VERIFICACION_PRIVILEGIADA_FALLIDA", "VERIFICACION_PRIVILEGIADA_BLOQUEADA"].includes(event.tipo)
    ).length;
    const blockedUsers = recentSecurityEvents.filter((event) => event.tipo === "USUARIO_BLOQUEADO").length;
    const security = {
      status: failedLogins || blockedUsers ? "alert" : "healthy",
      failedLogins,
      blockedUsers,
    };
    const auditEvents = await ctx.db
      .query("auditoria")
      .withIndex("by_fecha")
      .order("desc")
      .take(100);
    const recentEvents = auditEvents
      .filter((event) =>
        event.tipo.startsWith("BACKUP_") ||
        event.tipo.startsWith("BOT_") ||
        event.tipo.startsWith("SISTEMA_ERROR_") ||
        event.tipo.startsWith("LOGIN_") ||
        event.tipo === "USUARIO_BLOQUEADO" ||
        event.tipo.startsWith("PERMISOS_")
      )
      .slice(0, 6)
      .map((event) => ({ tipo: event.tipo, descripcion: event.descripcion, fecha: event.fecha }));
    const systemErrors = auditEvents
      .filter((event) => event.tipo.startsWith("SISTEMA_ERROR_") || event.tipo.startsWith("BOT_ERROR_"))
      .slice(0, 6)
      .map((event) => ({ tipo: event.tipo, descripcion: event.descripcion, fecha: event.fecha }));
    const history = await ctx.db
      .query("saludHistorial")
      .withIndex("by_created_at")
      .order("desc")
      .take(12);
    return {
      checkedAt: new Date(now).toISOString(),
      bot,
      pendingBot: pendingBot ? {
        id: pendingBot._id,
        hostname: pendingBot.hostname,
        lastSeen: pendingBot.lastSeen,
        version: pendingBot.botVersion || "Sin version",
      } : null,
      backup,
      nextBackupAt: getNextDailyBackupAt(),
      security,
      recentEvents,
      systemErrors,
      history,
    };
  },
});
