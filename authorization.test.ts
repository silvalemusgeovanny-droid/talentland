import { describe, expect, it } from "vitest";
import { requireModuleRead, requireModuleWrite, requireRoot } from "./convex/authorization";
import { touchSession } from "./convex/auth";

function mutationContextFor(user: Record<string, unknown>) {
  return {
    db: {
      query: () => ({
        withIndex: (_name: string, buildQuery: (query: { eq: () => object }) => unknown) => {
          buildQuery({ eq: () => ({}) });
          return {
            unique: async () => ({ userId: "user-id", expiresAt: Date.now() + 60_000 }),
          };
        },
      }),
      get: async () => user,
    },
  } as any;
}

describe("server-side module authorization", () => {
  it("rejects activador writes even when parts is assigned", async () => {
    const ctx = mutationContextFor({
      active: true,
      accountStatus: "active",
      role: "activador",
      modules: ["parts"],
    });

    await expect(requireModuleWrite(ctx, "valid-session", "parts"))
      .rejects.toThrow("No tienes permiso");
  });

  it("rejects a user without the requested module", async () => {
    const ctx = mutationContextFor({
      active: true,
      accountStatus: "active",
      role: "user",
      modules: ["notes"],
    });

    await expect(requireModuleWrite(ctx, "valid-session", "parts"))
      .rejects.toThrow("No tienes permiso");
  });


  it("rejects reads without the requested module", async () => {
    const ctx = mutationContextFor({
      active: true,
      accountStatus: "active",
      role: "user",
      modules: ["notes"],
    });

    await expect(requireModuleRead(ctx, "valid-session", "contacts"))
      .rejects.toThrow("No tienes permiso");
  });

  it("allows reads with the requested module", async () => {
    const user = {
      active: true,
      accountStatus: "active",
      role: "user",
      modules: ["contacts"],
    };
    const ctx = mutationContextFor(user);

    await expect(requireModuleRead(ctx, "valid-session", "contacts"))
      .resolves.toBe(user);
  });

  it("allows a delegated health operator to record a system check", async () => {
    const user = {
      active: true,
      accountStatus: "active",
      role: "user",
      modules: ["health"],
    };
    const ctx = mutationContextFor(user);

    await expect(requireModuleWrite(ctx, "valid-session", "health"))
      .resolves.toBe(user);
  });

  it("rejects audit reads without statistics access", async () => {
    const ctx = mutationContextFor({
      active: true,
      accountStatus: "active",
      role: "user",
      modules: ["parts"],
    });

    await expect(requireModuleRead(ctx, "valid-session", "statistics"))
      .rejects.toThrow("No tienes permiso");
  });

  it("allows an active user with the requested module", async () => {
    const user = {
      active: true,
      accountStatus: "active",
      role: "user",
      modules: ["parts"],
    };
    const ctx = mutationContextFor(user);

    await expect(requireModuleWrite(ctx, "valid-session", "parts"))
      .resolves.toBe(user);
  });

  it("allows root-only reads only for root users", async () => {
    const root = { active: true, accountStatus: "active", role: "root" };
    const user = { active: true, accountStatus: "active", role: "user" };

    await expect(requireRoot(mutationContextFor(root), "valid-session"))
      .resolves.toBe(root);
    await expect(requireRoot(mutationContextFor(user), "valid-session", "Solo root puede consultar las instancias del bot."))
      .rejects.toThrow("Solo root puede consultar las instancias del bot.");
  });
});

function sessionContextFor(session: Record<string, unknown>, user: Record<string, unknown>) {
  const patched: Array<{ id: unknown; patch: Record<string, unknown> }> = [];
  const ctx = {
    db: {
      query: () => ({
        withIndex: (_name: string, buildQuery: (query: { eq: () => object }) => unknown) => {
          buildQuery({ eq: () => ({}) });
          return { unique: async () => session };
        },
      }),
      get: async () => user,
      patch: async (id: unknown, patch: Record<string, unknown>) => {
        patched.push({ id, patch });
      },
    },
  } as any;
  return { ctx, patched };
}

const activeUser = { active: true, accountStatus: "active", role: "user", modules: ["parts"] };

describe("touchSession: inactividad 3 h y tope absoluto 12 h", () => {
  it("renueva una sesion joven y extiende su expiracion", async () => {
    const before = Date.now();
    const session = {
      _id: "session-id",
      userId: "user-id",
      createdAt: new Date(before).toISOString(),
      expiresAt: before + 60_000,
    };
    const { ctx, patched } = sessionContextFor(session, activeUser);

    await expect(touchSession(ctx as any, { sessionToken: "token" }))
      .resolves.toEqual({ active: true });
    expect(patched).toHaveLength(1);
    expect(Number(patched[0].patch.expiresAt)).toBeGreaterThan(before);
  });

  it("rechaza una sesion con mas de 12 h aunque siga vigente", async () => {
    const now = Date.now();
    const session = {
      _id: "session-id",
      userId: "user-id",
      createdAt: new Date(now - 13 * 60 * 60 * 1000).toISOString(),
      expiresAt: now + 60_000,
    };
    const { ctx, patched } = sessionContextFor(session, activeUser);

    await expect(touchSession(ctx as any, { sessionToken: "token" }))
      .resolves.toEqual({ active: false });
    expect(patched).toHaveLength(0);
  });

  it("rechaza una sesion ya expirada por inactividad", async () => {
    const now = Date.now();
    const session = {
      _id: "session-id",
      userId: "user-id",
      createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
      expiresAt: now - 1_000,
    };
    const { ctx, patched } = sessionContextFor(session, activeUser);

    await expect(touchSession(ctx as any, { sessionToken: "token" }))
      .resolves.toEqual({ active: false });
    expect(patched).toHaveLength(0);
  });
});
