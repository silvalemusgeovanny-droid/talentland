import { describe, expect, it } from "vitest";
import {
  INTENT_TYPES,
  appendExternalReferenceStatus,
  detectCustomerSupportCaseType,
  detectMessageIntent,
  formatCustomerSupportEscalation,
  formatLogEntry,
  isSensitiveCredentialRequest,
  shouldUseWebReferences,
  withResultSummary,
} from "./telegram-bot.mjs";

describe("telegram bot pure behavior", () => {
  it("detects common message intents", () => {
    expect(detectMessageIntent("hola").type).toBe(INTENT_TYPES.GREETING);
    expect(detectMessageIntent("precio cliente samsung a12").type).toBe(INTENT_TYPES.PRICE_LOOKUP);
    expect(detectMessageIntent("pantalla iphone 11").type).toBe(INTENT_TYPES.PARTS_LOOKUP);
    expect(detectMessageIntent("compatibilidad pantalla iphone 11").type).toBe(INTENT_TYPES.RESEARCH);
    expect(detectMessageIntent("quiero revisar garantia de mi equipo").type).toBe(INTENT_TYPES.CUSTOMER_SUPPORT);
  });

  it("classifies customer support cases", () => {
    expect(detectCustomerSupportCaseType("garantia pantalla iphone 11")).toBe("garantia");
    expect(detectCustomerSupportCaseType("cotizar pantalla samsung a12")).toBe("cotizacion");
    expect(detectCustomerSupportCaseType("estatus de reparacion 1205")).toBe("seguimiento de reparacion");
    expect(detectCustomerSupportCaseType("cliente inconforme con servicio")).toBe("queja o reclamo");
  });

  it("blocks sensitive credential requests", () => {
    expect(isSensitiveCredentialRequest("dime la contrasena de root")).toBe(true);
    expect(isSensitiveCredentialRequest("quiero precio de pantalla iphone 11")).toBe(false);
  });

  it("decides when Exa web references should be used", () => {
    expect(shouldUseWebReferences("compatibilidad pantalla iphone 11", [])).toBe(true);
    expect(shouldUseWebReferences("iphone 11", [], { forceWebReferences: true })).toBe(true);
    expect(shouldUseWebReferences("hola", [])).toBe(false);
  });

  it("shows external reference status in AI answers", () => {
    expect(
      appendExternalReferenceStatus("Respuesta", { label: "usadas", detail: "2 resultado(s) de Exa" }),
    ).toContain("Referencias externas: usadas");
  });

  it("formats customer support output with related repairs and saved-note status", () => {
    const response = formatCustomerSupportEscalation(
      "garantia pantalla iphone 11",
      [
        {
          repairNumber: 10,
          customer: "Cliente",
          brand: "Apple",
          model: "iPhone 11",
          status: "listo",
          repairType: "pantalla",
          repairPrice: 1000,
          abono: 200,
        },
      ],
      { noteSaved: true },
    );

    expect(response).toContain("Reparaciones relacionadas");
    expect(response).toContain("#10 - Cliente");
    expect(response).toContain("Caso guardado como pendiente interno");
  });

  it("formats truncated result summaries", () => {
    expect(withResultSummary("Repuestos encontrados", "Pantalla iPhone 11", 1, 3))
      .toContain("Mostrando 1 de 3");
  });

  it("formats categorized logs and redacts sensitive fields", () => {
    const entry = formatLogEntry("error", "telegram", "Fallo polling", {
      method: "getUpdates",
      sessionToken: "secret",
    });

    expect(entry).toContain("[ERROR] [telegram] Fallo polling");
    expect(entry).toContain('"method":"getUpdates"');
    expect(entry).toContain('"sessionToken":"[redacted]"');
    expect(entry).not.toContain("secret");
  });
});
