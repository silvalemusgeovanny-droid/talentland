import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const sessionDurationMs = 1000 * 60 * 60 * 12;
const activePresenceMs = 1000 * 60;
const maxFailedLoginAttempts = 5;
const lockDurationMs = 1000 * 60 * 15;
const rootUsersMessage = "solo root puede gestionar usuarios";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function publicUser(user: {
  _id?: unknown;
  username: string;
  name: string;
  role: string;
  modules?: string[];
  active?: boolean;
  accountStatus?: string;
  failedLoginCount?: number;
  lockedUntil?: number;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  lastFailedLoginAt?: string;
  disabledAt?: string;
}) {
  return {
    id: String(user._id || ""),
    username: user.username,
    name: user.name,
    role: user.role,
    modules: user.modules,
    active: user.active !== false,
    accountStatus: getAccountStatus(user),
    failedLoginCount: user.failedLoginCount || 0,
    lockedUntil: user.lockedUntil || 0,
    mustChangePassword: Boolean(user.mustChangePassword),
    lastLoginAt: user.lastLoginAt || "",
    lastFailedLoginAt: user.lastFailedLoginAt || "",
    disabledAt: user.disabledAt || "",
  };
}

function getAccountStatus(user: { active?: boolean; accountStatus?: string }) {
  if (user.active === false) return "disabled";
  return user.accountStatus || "active";
}

function validatePasswordStrength(password: string) {
  const value = String(password || "");
  if (value.length < 8) throw new Error("La contrasena debe tener minimo 8 caracteres.");
  if (!/[a-z]/.test(value)) throw new Error("La contrasena debe incluir una minuscula.");
  if (!/[A-Z]/.test(value)) throw new Error("La contrasena debe incluir una mayuscula.");
  if (!/[0-9]/.test(value)) throw new Error("La contrasena debe incluir un numero.");
}

async function registerAudit(ctx: any, tipo: string, descripcion: string, usuario = "sistema", datos: Record<string, unknown> = {}) {
  await ctx.db.insert("auditoria", {
    tipo,
    descripcion,
    usuario,
    datos: JSON.stringify(datos),
    fecha: new Date().toISOString(),
  });
}

async function requireRootSession(ctx: any, sessionToken: string) {
  const tokenHash = await sha256(sessionToken);
  const session = await ctx.db
    .query("sesiones")
    .withIndex("by_token_hash", (q: any) => q.eq("tokenHash", tokenHash))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error(rootUsersMessage);
  }

  const user = await ctx.db.get(session.userId);
  if (!user || !user.active || user.role !== "root") {
    throw new Error(rootUsersMessage);
  }

  return user;
}

async function getActivePresence(ctx: any) {
  const activeSince = Date.now() - activePresenceMs;
  const presences = await ctx.db.query("presencias").take(100);
  const latestByUsername = new Map<string, any>();

  for (const presence of presences) {
    if (presence.lastSeenAt < activeSince) continue;
    const existing = latestByUsername.get(presence.username);
    if (!existing || existing.lastSeenAt < presence.lastSeenAt) {
      latestByUsername.set(presence.username, presence);
    }
  }

  return [...latestByUsername.values()]
    .sort((a, b) => a.username.localeCompare(b.username))
    .map((presence) => ({
      username: presence.username,
      name: presence.name,
      role: presence.role,
      lastSeenAt: presence.lastSeenAt,
    }));
}

export const seedDefaultUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const defaults = [
      { username: "root", password: "root123", name: "Root", role: "root", modules: ["permissions", "sales", "products", "parts", "repairs", "contacts", "statistics", "database", "users"] },
      { username: "admin", password: "admin123", name: "Administrador", role: "admin", modules: ["permissions", "sales", "products", "parts", "repairs", "contacts", "statistics", "database"] },
      { username: "usuario", password: "user123", name: "Usuario", role: "user", modules: ["permissions", "sales", "parts", "repairs", "statistics"] },
      { username: "activador", password: "activador123", name: "Activador", role: "activador", modules: ["parts"] },
    ];
    let inserted = 0;

    for (const user of defaults) {
      const existing = await ctx.db
        .query("usuarios")
        .withIndex("by_username", (q) => q.eq("username", user.username))
        .unique();

      if (existing) continue;

      await ctx.db.insert("usuarios", {
        username: user.username,
        passwordHash: await sha256(`${user.username}:${user.password}`),
        name: user.name,
        role: user.role,
        modules: user.modules,
        active: true,
        accountStatus: "active",
        failedLoginCount: 0,
        lockedUntil: 0,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now,
      });
      inserted += 1;
    }

    return { inserted };
  },
});

