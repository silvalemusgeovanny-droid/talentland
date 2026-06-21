import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireModuleWrite } from "./authorization";

const noteFields = {
  sourceId: v.optional(v.string()),
  text: v.string(),
  authorName: v.string(),
  authorUsername: v.string(),
  done: v.boolean(),
  createdAt: v.string(),
  updatedAt: v.string(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notas").order("desc").take(500);
  },
});

export const create = mutation({
  args: { sessionToken: v.string(), ...noteFields },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "notes");
    const { sessionToken: _sessionToken, ...note } = args;
    if (note.sourceId) {
      const existing = await ctx.db
        .query("notas")
        .withIndex("by_source_id", (q) => q.eq("sourceId", note.sourceId))
        .unique();

      if (existing) return existing._id;
    }

    return await ctx.db.insert("notas", note);
  },
});

export const importBatch = mutation({
  args: {
    sessionToken: v.string(),
    notes: v.array(v.object(noteFields)),
  },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "notes");
    let inserted = 0;
    let skipped = 0;

    for (const note of args.notes) {
      const existing = note.sourceId
        ? await ctx.db
            .query("notas")
            .withIndex("by_source_id", (q) => q.eq("sourceId", note.sourceId))
            .unique()
        : null;

      if (existing) {
        skipped += 1;
        continue;
      }

      await ctx.db.insert("notas", note);
      inserted += 1;
    }

    return { inserted, skipped };
  },
});

export const toggle = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("notas"),
    done: v.boolean(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "notes");
    await ctx.db.patch(args.id, {
      done: args.done,
      updatedAt: args.updatedAt,
    });
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("notas"),
  },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "notes");
    await ctx.db.delete(args.id);
  },
});
