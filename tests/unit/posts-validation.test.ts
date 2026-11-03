import { describe, expect, it } from "vitest";
import { validateCreatePostInput } from "@/lib/validation/posts";

const base = {
  zone_id: "11111111-1111-4111-8111-111111111111",
  type: "robo" as const,
  title: "Robo a peatón en vía pública",
  body: "Una persona fue asaltada por dos individuos en motocicleta cerca del segundo anillo.",
  lat: -17.7833,
  lng: -63.1821,
  is_establishment: false,
};

describe("validateCreatePostInput", () => {
  it("acepta un payload válido", () => {
    const result = validateCreatePostInput(base);
    expect(result.ok).toBe(true);
  });

  it("rechaza tipo inválido", () => {
    const result = validateCreatePostInput({ ...base, type: "otro" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR");
  });

  it("rechaza coords fuera de Santa Cruz", () => {
    const result = validateCreatePostInput({
      ...base,
      lat: -16.5,
      lng: -68.1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/Santa Cruz/);
    }
  });

  it("rechaza PII en el título", () => {
    const result = validateCreatePostInput({
      ...base,
      title: "Asalto a Carlos Mendoza anoche",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("PII_NOT_ALLOWED");
  });
});
