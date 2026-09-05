import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireActiveSession, requireModuleWrite } from "./authorization";

export const registrar = mutation({
  args: {
    sessionToken: v.string(),
    tipo: v.string(),
    descripcion: v.string(),
    usuario: v.optional(v.string()),
    datos: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireModuleWrite(ctx, args.sessionToken, "products");
    await ctx.db.insert("auditoria", {
      tipo: args.tipo,
      descripcion: args.descripcion,
      usuario: user.username,
      datos: args.datos || "",
      fecha: new Date().toISOString(),
    });
  },
});

export const registrarBot = mutation({
  args: {
    sessionToken: v.string(),
    tipo: v.string(),
    descripcion: v.string(),
    datos: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, args.sessionToken);
    await ctx.db.insert("auditoria", {
      tipo: args.tipo,
      descripcion: args.descripcion,
      usuario: "telegram-bot",
      datos: args.datos || "",
      fecha: new Date().toISOString(),
    });
  },
});

export const obtener = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, args.sessionToken);
    if (user.role !== "root") throw new Error("Solo root puede consultar la bitacora.");
    return await ctx.db.query("auditoria").order("desc").take(100);
  },
});