export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();
    const user = await ctx.db
      .query("usuarios")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (!user) {
      throw new Error("Usuario y contrasena incorrectos.");
    }

    const status = getAccountStatus(user);
    if (status === "disabled") throw new Error("Cuenta inhabilitada. Contacta a root.");
    if (status === "pending_root") throw new Error("Cuenta bloqueada. Root debe autorizar el acceso.");
    if (status === "locked" && Number(user.lockedUntil || 0) > Date.now()) {
      throw new Error("Cuenta bloqueada temporalmente. Root puede desbloquearla o restablecer contrasena.");
    }

    const passwordHash = await sha256(`${username}:${args.password}`);
    if (passwordHash !== user.passwordHash) {
      const failedLoginCount = Number(user.failedLoginCount || 0) + 1;
      const now = new Date();
      const patch: Record<string, unknown> = {
        failedLoginCount,
        lastFailedLoginAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      if (failedLoginCount >= maxFailedLoginAttempts) {
        patch.accountStatus = "pending_root";
        patch.lockedUntil = now.getTime() + lockDurationMs;
        await registerAudit(ctx, "USUARIO_BLOQUEADO", `Usuario ${user.username} bloqueado por intentos fallidos`, "sistema", {
          username: user.username,
          failedLoginCount,
        });
      }

      await ctx.db.patch(user._id, patch);
      throw new Error("Usuario y contrasena incorrectos.");
    }

    const now = new Date();
    await ctx.db.patch(user._id, {
      accountStatus: "active",
      failedLoginCount: 0,
      lockedUntil: 0,
      lastLoginAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await ctx.db.insert("sesiones", {
      tokenHash: await sha256(args.sessionToken),
      userId: user._id,
      username: user.username,
      expiresAt: now.getTime() + sessionDurationMs,
      createdAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
    });

    return publicUser(user);
  },
});

export const currentSession = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenHash = await sha256(args.sessionToken);
    const session = await ctx.db
      .query("sesiones")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    if (!session || session.expiresAt < Date.now()) return null;

    const user = await ctx.db.get(session.userId);
    if (!user || !user.active) return null;
    if (getAccountStatus(user) !== "active") return null;

    return publicUser(user);
  },
});

export const heartbeatPresence = mutation({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenHash = await sha256(args.sessionToken);
    const session = await ctx.db
      .query("sesiones")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    if (!session || session.expiresAt < Date.now()) return [];

    const user = await ctx.db.get(session.userId);
    if (!user || !user.active || getAccountStatus(user) !== "active") return [];

    const now = Date.now();
    await ctx.db.patch(session._id, { lastSeenAt: new Date(now).toISOString() });

    const existingPresence = await ctx.db
      .query("presencias")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    const presence = {
      tokenHash,
      userId: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      lastSeenAt: now,
    };

    if (existingPresence) {
      await ctx.db.patch(existingPresence._id, presence);
    } else {
      await ctx.db.insert("presencias", presence);
    }

    return await getActivePresence(ctx);
  },
});

export const logout = mutation({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenHash = await sha256(args.sessionToken);
    const session = await ctx.db
      .query("sesiones")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    if (session) await ctx.db.delete(session._id);

    const presence = await ctx.db
      .query("presencias")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    if (presence) await ctx.db.delete(presence._id);
  },
});

export const verifyAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();
    const user = await ctx.db
      .query("usuarios")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (!user || !user.active || getAccountStatus(user) !== "active" || !["root", "admin"].includes(user.role)) {
      return false;
    }

    return (await sha256(`${username}:${args.password}`)) === user.passwordHash;
  },
});

export const verifyRoot = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();
    const user = await ctx.db
      .query("usuarios")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (!user || !user.active || getAccountStatus(user) !== "active" || user.role !== "root") {
      return false;
    }

    return (await sha256(`${username}:${args.password}`)) === user.passwordHash;
  },
});

export const listUsers = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRootSession(ctx, args.sessionToken);
    const users = await ctx.db.query("usuarios").take(200);

    return users
      .sort((a, b) => a.username.localeCompare(b.username))
      .map(publicUser);
  },
});

