import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const productFields = {
  sourceId: v.optional(v.string()),
  productNumber: v.optional(v.number()),
  name: v.string(),
  exactModel: v.optional(v.string()),
  providerPrice: v.optional(v.number()),
  price: v.number(),
  quantity: v.optional(v.number()),
  active: v.boolean(),
  createdAt: v.string(),
  updatedAt: v.string(),
};

const productPatchFields = {
  sourceId: v.optional(v.string()),
  productNumber: v.optional(v.number()),
  name: v.optional(v.string()),
  exactModel: v.optional(v.string()),
  providerPrice: v.optional(v.number()),
  price: v.optional(v.number()),
  quantity: v.optional(v.number()),
  active: v.optional(v.boolean()),
  createdAt: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("productos").order("desc").take(1000);
    return products.sort((a, b) =>
      (Number(a.productNumber) || Number.MAX_SAFE_INTEGER) - (Number(b.productNumber) || Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name)
    );
  },
});

export const create = mutation({
  args: productFields,
  handler: async (ctx, args) => {
    const products = await ctx.db.query("productos").take(1000);
    const duplicate = products.find((product) =>
      product.active !== false &&
      normalizeSearch(product.name) === normalizeSearch(args.name) &&
      normalizeSearch(product.exactModel || "") === normalizeSearch(args.exactModel || ""),
    );
    if (duplicate) {
      throw new Error("Ese producto ya existe.");
    }
    const productNumber = args.productNumber && args.productNumber > 0
      ? args.productNumber
      : products.reduce((max, product) => Math.max(max, Number(product.productNumber) || 0), 0) + 1;
    return await ctx.db.insert("productos", {
      ...args,
      productNumber,
      exactModel: args.exactModel || "",
      providerPrice: Math.max(0, Number(args.providerPrice) || 0),
      quantity: Math.max(0, Number(args.quantity) || 0),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("productos"),
    patch: v.object(productPatchFields),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Producto no encontrado.");
    const nextProduct = { ...current, ...args.patch };
    const products = await ctx.db.query("productos").take(1000);
    const duplicate = products.find((product) =>
      String(product._id) !== String(args.id) &&
      product.active !== false &&
      nextProduct.active !== false &&
      normalizeSearch(product.name) === normalizeSearch(nextProduct.name) &&
      normalizeSearch(product.exactModel || "") === normalizeSearch(nextProduct.exactModel || ""),
    );
    if (duplicate) {
      throw new Error("Ese producto ya existe.");
    }
    await ctx.db.patch(args.id, args.patch);
    return args.id;
  },
});
