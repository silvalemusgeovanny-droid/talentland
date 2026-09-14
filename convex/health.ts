import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireModuleRead } from "./authorization";

// Punto de comprobacion pequeño y autenticado. No expone datos operativos;
// sirve para verificar que Convex, la API y la sesion siguen respondiendo.
export const check = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireModuleRead(ctx, args.sessionToken, "health");
    return { checkedAt: new Date().toISOString() };
  },
});
