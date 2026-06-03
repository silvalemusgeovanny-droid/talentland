import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const sessionDurationMs = 1000 * 60 * 60 * 12;

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function publicUser(user: { _id?: unknown; username: string; name: string; role: string }) {
  return {
    id: String(user._id || ""),
    username: user.username,
    name: user.name,
    role: user.role,
  };
}

export const seedDefaultUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const defaults = [
      { username: "root", password: "root123", name: "Root", role: "root" },
      { username: "admin", password: "admin123", name: "Administrador", role: "admin" },
      { username: "usuario", password: "user123", name: "Usuario", role: "user" },
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
        active: true,
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

    if (!user || !user.active) {
      throw new Error("Usuario o contrasena incorrectos.");
    }

    const passwordHash = await sha256(`${username}:${args.password}`);
    if (passwordHash !== user.passwordHash) {
      throw new Error("Usuario o contrasena incorrectos.");
    }

    const now = new Date();
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

    return publicUser(user);
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

    if (!user || !user.active || !["root", "admin"].includes(user.role)) {
      return false;
    }

    return (await sha256(`${username}:${args.password}`)) === user.passwordHash;
  },
});
