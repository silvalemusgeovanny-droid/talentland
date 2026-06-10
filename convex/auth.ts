import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const sessionDurationMs = 1000 * 60 * 60 * 12;
const activePresenceMs = 1000 * 60;

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
      { username: "root", password: "root123", name: "Root", role: "root" },
      { username: "admin", password: "admin123", name: "Administrador", role: "admin" },
      { username: "usuario", password: "user123", name: "Usuario", role: "user" },
      { username: "activador", password: "activador123", name: "Activador", role: "activador" },
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
    if (!user || !user.active) return [];

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

    if (!user || !user.active || !["root", "admin"].includes(user.role)) {
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

    if (!user || !user.active || user.role !== "root") {
      return false;
    }

    return (await sha256(`${username}:${args.password}`)) === user.passwordHash;
  },
});