export const createUser = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    username: v.string(),
    password: v.string(),
    role: v.string(),
    modules: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRootSession(ctx, args.sessionToken);
    const username = args.username.trim().toLowerCase();
    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("usuarios")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (existing) throw new Error("Ese usuario ya existe.");
    if (!args.password.trim()) throw new Error("Escribe una contrasena.");
    validatePasswordStrength(args.password.trim());

    const id = await ctx.db.insert("usuarios", {
      username,
      passwordHash: await sha256(`${username}:${args.password.trim()}`),
      name: args.name.trim(),
      role: args.role,
      modules: args.modules,
      active: true,
      accountStatus: "active",
      failedLoginCount: 0,
      lockedUntil: 0,
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });

    const user = await ctx.db.get(id);
    if (!user) throw new Error("Usuario no encontrado.");
    return publicUser(user);
  },
});

export const updateUser = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("usuarios"),
    name: v.string(),
    username: v.string(),
    password: v.optional(v.string()),
    role: v.string(),
    modules: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const root = await requireRootSession(ctx, args.sessionToken);
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("Usuario no encontrado.");

    const username = args.username.trim().toLowerCase();
    const duplicated = await ctx.db
      .query("usuarios")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (duplicated && duplicated._id !== args.id) throw new Error("Ese usuario ya existe.");

    const patch: Record<string, unknown> = {
      username,
      name: args.name.trim(),
      role: args.role,
      modules: args.modules,
      updatedAt: new Date().toISOString(),
    };

    if (args.password?.trim()) {
      validatePasswordStrength(args.password.trim());
      patch.passwordHash = await sha256(`${username}:${args.password.trim()}`);
      patch.mustChangePassword = true;
      patch.accountStatus = "active";
      patch.failedLoginCount = 0;
      patch.lockedUntil = 0;
    }

    await ctx.db.patch(args.id, patch);
    const updatedUser = await ctx.db.get(args.id);
    if (!updatedUser) throw new Error("Usuario no encontrado.");
    return publicUser(updatedUser);
  },
});

export const removeUser = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("usuarios"),
  },
  handler: async (ctx, args) => {
    await requireRootSession(ctx, args.sessionToken);
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("Usuario no encontrado.");
    if (user.role === "root") throw new Error("El usuario root no se puede borrar.");
    const now = new Date().toISOString();
    await ctx.db.patch(args.id, {
      active: false,
      accountStatus: "disabled",
      disabledAt: now,
      updatedAt: now,
    });
    await registerAudit(ctx, "USUARIO_INHABILITADO", `Usuario ${user.username} inhabilitado`, root.username, {
      username: user.username,
      userId: String(user._id),
    });
  },
});

export const unlockUser = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("usuarios"),
  },
  handler: async (ctx, args) => {
    const root = await requireRootSession(ctx, args.sessionToken);
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("Usuario no encontrado.");
    if (user.role === "root") throw new Error("El usuario root no se puede desbloquear desde aqui.");
    await ctx.db.patch(args.id, {
      active: true,
      accountStatus: "active",
      failedLoginCount: 0,
      lockedUntil: 0,
      updatedAt: new Date().toISOString(),
    });
    await registerAudit(ctx, "USUARIO_DESBLOQUEADO", `Usuario ${user.username} desbloqueado`, root.username, {
      username: user.username,
      userId: String(user._id),
    });
  },
});

export const changeOwnPassword = mutation({
  args: {
    sessionToken: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    validatePasswordStrength(args.newPassword);
    const tokenHash = await sha256(args.sessionToken);
    const session = await ctx.db
      .query("sesiones")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    if (!session || session.expiresAt < Date.now()) throw new Error("Sesion expirada.");
    const user = await ctx.db.get(session.userId);
    if (!user || !user.active || getAccountStatus(user) !== "active") throw new Error("Usuario no autorizado.");

    const currentHash = await sha256(`${user.username}:${args.currentPassword}`);
    if (currentHash !== user.passwordHash) throw new Error("Contrasena actual incorrecta.");

    await ctx.db.patch(user._id, {
      passwordHash: await sha256(`${user.username}:${args.newPassword.trim()}`),
      mustChangePassword: false,
      updatedAt: new Date().toISOString(),
    });
    await registerAudit(ctx, "CONTRASENA_CAMBIADA", `Usuario ${user.username} cambio su contrasena`, user.username, {
      username: user.username,
      userId: String(user._id),
    });
  },
});
