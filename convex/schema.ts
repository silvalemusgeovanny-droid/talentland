import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  usuarios: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.string(),
    active: v.boolean(),
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

  reparaciones: defineTable({
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
  })
    .index("by_source_id", ["sourceId"])
    .index("by_repair_number", ["repairNumber"]),

  auditoria: defineTable({
    tipo: v.string(),
    descripcion: v.string(),
    usuario: v.string(),
    datos: v.string(),
    fecha: v.string(),
  }),
});
