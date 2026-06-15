import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const repairFields = {
  sourceId: v.optional(v.string()),
  repairNumber: v.number(),
  customer: v.string(),
  deviceType: v.string(),
  phone: v.string(),
  email: v.optional(v.string()),
  brand: v.string(),
  model: v.string(),
  repairType: v.string(),
  status: v.string(),
  createdAt: v.string(),
  deliveredAt: v.string(),
  repairPrice: v.number(),
  abono: v.optional(v.number()),
  notes: v.string(),
};

const repairPatchFields = {
  sourceId: v.optional(v.string()),
  repairNumber: v.optional(v.number()),
  customer: v.optional(v.string()),
  deviceType: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  brand: v.optional(v.string()),
  model: v.optional(v.string()),
  repairType: v.optional(v.string()),
  status: v.optional(v.string()),
  createdAt: v.optional(v.string()),
  deliveredAt: v.optional(v.string()),
  repairPrice: v.optional(v.number()),
  abono: v.optional(v.number()),
  notes: v.optional(v.string()),
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export const list = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const search = normalizeSearch((args.search || "").trim());
    const limit = args.limit || 50;

    if (!search) {
      return await ctx.db.query("reparaciones").order("desc").take(limit);
    }

    const repairs = await ctx.db.query("reparaciones").order("desc").take(10000);

    return repairs.filter((repair) =>
      [
        repair.customer,
        repair.email,
        repair.deviceType,
        repair.brand,
        repair.model,
        repair.repairType,
        repair.status,
        repair.notes,
        String(repair.repairNumber),
      ].some((field) => normalizeSearch(field || "").includes(search)),
    ).slice(0, limit);
  },
});

export const create = mutation({
  args: repairFields,
  handler: async (ctx, args) => {
    return await ctx.db.insert("reparaciones", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("reparaciones"),
    patch: v.object(repairPatchFields),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.patch);
    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("reparaciones"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const importBatch = mutation({
  args: {
    repairs: v.array(v.object(repairFields)),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let skipped = 0;

    for (const repair of args.repairs) {
      const existing = repair.sourceId
        ? await ctx.db
            .query("reparaciones")
            .withIndex("by_source_id", (q) => q.eq("sourceId", repair.sourceId))
            .unique()
        : null;

      if (existing) {
        skipped += 1;
        continue;
      }

      await ctx.db.insert("reparaciones", repair);
      inserted += 1;
    }

    return { inserted, skipped };
  },
});
