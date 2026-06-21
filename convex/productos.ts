import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireModuleWrite } from "./authorization";

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
  args: { sessionToken: v.string(), ...productFields },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "products");
    const { sessionToken: _sessionToken, ...productArgs } = args;
    const products = await ctx.db.query("productos").take(1000);
    const duplicate = products.find((product) =>
      product.active !== false &&
      normalizeSearch(product.name) === normalizeSearch(productArgs.name) &&
      normalizeSearch(product.exactModel || "") === normalizeSearch(productArgs.exactModel || ""),
    );
    if (duplicate) {
      throw new Error("Ese producto ya existe.");
    }
    const productNumber = productArgs.productNumber && productArgs.productNumber > 0
      ? productArgs.productNumber
      : products.reduce((max, product) => Math.max(max, Number(product.productNumber) || 0), 0) + 1;
    return await ctx.db.insert("productos", {
      ...productArgs,
      productNumber,
      exactModel: productArgs.exactModel || "",
      providerPrice: Math.max(0, Number(productArgs.providerPrice) || 0),
      quantity: Math.max(0, Number(productArgs.quantity) || 0),
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("productos"),
    patch: v.object(productPatchFields),
  },
  handler: async (ctx, args) => {
    await requireModuleWrite(ctx, args.sessionToken, "products");
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
