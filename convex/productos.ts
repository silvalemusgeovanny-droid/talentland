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

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getSessionUser(ctx: any, sessionToken = "") {
  if (!sessionToken) return null;
  const tokenHash = await sha256(sessionToken);
  const session = await ctx.db
    .query("sesiones")
    .withIndex("by_token_hash", (q: any) => q.eq("tokenHash", tokenHash))
    .unique();
  if (!session || session.expiresAt < Date.now()) return null;
  const user = await ctx.db.get(session.userId);
  if (!user || !user.active || (user.accountStatus && user.accountStatus !== "active")) return null;
  return user;
}

function userCanViewInternalCost(user: any) {
  return user?.role === "root" || (Array.isArray(user?.modules) && user.modules.includes("partsCost"));
}

function sanitizeProductForUser(product: any, user: any) {
  return {
    ...product,
    providerPrice: userCanViewInternalCost(user) ? product.providerPrice : 0,
  };
}

function requireInternalCostPermission(user: any) {
  if (!userCanViewInternalCost(user)) {
    throw new Error("No tienes permiso para modificar costos internos.");
  }
}

export const list = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx, args.sessionToken || "");
    const products = await ctx.db.query("productos").order("desc").take(1000);
    return products.sort((a, b) =>
      (Number(a.productNumber) || Number.MAX_SAFE_INTEGER) - (Number(b.productNumber) || Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name)
    ).map((product) => sanitizeProductForUser(product, user));
  },
});

export const create = mutation({
  args: { sessionToken: v.string(), ...productFields },
  handler: async (ctx, args) => {
    const user = await requireModuleWrite(ctx, args.sessionToken, "products");
    requireInternalCostPermission(user);
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
    const user = await requireModuleWrite(ctx, args.sessionToken, "products");
    if ("providerPrice" in args.patch) requireInternalCostPermission(user);
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
