import type { MutationCtx } from "./_generated/server";

const permissionDeniedMessage = "No tienes permiso para realizar esta operacion.";
const expiredSessionMessage = "Sesion expirada. Inicia sesion nuevamente.";

const defaultModulesByRole: Record<string, string[]> = {
  root: ["permissions", "sales", "products", "parts", "partsCost", "partsCustomerPrice", "repairs", "contacts", "notes", "statistics", "database", "users"],
  admin: ["permissions", "sales", "products", "parts", "partsCost", "partsCustomerPrice", "repairs", "contacts", "notes", "statistics", "database"],
  user: ["permissions", "sales", "parts", "partsCustomerPrice", "repairs", "notes", "statistics"],
  activador: ["parts", "partsCustomerPrice"],
};

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function requireModuleWrite(
  ctx: MutationCtx,
  sessionToken: string,
  moduleName: string,
) {
  if (!sessionToken) throw new Error(expiredSessionMessage);

  const tokenHash = await sha256(sessionToken);
  const session = await ctx.db
    .query("sesiones")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error(expiredSessionMessage);
  }

  const user = await ctx.db.get(session.userId);
  if (!user || !user.active || (user.accountStatus && user.accountStatus !== "active")) {
    throw new Error(permissionDeniedMessage);
  }

  const roleModules = defaultModulesByRole[user.role];
  if (!roleModules) throw new Error(permissionDeniedMessage);

  // Root conserva acceso total. Activador nunca puede mutar datos, aunque se
  // alteren sus permisos desde el cliente o se invoque Convex directamente.
  if (user.role === "root") return user;
  if (user.role === "activador") throw new Error(permissionDeniedMessage);

  const modules = Array.isArray(user.modules) ? user.modules : roleModules;
  if (!modules.includes(moduleName)) throw new Error(permissionDeniedMessage);

  return user;
}
