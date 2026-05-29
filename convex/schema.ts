import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
});
