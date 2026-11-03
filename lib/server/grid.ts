import type { IncidentType } from "@/lib/types";

/** Precisión de grilla pública (C-01 PENDING: 4 decimales ≈ 11 m) */
export const GRID_DECIMALS = 4;

/** Umbral de k-anonimidad para exponer celdas en el mapa */
export const MAP_K_THRESHOLD = 5;

export function roundToGrid(value: number, decimals = GRID_DECIMALS): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export function toGridCell(lat: number, lng: number): {
  grid_lat: number;
  grid_lng: number;
} {
  return {
    grid_lat: roundToGrid(lat),
    grid_lng: roundToGrid(lng),
  };
}

export interface MapCellInput {
  grid_lat: number;
  grid_lng: number;
  type: IncidentType;
}

export interface MapCellPublic {
  grid_lat: number;
  grid_lng: number;
  total: number;
  by_type: Partial<Record<IncidentType, number>>;
}

/**
 * Agrupa reportes en celdas y filtra las que no alcanzan k≥threshold.
 * Exportado para pruebas unitarias del umbral.
 */
export function buildMapCells(
  reports: MapCellInput[],
  threshold = MAP_K_THRESHOLD,
): MapCellPublic[] {
  const map = new Map<string, MapCellPublic>();

  for (const r of reports) {
    const key = `${r.grid_lat},${r.grid_lng}`;
    let cell = map.get(key);
    if (!cell) {
      cell = {
        grid_lat: r.grid_lat,
        grid_lng: r.grid_lng,
        total: 0,
        by_type: {},
      };
      map.set(key, cell);
    }
    cell.total += 1;
    cell.by_type[r.type] = (cell.by_type[r.type] ?? 0) + 1;
  }

  return [...map.values()].filter((c) => c.total >= threshold);
}

export function meetsKAnonymity(
  count: number,
  threshold = MAP_K_THRESHOLD,
): boolean {
  return count >= threshold;
}
