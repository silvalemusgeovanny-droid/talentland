import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireActiveSession, requireModuleRead, requireModuleWrite } from "./authorization";

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
    usuario: v.optional(v.string()),
    datos: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, args.sessionToken);
    await ctx.db.insert("auditoria", {
      tipo: args.tipo,
      descripcion: args.descripcion,
      usuario: args.usuario || "telegram-bot",
      datos: args.datos || "",
      fecha: new Date().toISOString(),
    });
  },
});

// Registra fallos tecnicos enviados por la aplicacion web. La sesion permite
// atribuirlos, sin dar al navegador acceso directo a la tabla de auditoria.
export const registrarErrorSistema = mutation({
  args: {
    sessionToken: v.string(),
    origen: v.string(),
    mensaje: v.string(),
    contexto: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, args.sessionToken);
    await ctx.db.insert("auditoria", {
      tipo: "SISTEMA_ERROR_CLIENTE",
      descripcion: `[${args.origen.slice(0, 80)}] ${args.mensaje.slice(0, 500)}`,
      usuario: user.username,
      datos: (args.contexto || "").slice(0, 1_000),
      fecha: new Date().toISOString(),
    });
  },
});

export const obtener = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireModuleRead(ctx, args.sessionToken, "statistics");
    return await ctx.db.query("auditoria").order("desc").take(100);
  },
});
