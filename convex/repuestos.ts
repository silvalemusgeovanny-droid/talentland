import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const partFields = {
  sourceId: v.optional(v.string()),
  name: v.string(),
  brand: v.string(),
  model: v.string(),
  category: v.string(),
  price: v.number(),
  priceCents: v.optional(v.number()),
  customerPrice: v.number(),
  customerPriceCents: v.optional(v.number()),
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

function normalizePartType(value = "") {
  const cleanedValue = String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  if (!cleanedValue) return "";
  return cleanedValue.charAt(0).toUpperCase() + cleanedValue.slice(1);
}

function normalizeCategory(value = "") {
  const categoryMap: Record<string, string> = {
    Celular: "Telefono",
    Telefono: "Telefono",
    Tablet: "Tablet",
    Computadora: "Computadora",
    Electrodomestico: "Bocina",
    Bocina: "Bocina",
  };
  return categoryMap[value] || normalizePartType(value) || "Telefono";
}

function getPartDuplicateKey(part: any) {
  return [part.name, part.brand, part.model, normalizeCategory(part.category), normalizeQuality(part.quality)]
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

function normalizeQuality(value = "") {
  const quality = String(value || "").trim();
  const normalized = normalizePartSearch(quality);
  if (["premium", "premiun", "gx"].includes(normalized)) return "GX";
  if (["originall", "original"].includes(normalized)) return "Original";
  if (["amoled", "am oled"].includes(normalized)) return "Amoled";
  if (normalized === "oled") return "OLED";
  if (normalized === "tft") return "TFT";
  if (normalized === "ips") return "IPS";
  if (["generico", "generica"].includes(normalized)) return "Generica";
  return quality || "Original";
}

function parseMoneyCents(value: unknown) {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");
  const match = normalizedValue.match(/^(\d+)(?:\.(\d+))?$/);
  if (!match) return 0;

  const pesos = Number(match[1]);
  const decimalDigits = `${match[2] || ""}000`;
  const cents = Number(decimalDigits.slice(0, 2)) + (Number(decimalDigits[2]) >= 5 ? 1 : 0);
  return pesos * 100 + cents;
}

function centsToMoney(cents: number) {
  return cents / 100;
}

function getMoneyCents(part: any, moneyField: string, centsField: string) {
  const cents = Number(part?.[centsField]);
  if (Number.isInteger(cents)) return cents;
  return parseMoneyCents(part?.[moneyField]);
}

function normalizeMoneyFields(part: any) {
  const priceCents = getMoneyCents(part, "price", "priceCents");
  const customerPriceCents = getMoneyCents(part, "customerPrice", "customerPriceCents");
  return {
    price: centsToMoney(priceCents),
    priceCents,
    customerPrice: centsToMoney(customerPriceCents),
    customerPriceCents,
  };
}

function normalizeStockQuantity(value: unknown) {
  const stock = Number(value);
  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    throw new Error("La existencia debe ser una cantidad entera, sin decimales.");
  }
  return stock;
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
    const part = {
      ...args,
      ...normalizeMoneyFields(args),
      stock: normalizeStockQuantity(args.stock),
      quality: normalizeQuality(args.quality),
      category: normalizeCategory(args.category),
    };
    if (hasModelSupplierConflict(part)) throw modelSupplierConflictError();

    const duplicate = await findDuplicatePart(ctx, part);
    if (duplicate) throw duplicateError(duplicate);

    if (args.sourceId) {
      const existing = await ctx.db
        .query("repuestos")
        .withIndex("by_source_id", (q) => q.eq("sourceId", args.sourceId))
        .unique();

      if (existing) return existing._id;
    }

    return await ctx.db.insert("repuestos", part);
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
      priceCents: v.optional(v.number()),
      customerPrice: v.number(),
      customerPriceCents: v.optional(v.number()),
      stock: v.number(),
      quality: v.string(),
      supplier: v.string(),
      publishedAt: v.string(),
      updatedAt: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const patch = {
      ...args.patch,
      ...normalizeMoneyFields(args.patch),
      stock: normalizeStockQuantity(args.patch.stock),
      quality: normalizeQuality(args.patch.quality),
      category: normalizeCategory(args.patch.category),
    };
    if (hasModelSupplierConflict(patch)) throw modelSupplierConflictError();

    const duplicate = await findDuplicatePart(ctx, patch, String(args.id));
    if (duplicate) throw duplicateError(duplicate);

    await ctx.db.patch(args.id, patch);
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

    for (const rawPart of args.parts) {
      let part;
      try {
        part = {
          ...rawPart,
          ...normalizeMoneyFields(rawPart),
          stock: normalizeStockQuantity(rawPart.stock),
          quality: normalizeQuality(rawPart.quality),
          category: normalizeCategory(rawPart.category),
        };
      } catch {
        skipped += 1;
        continue;
      }

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
