import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireModuleWrite } from "./authorization";

const saleFields = {
  sourceId: v.optional(v.string()),
  saleNumber: v.number(),
  productId: v.string(),
  product: v.string(),
  productModel: v.string(),
  quantity: v.number(),
  price: v.number(),
  discount: v.number(),
  total: v.number(),
  received: v.number(),
  change: v.number(),
  createdAt: v.string(),
};

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("ventas").order("desc").take(args.limit || 500);
  },
});

export const create = mutation({
  args: { sessionToken: v.string(), ...saleFields },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "sales");
    const { sessionToken: _sessionToken, ...sale } = args;
    const existing = sale.sourceId
      ? await ctx.db
          .query("ventas")
          .withIndex("by_source_id", (q) => q.eq("sourceId", sale.sourceId))
          .unique()
      : null;
    if (existing) return existing._id;
    return await ctx.db.insert("ventas", sale);
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("ventas"),
  },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "sales");
    await ctx.db.delete(args.id);
    return args.id;
  },
});
