import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRoot } from "./authorization";
import { nextNumber } from "./consecutivos";

const automaticFields = [
  { table: "reparaciones", field: "repairNumber", counter: "repairs" },
  { table: "ventas", field: "saleNumber", counter: "sales" },
  { table: "productos", field: "productNumber", counter: "products" },
] as const;

export const repairAutomaticDuplicates = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireRoot(ctx, args.sessionToken);
    const result: Record<string, number> = {};

    for (const config of automaticFields) {
      const rows = await ctx.db.query(config.table).collect();
      const grouped = new Map<number, any[]>();
      for (const row of rows) {
        const number = Math.trunc(Number(row[config.field]) || 0);
        if (!number) continue;
        const group = grouped.get(number) || [];
        group.push(row);
        grouped.set(number, group);
      }

      let repaired = 0;
      for (const duplicates of grouped.values()) {
        duplicates.sort((a, b) => a._creationTime - b._creationTime);
        for (const duplicate of duplicates.slice(1)) {
          const replacement = await nextNumber(ctx, config.counter, config.table, config.field);
          await ctx.db.patch(duplicate._id, { [config.field]: replacement });
          repaired += 1;
        }
      }
      result[config.field] = repaired;
    }

    return result;
  },
});
