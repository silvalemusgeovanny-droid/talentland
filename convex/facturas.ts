import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireActiveSession, requireModuleRead } from "./authorization";

const invoiceFields = {
  sourceType: v.string(),
  sourceId: v.optional(v.string()),
  sourceNumber: v.number(),
  customer: v.string(),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  brand: v.optional(v.string()),
  model: v.optional(v.string()),
  repairType: v.optional(v.string()),
  product: v.optional(v.string()),
  productModel: v.optional(v.string()),
  imei: v.optional(v.string()),
  dui: v.optional(v.string()),
  total: v.number(),
  discount: v.number(),
  paid: v.number(),
  remaining: v.number(),
  status: v.string(),
  issuedAt: v.string(),
  issuedByUsername: v.string(),
  issuedByName: v.string(),
  details: v.optional(v.string()),
};

export const record = mutation({
  args: { sessionToken: v.string(), ...invoiceFields },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, args.sessionToken);
    if (args.sourceType !== "sale" && args.sourceType !== "repair") {
      throw new Error("Tipo de factura no valido.");
    }
    const modules = Array.isArray(user.user.modules) ? user.user.modules : user.roleModules;
    if (user.user.role !== "root" && !modules.includes(args.sourceType === "sale" ? "sales" : "repairs")) {
      throw new Error("No tienes permiso para emitir esta factura.");
    }

    if (args.sourceId) {
      const existingInvoices = await ctx.db
        .query("facturas")
        .withIndex("by_source_id", (q) => q.eq("sourceId", args.sourceId))
        .collect();
      const existing = existingInvoices.find((invoice) => invoice.sourceType === args.sourceType);
      if (existing) return existing;
    }

    const { sessionToken: _sessionToken, ...invoice } = args;
    return await ctx.db.insert("facturas", {
      ...invoice,
      status: invoice.remaining > 0.005 ? "pendiente" : "cancelada",
      issuedByUsername: user.user.username,
      issuedByName: user.user.name,
    });
  },
});

export const list = query({
  args: { sessionToken: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireModuleRead(ctx, args.sessionToken, "statistics");
    return await ctx.db.query("facturas").order("desc").take(args.limit || 500);
  },
});
