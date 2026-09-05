import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireModuleRead, requireModuleWrite } from "./authorization";

const pendingFields = {
  sourceId: v.optional(v.string()),
  repairId: v.optional(v.string()),
  repairNumber: v.number(),
  brand: v.string(),
  model: v.string(),
  partName: v.string(),
  status: v.string(),
  createdBy: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  resolvedBy: v.optional(v.string()),
  resolvedAt: v.optional(v.string()),
};

function normalizePendingKey(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

export const list = query({
  args: {
    sessionToken: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireModuleRead(ctx, args.sessionToken, "statistics");
    const status = args.status || "pending";
    const limit = args.limit || 100;
    return await ctx.db
      .query("catalogoPendientes")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .take(limit);
  },
});

export const create = mutation({
  args: { sessionToken: v.string(), ...pendingFields },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "repairs");
    const { sessionToken: _sessionToken, ...pending } = args;
    const sourceId = pending.sourceId || [
      pending.repairId || pending.repairNumber,
      pending.brand,
      pending.model,
      pending.partName,
    ].map(normalizePendingKey).join("|");

    const existing = await ctx.db
      .query("catalogoPendientes")
      .withIndex("by_source_id", (q) => q.eq("sourceId", sourceId))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("catalogoPendientes", { ...pending, sourceId, status: pending.status || "pending" });
  },
});

export const resolve = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("catalogoPendientes"),
    resolvedBy: v.optional(v.string()),
    resolvedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireModuleWrite(ctx, args.sessionToken, "parts");
    await ctx.db.patch(args.id, {
      status: "resolved",
      resolvedBy: args.resolvedBy || user.username,
      resolvedAt: args.resolvedAt,
      updatedAt: args.resolvedAt,
    });
    return args.id;
  },
});

export const dismiss = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("catalogoPendientes"),
    resolvedBy: v.optional(v.string()),
    resolvedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireModuleWrite(ctx, args.sessionToken, "parts");
    await ctx.db.patch(args.id, {
      status: "dismissed",
      resolvedBy: args.resolvedBy || user.username,
      resolvedAt: args.resolvedAt,
      updatedAt: args.resolvedAt,
    });
    return args.id;
  },
});
