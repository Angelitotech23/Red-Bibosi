import { describe, expect, it } from "vitest";
import {
  assertNoPii,
  checkFreeTextForPii,
  findProperNames,
} from "@/lib/validation/pii";

describe("validación de texto libre (PII)", () => {
  it("acepta descripciones genéricas sin nombres propios", () => {
    const result = checkFreeTextForPii(
      "Hubo un robo cerca del segundo anillo, un vecino gritaba pidiendo ayuda.",
    );
    expect(result.ok).toBe(true);
  });

  it("rechaza nombres propios de personas", () => {
    const result = checkFreeTextForPii(
      "Juan Pérez fue asaltado cerca de la plaza principal anoche.",
    );
    expect(result.ok).toBe(false);
    expect(result.match).toMatch(/Juan Pérez/);
  });

  it("rechaza menciones de establecimientos", () => {
    const result = checkFreeTextForPii(
      "Ocurrió un incidente frente a la farmacia del barrio hacia la radial.",
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/establecimiento/i);
  });

  it("rechaza honoríficos con apellido", () => {
    const result = checkFreeTextForPii(
      "El sr. Vargas amenazó a peatones en la avenida principal.",
    );
    expect(result.ok).toBe(false);
  });

  it("assertNoPii valida título y cuerpo juntos", () => {
    const ok = assertNoPii(
      "Ruido excesivo en vía pública",
      "Varios vecinos reportan música alta después de la medianoche en la cuadra.",
    );
    expect(ok.ok).toBe(true);

    const bad = assertNoPii(
      "Caso María López",
      "Descripción genérica suficientemente larga para el cuerpo del reporte.",
    );
    expect(bad.ok).toBe(false);
  });

  it("findProperNames ignora topónimos permitidos de Santa Cruz", () => {
    expect(findProperNames("Ocurrió en Santa Cruz cerca del Plan")).toBeNull();
  });
});
