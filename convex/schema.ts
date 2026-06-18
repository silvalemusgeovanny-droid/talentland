import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  usuarios: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.string(),
    modules: v.optional(v.array(v.string())),
    active: v.boolean(),
    accountStatus: v.optional(v.string()),
    failedLoginCount: v.optional(v.number()),
    lockedUntil: v.optional(v.number()),
    mustChangePassword: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.string()),
    lastFailedLoginAt: v.optional(v.string()),
    disabledAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_username", ["username"]),

  sesiones: defineTable({
    tokenHash: v.string(),
    userId: v.id("usuarios"),
    username: v.string(),
    expiresAt: v.number(),
    createdAt: v.string(),
    lastSeenAt: v.string(),
  }).index("by_token_hash", ["tokenHash"]),

  presencias: defineTable({
    tokenHash: v.string(),
    userId: v.id("usuarios"),
    username: v.string(),
    name: v.string(),
    role: v.string(),
    lastSeenAt: v.number(),
  }).index("by_token_hash", ["tokenHash"]),

  reparaciones: defineTable({
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
  })
    .index("by_source_id", ["sourceId"])
    .index("by_repair_number", ["repairNumber"])
    .index("by_created_at", ["createdAt"])
    .index("by_delivered_at", ["deliveredAt"]),

  auditoria: defineTable({
    tipo: v.string(),
    descripcion: v.string(),
    usuario: v.string(),
    datos: v.string(),
    fecha: v.string(),
  }).index("by_fecha", ["fecha"]),

  respaldos: defineTable({
    cadence: v.string(),
    fileName: v.string(),
    driveFileId: v.string(),
    folderId: v.string(),
    periodStart: v.string(),
    periodEnd: v.string(),
    createdAt: v.string(),
    bytes: v.number(),
    recordCount: v.number(),
    status: v.string(),
  })
    .index("by_cadence", ["cadence"])
    .index("by_created_at", ["createdAt"]),

  notas: defineTable({
    sourceId: v.optional(v.string()),
    text: v.string(),
    authorName: v.string(),
    authorUsername: v.string(),
    done: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_source_id", ["sourceId"])
    .index("by_created_at", ["createdAt"])
    .index("by_updated_at", ["updatedAt"]),

  contactos: defineTable({
    sourceId: v.optional(v.string()),
    googleResourceName: v.optional(v.string()),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    notes: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_source_id", ["sourceId"])
    .index("by_google_resource_name", ["googleResourceName"])
    .index("by_created_at", ["createdAt"])
    .index("by_updated_at", ["updatedAt"]),

  productos: defineTable({
    sourceId: v.optional(v.string()),
    productNumber: v.optional(v.number()),
    name: v.string(),
    exactModel: v.optional(v.string()),
    price: v.number(),
    quantity: v.optional(v.number()),
    active: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_source_id", ["sourceId"])
    .index("by_created_at", ["createdAt"])
    .index("by_updated_at", ["updatedAt"]),

  ventas: defineTable({
    sourceId: v.optional(v.string()),
    saleNumber: v.number(),
    productId: v.string(),
    product: v.string(),
    productModel: v.string(),
    quantity: v.number(),
    price: v.number(),
    discount: v.number(),
    total: v.number(),
    received: v.number(),
    change: v.number(),
    createdAt: v.string(),
  })
    .index("by_source_id", ["sourceId"])
    .index("by_sale_number", ["saleNumber"])
    .index("by_created_at", ["createdAt"]),

  repuestos: defineTable({
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
  })
    .index("by_source_id", ["sourceId"])
    .index("by_published_at", ["publishedAt"])
    .index("by_updated_at", ["updatedAt"]),
});
