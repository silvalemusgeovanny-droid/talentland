import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireModuleWrite } from "./authorization";

export const registrar = mutation({
  args: {
    sessionToken: v.string(),
    tipo: v.string(),
    descripcion: v.string(),
    usuario: v.optional(v.string()),
    datos: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "products");
    await ctx.db.insert("auditoria", {
      tipo: args.tipo,
      descripcion: args.descripcion,
      usuario: args.usuario || "sistema",
      datos: args.datos || "",
      fecha: new Date().toISOString(),
    });
  },
});

export const obtener = query({
  handler: async (ctx) => {
    return await ctx.db.query("auditoria").order("desc").take(100);
  },
});
