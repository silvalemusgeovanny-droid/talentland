import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const repairFields = {
  sourceId: v.optional(v.string()),
  repairNumber: v.number(),
  customer: v.string(),
  deviceType: v.string(),
  phone: v.string(),
  brand: v.string(),
  model: v.string(),
  repairType: v.string(),
  status: v.string(),
  createdAt: v.string(),
  deliveredAt: v.string(),
  repairPrice: v.number(),
  notes: v.string(),
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
    const limit = args.limit || 200;

    if (!search) {
      return await ctx.db.query("reparaciones").order("desc").take(limit);
    }

    const repairs = await ctx.db.query("reparaciones").order("desc").take(10000);

    return repairs.filter((repair) =>
      [
        repair.customer,
        repair.deviceType,
        repair.brand,
        repair.model,
        repair.repairType,
        repair.status,
        repair.notes,
        String(repair.repairNumber),
      ].some((field) => normalizeSearch(field || "").includes(search)),
    );
  },
});

export const create = mutation({
  args: repairFields,
  handler: async (ctx, args) => {
    return await ctx.db.insert("reparaciones", args);
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
