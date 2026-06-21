import { beforeEach, describe, expect, it, vi } from "vitest";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
};
globalThis.CustomEvent = class {
  constructor(type, options) {
    this.type = type;
    this.detail = options?.detail;
  }
};
globalThis.window = {
  dispatchEvent: vi.fn(),
  repairCloud: null,
};

await import("./app-core.js");

const { session, permissions, notes } = window.repairApp;

beforeEach(() => {
  values.clear();
  window.dispatchEvent.mockClear();
  window.repairCloud = null;
});

describe("shared application core", () => {
  it("keeps activador read-only in Repuestos", () => {
    const user = { role: "activador", modules: ["parts"] };
    expect(permissions.canAccess(user, "parts")).toBe(true);
    expect(permissions.canManageParts(user)).toBe(false);
  });

  it("uses custom module permissions consistently", () => {
    const user = { role: "user", modules: ["notes"] };
    expect(permissions.canUseNotes(user)).toBe(true);
    expect(permissions.canAccess(user, "parts")).toBe(false);
  });

  it("stores and clears the complete session from one place", () => {
    session.saveToken("token");
    session.saveAuthMode("convex");
    session.saveUser({ username: "ana", role: "user" });

    expect(session.hasSession()).toBe(true);
    expect(session.getUser()).toMatchObject({ username: "ana", role: "user" });

    session.clear();
    expect(session.hasSession()).toBe(false);
    expect(session.getAuthMode()).toBeNull();
  });

  it("uses the same local login and restore path", async () => {
    const user = { username: "ana", password: "segura", role: "user", active: true };
    await expect(session.signIn("ANA", "segura", [user])).resolves.toBe(user);
    session.saveUser(user);

    await expect(session.restore()).resolves.toMatchObject({
      status: "authenticated",
      source: "local",
      user: { username: "ana", role: "user" },
    });
  });

  it("clears local state even when remote logout fails", async () => {
    window.repairCloud = {
      isConfigured: () => true,
      logout: vi.fn().mockRejectedValue(new Error("sin red")),
    };
    session.saveToken("token");
    session.saveUser({ username: "ana", role: "user" });

    const result = await session.logout();

    expect(result.remoteError?.message).toBe("sin red");
    expect(session.hasSession()).toBe(false);
  });

  it("shares note normalization and local persistence", () => {
    const note = notes.normalizeForCloud({ id: "n1", text: "  Revisar   equipo  " }, { username: "ana", name: "Ana" });
    notes.save([note]);

    expect(note.text).toBe("Revisar equipo");
    expect(note.authorName).toBe("Ana");
    expect(notes.load()).toHaveLength(1);
  });
});
