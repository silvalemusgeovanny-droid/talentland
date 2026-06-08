import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const partFields = {
  sourceId: v.optional(v.string()),
  name: v.string(),
  brand: v.string(),
  model: v.string(),
  category: v.string(),
  price: v.number(),
  customerPrice: v.number(),
  stock: v.number(),
  quality: v.string(),
  supplier: v.string(),
  publishedAt: v.string(),
  updatedAt: v.string(),
};

function normalizePartSearch(value = "") {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function getPartDuplicateKey(part: any) {
  return [part.name, part.brand, part.model, part.category, part.quality]
    .map(normalizePartSearch)
    .join("|");
}

async function findDuplicatePart(ctx: any, part: any, currentId = "") {
  const duplicateKey = getPartDuplicateKey(part);
  const parts = await ctx.db.query("repuestos").take(2000);
  return parts.find((existingPart: any) => {
    if (String(existingPart._id) === currentId) return false;
    return getPartDuplicateKey(existingPart) === duplicateKey;
  });
}

function duplicateError(part: any) {
  return new Error(`Duplicado: ya existe ${part.name} ${part.brand} ${part.model}.`);
}

function hasModelSupplierConflict(part: any) {
  return Boolean(normalizePartSearch(part.model)) && normalizePartSearch(part.model) === normalizePartSearch(part.supplier);
}

function modelSupplierConflictError() {
  return new Error("Revisa el modelo y proveedor: no pueden ser iguales.");
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("repuestos").order("desc").take(2000);
  },
});

export const create = mutation({
  args: partFields,
  handler: async (ctx, args) => {
    if (hasModelSupplierConflict(args)) throw modelSupplierConflictError();

    const duplicate = await findDuplicatePart(ctx, args);
    if (duplicate) throw duplicateError(duplicate);

    if (args.sourceId) {
      const existing = await ctx.db
        .query("repuestos")
        .withIndex("by_source_id", (q) => q.eq("sourceId", args.sourceId))
        .unique();

      if (existing) return existing._id;
    }

    return await ctx.db.insert("repuestos", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("repuestos"),
    patch: v.object({
      name: v.string(),
      brand: v.string(),
      model: v.string(),
      category: v.string(),
      price: v.number(),
      customerPrice: v.number(),
      stock: v.number(),
      quality: v.string(),
      supplier: v.string(),
      publishedAt: v.string(),
      updatedAt: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    if (hasModelSupplierConflict(args.patch)) throw modelSupplierConflictError();

    const duplicate = await findDuplicatePart(ctx, args.patch, String(args.id));
    if (duplicate) throw duplicateError(duplicate);

    await ctx.db.patch(args.id, args.patch);
  },
});

export const remove = mutation({
  args: {
    id: v.id("repuestos"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const importBatch = mutation({
  args: {
    parts: v.array(v.object(partFields)),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let skipped = 0;

    for (const part of args.parts) {
      if (hasModelSupplierConflict(part)) {
        skipped += 1;
        continue;
      }

      const duplicate = await findDuplicatePart(ctx, part);
      if (duplicate) {
        skipped += 1;
        continue;
      }

      const existing = part.sourceId
        ? await ctx.db
            .query("repuestos")
            .withIndex("by_source_id", (q) => q.eq("sourceId", part.sourceId))
            .unique()
        : null;

      if (existing) {
        skipped += 1;
        continue;
      }

      await ctx.db.insert("repuestos", part);
      inserted += 1;
    }

    return { inserted, skipped };
  },
});
