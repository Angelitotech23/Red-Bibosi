import { describe, expect, it } from "vitest";
import {
  MAP_K_THRESHOLD,
  buildMapCells,
  meetsKAnonymity,
  roundToGrid,
} from "@/lib/server/grid";

describe("umbral k≥5 del mapa", () => {
  it("exporta umbral 5", () => {
    expect(MAP_K_THRESHOLD).toBe(5);
  });

  it("meetsKAnonymity solo con count ≥ 5", () => {
    expect(meetsKAnonymity(4)).toBe(false);
    expect(meetsKAnonymity(5)).toBe(true);
    expect(meetsKAnonymity(12)).toBe(true);
  });

  it("buildMapCells omite celdas bajo el umbral", () => {
    const cells = buildMapCells([
      { grid_lat: -17.78, grid_lng: -63.18, type: "robo" },
      { grid_lat: -17.78, grid_lng: -63.18, type: "robo" },
      { grid_lat: -17.78, grid_lng: -63.18, type: "acoso" },
      { grid_lat: -17.78, grid_lng: -63.18, type: "vandalismo" },
      // celda A: 4 → oculta
      { grid_lat: -17.79, grid_lng: -63.19, type: "robo" },
      { grid_lat: -17.79, grid_lng: -63.19, type: "robo" },
      { grid_lat: -17.79, grid_lng: -63.19, type: "robo" },
      { grid_lat: -17.79, grid_lng: -63.19, type: "acoso" },
      { grid_lat: -17.79, grid_lng: -63.19, type: "acoso" },
      // celda B: 5 → visible
    ]);

    expect(cells).toHaveLength(1);
    expect(cells[0]?.grid_lat).toBe(-17.79);
    expect(cells[0]?.total).toBe(5);
    expect(cells[0]?.by_type.robo).toBe(3);
    expect(cells[0]?.by_type.acoso).toBe(2);
  });

  it("no expone coords exactas: redondeo a 4 decimales", () => {
    expect(roundToGrid(-17.78391234)).toBe(-17.7839);
  });
});
