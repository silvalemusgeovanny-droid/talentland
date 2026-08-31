import { describe, expect, it } from "vitest";
import { requireModuleRead, requireModuleWrite } from "./convex/authorization";

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
});
