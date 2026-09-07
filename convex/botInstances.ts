import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const register = mutation({
  args: {
    machineId: v.string(),
    hostname: v.string(),
    macs: v.array(v.string()),
    ip: v.string(),
    botVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("botInstances")
      .filter((q) => q.eq(q.field("machineId"), args.machineId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: Date.now(),
        ip: args.ip,
        botVersion: args.botVersion,
      });
      return { allowed: existing.allowed, instanceId: existing._id };
    }

    const id = await ctx.db.insert("botInstances", {
      machineId: args.machineId,
      hostname: args.hostname,
      macs: args.macs,
      ip: args.ip,
      botVersion: args.botVersion,
      allowed: false,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
    });

    return { allowed: false, instanceId: id };
  },
});

export const getMyStatus = query({
  args: { machineId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("botInstances")
      .filter((q) => q.eq(q.field("machineId"), args.machineId))
      .unique();
  },
});

export const approve = mutation({
  args: { instanceId: v.id("botInstances"), allow: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await auth.getCurrentUser(ctx);
    if (identity?.role !== "root") throw new Error("Solo root");
    await ctx.db.patch(args.instanceId, {
      allowed: args.allow,
      approvedBy: identity._id,
      lastSeen: Date.now(),
    });
    return { ok: true };
  },
});