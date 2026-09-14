import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireModuleRead } from "./authorization";

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
    };
  },
});
