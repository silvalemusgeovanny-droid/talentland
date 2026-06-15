import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
  args: saleFields,
  handler: async (ctx, args) => {
    const existing = args.sourceId
      ? await ctx.db
          .query("ventas")
          .withIndex("by_source_id", (q) => q.eq("sourceId", args.sourceId))
          .unique()
      : null;
    if (existing) return existing._id;
    return await ctx.db.insert("ventas", args);
  },
});

export const remove = mutation({
  args: {
    id: v.id("ventas"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
