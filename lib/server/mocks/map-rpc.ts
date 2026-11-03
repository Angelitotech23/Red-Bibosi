// TODO(contrato): reemplazar al integrar — RPC SQL `map_cells_k_anonymous(k int)`

import type { IncidentType } from "@/lib/types";
import { buildMapCells, type MapCellPublic } from "@/lib/server/grid";

export interface MapReportRow {
  grid_lat: number;
  grid_lng: number;
  type: IncidentType;
}

/**
 * Simula la agregación que debería vivir en Postgres (función SQL del Agente A).
 */
export function mockMapCellsRpc(
  rows: MapReportRow[],
  k = 5,
): MapCellPublic[] {
  return buildMapCells(rows, k);
}
