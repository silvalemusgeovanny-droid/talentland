import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireModuleRead, requireModuleWrite } from "./authorization";

function normalizeName(value: string) {
  return String(value || "").trim().replace(/\s+/g, " ").toUpperCase();
}

export const listApproved = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireModuleRead(ctx, args.sessionToken, "repairs");
    return await ctx.db.query("tiposReparacion")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .order("desc")
      .collect();
  },
});

export const listPending = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireModuleRead(ctx, args.sessionToken, "parts");
    return await ctx.db.query("tiposReparacion")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

export const request = mutation({
  args: { sessionToken: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const user = await requireModuleWrite(ctx, args.sessionToken, "repairs");
    const name = normalizeName(args.name);
    if (!name) throw new Error("Escribe un tipo de reparacion valido.");

    const sourceId = name.toLowerCase();
    const existing = await ctx.db.query("tiposReparacion")
      .withIndex("by_source_id", (q) => q.eq("sourceId", sourceId))
      .unique();
    const now = new Date().toISOString();
    if (existing) {
      if (existing.status === "dismissed") {
        await ctx.db.patch(existing._id, {
          status: "pending",
          createdBy: user.username,
          createdAt: now,
          updatedAt: now,
          resolvedBy: undefined,
          resolvedAt: undefined,
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("tiposReparacion", {
      sourceId,
      name,
      status: "pending",
      createdBy: user.username,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const approve = mutation({
  args: { sessionToken: v.string(), id: v.id("tiposReparacion"), resolvedAt: v.string() },
  handler: async (ctx, args) => {
    const user = await requireModuleWrite(ctx, args.sessionToken, "parts");
    await ctx.db.patch(args.id, { status: "approved", resolvedBy: user.username, resolvedAt: args.resolvedAt, updatedAt: args.resolvedAt });
    return args.id;
  },
});

export const dismiss = mutation({
  args: { sessionToken: v.string(), id: v.id("tiposReparacion"), resolvedAt: v.string() },
  handler: async (ctx, args) => {
    const user = await requireModuleWrite(ctx, args.sessionToken, "parts");
    await ctx.db.patch(args.id, { status: "dismissed", resolvedBy: user.username, resolvedAt: args.resolvedAt, updatedAt: args.resolvedAt });
    return args.id;
  },
});
