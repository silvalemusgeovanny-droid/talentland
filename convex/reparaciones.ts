import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireModuleWrite } from "./authorization";

const repairPartFields = {
  partId: v.string(),
  sourcePartId: v.optional(v.string()),
  name: v.string(),
  brand: v.optional(v.string()),
  model: v.optional(v.string()),
  quality: v.optional(v.string()),
  supplier: v.optional(v.string()),
  quantity: v.number(),
  unitPrice: v.number(),
  unitPriceCents: v.optional(v.number()),
  unitCost: v.optional(v.number()),
  unitCostCents: v.optional(v.number()),
  subtotal: v.number(),
  subtotalCents: v.optional(v.number()),
};

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
  repairParts: v.optional(v.array(v.object(repairPartFields))),
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
  repairParts: v.optional(v.array(v.object(repairPartFields))),
  notes: v.optional(v.string()),
};

function getRepairPartsUsage(parts: Array<{ partId: string; quantity: number }> | undefined) {
  const usage = new Map<string, number>();
  for (const line of parts || []) {
    const partId = String(line.partId || "");
    const quantity = Math.max(0, Math.trunc(Number(line.quantity) || 0));
    if (!partId || !quantity) continue;
    usage.set(partId, (usage.get(partId) || 0) + quantity);
  }
  return usage;
}

async function applyRepairPartsStockDelta(ctx: any, previousParts: Array<{ partId: string; quantity: number }> | undefined, nextParts: Array<{ partId: string; quantity: number }> | undefined) {
  const previousUsage = getRepairPartsUsage(previousParts);
  const nextUsage = getRepairPartsUsage(nextParts);
  const partIds = new Set([...previousUsage.keys(), ...nextUsage.keys()]);

  for (const rawPartId of partIds) {
    const delta = (nextUsage.get(rawPartId) || 0) - (previousUsage.get(rawPartId) || 0);
    if (!delta) continue;

    const part = await ctx.db.get(rawPartId as any);
    if (!part) {
      throw new Error("No se encontro un repuesto usado en la reparacion.");
    }

    const currentStock = Math.trunc(Number(part.stock) || 0);
    const nextStock = currentStock - delta;

    await ctx.db.patch(rawPartId as any, {
      stock: nextStock,
      updatedAt: new Date().toISOString(),
    });
  }
}

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
  args: { sessionToken: v.string(), ...repairFields },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "repairs");
    const { sessionToken: _sessionToken, ...repair } = args;
    await applyRepairPartsStockDelta(ctx, [], repair.repairParts);
    return await ctx.db.insert("reparaciones", repair);
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("reparaciones"),
    patch: v.object(repairPatchFields),
  },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "repairs");
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("No se encontro la reparacion.");
    }
    if (Object.prototype.hasOwnProperty.call(args.patch, "repairParts")) {
      await applyRepairPartsStockDelta(ctx, existing.repairParts, args.patch.repairParts);
    }
    await ctx.db.patch(args.id, args.patch);
    return args.id;
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("reparaciones"),
  },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "repairs");
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("No se encontro la reparacion.");
    }
    await applyRepairPartsStockDelta(ctx, existing.repairParts, []);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const importBatch = mutation({
  args: {
    sessionToken: v.string(),
    repairs: v.array(v.object(repairFields)),
  },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "repairs");
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
