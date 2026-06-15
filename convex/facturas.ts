import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const invoiceArgs = {
  repairId: v.optional(v.string()),
  repairNumber: v.number(),
  customer: v.string(),
  phone: v.string(),
  email: v.optional(v.string()),
  brand: v.string(),
  model: v.string(),
  repairType: v.string(),
  status: v.string(),
  total: v.number(),
  abono: v.optional(v.number()),
  resta: v.optional(v.number()),
  issuedAt: v.string(),
  issuedByUsername: v.string(),
  issuedByName: v.string(),
};

export const create = mutation({
  args: invoiceArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert("facturas", args);
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("facturas").order("desc").take(args.limit || 100);
  },
});
