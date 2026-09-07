import { describe, expect, it } from "vitest";
import { alertFingerprint, getNewRepairs, formatExaReferenceFallback } from "./telegram-bot.mjs";

describe("notificaciones proactivas: deduplicacion", () => {
  it("genera el mismo fingerprint para un mismo conjunto de alertas", () => {
    const alerts = [
      "Listas para entregar:",
      "#1205 Cliente A - iPhone 11 - listo",
      "Stock bajo:",
      "Pantalla iPhone 11 - Apple iPhone 11 | stock 1",
    ];
    expect(alertFingerprint(alerts)).toBe(alertFingerprint([...alerts]));
  });

  it("cambia el fingerprint cuando aparece una alerta nueva", () => {
    const antes = ["#1205 Cliente A - iPhone 11 - listo"];
    const despues = ["#1205 Cliente A - iPhone 11 - listo", "#1206 Cliente B - Samsung A12 - por vencer"];
    expect(alertFingerprint(despues)).not.toBe(alertFingerprint(antes));
  });

  it("cambia el fingerprint cuando se resuelve una alerta", () => {
    const conPendiente = ["#1205 Cliente A - iPhone 11 - listo", "Pantalla Samsung A12 | stock 0"];
    const soloStock = ["Pantalla Samsung A12 | stock 0"];
    expect(alertFingerprint(soloStock)).not.toBe(alertFingerprint(conPendiente));
  });

  it("ignora espacios y saltos de linea irrelevantes", () => {
    const a = ["#1205  Cliente A - iPhone 11 - listo"];
    const b = ["  #1205 Cliente A - iPhone 11 - listo  "];
    expect(alertFingerprint(a)).toBe(alertFingerprint(b));
  });

  it("un conjunto vacio es estable", () => {
    expect(alertFingerprint([])).toBe(alertFingerprint([]));
  });
});

describe("notificaciones de reparaciones nuevas", () => {
  const base = {
    repairNumber: 1,
    customer: "Cliente A",
    deviceType: "telefono",
    brand: "Apple",
    model: "iPhone 11",
    repairType: "screen",
    status: "En proceso",
  };

  it("no considera nuevas las reparaciones con createdAt anterior o igual al 'desde'", () => {
    const repairs = [
      { ...base, repairNumber: 1, createdAt: "2026-09-06T12:00:00.000Z" },
      { ...base, repairNumber: 2, createdAt: "2026-09-06T12:00:00.000Z" },
      { ...base, repairNumber: 3, createdAt: "2026-09-06T11:00:00.000Z" },
    ];
    expect(getNewRepairs(repairs, "2026-09-06T12:00:00.000Z")).toEqual([]);
  });

  it("detecta solo las ingresadas despues del 'desde'", () => {
    const repairs = [
      { ...base, repairNumber: 1, createdAt: "2026-09-06T12:00:00.000Z" },
      { ...base, repairNumber: 2, createdAt: "2026-09-06T13:30:00.000Z" },
      { ...base, repairNumber: 3, createdAt: "2026-09-06T14:00:00.000Z" },
    ];
    const nuevas = getNewRepairs(repairs, "2026-09-06T12:00:00.000Z");
    expect(nuevas.map((r) => r.repairNumber)).toEqual([2, 3]);
  });

  it("ordena de mas antigua a mas reciente", () => {
    const repairs = [
      { ...base, repairNumber: 5, createdAt: "2026-09-06T14:00:00.000Z" },
      { ...base, repairNumber: 3, createdAt: "2026-09-06T12:30:00.000Z" },
      { ...base, repairNumber: 4, createdAt: "2026-09-06T13:00:00.000Z" },
    ];
    expect(getNewRepairs(repairs, "2026-09-06T12:00:00.000Z").map((r) => r.repairNumber)).toEqual([3, 4, 5]);
  });

  it("ignora reparaciones sin createdAt valido", () => {
    const repairs = [
      { ...base, repairNumber: 1, createdAt: "" },
      { ...base, repairNumber: 2, createdAt: "2026-09-06T13:00:00.000Z" },
    ];
    expect(getNewRepairs(repairs, "2026-09-06T12:00:00.000Z").map((r) => r.repairNumber)).toEqual([2]);
  });
});

describe("respaldo Exa: formato compacto de referencias", () => {
  it("formatea titulo, url y resumen breve", () => {
    const results = [
      {
        title: "Pantalla iPhone 11 Original",
        url: "https://ejemplo.com/pantalla-11",
        highlights: ["Repuesto original para iPhone 11 con vidrio templado incluido."],
      },
    ];
    const salida = formatExaReferenceFallback(results);
    expect(salida).toContain("Pantalla iPhone 11 Original");
    expect(salida).toContain("https://ejemplo.com/pantalla-11");
    expect(salida).toContain("Repuesto original");
  });

  it("limita a 3 referencias y tolera resultados sin resumen", () => {
    const results = Array.from({ length: 5 }, (_, i) => ({ title: `Ref ${i}`, url: `https://e.com/${i}`, highlights: [] }));
    const salida = formatExaReferenceFallback(results);
    expect(salida).toContain("1. Ref 0");
    expect(salida).toContain("3. Ref 2");
    expect(salida).not.toContain("4. Ref 3");
  });
});