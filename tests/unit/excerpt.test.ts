import { describe, expect, it } from "vitest";
import { excerpt } from "@/lib/client/excerpt";

describe("excerpt", () => {
  it("devuelve el texto si cabe", () => {
    expect(excerpt("Plaza principal")).toBe("Plaza principal");
  });

  it("recorta en un límite de palabra", () => {
    const text =
      "Dos personas en motocicleta intentaron quitar un bolso a una vecina cerca de las 20:30. Había poca iluminación en la esquina.";
    const result = excerpt(text, 40);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(42);
  });
});
