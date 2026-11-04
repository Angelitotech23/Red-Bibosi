"use client";

import type { MapCellPublic } from "@/lib/client/api";
import { INCIDENT_TYPE_LABELS } from "@/lib/client/labels";
import type { IncidentType } from "@/lib/types";

const SCZ = {
  south: -17.86,
  north: -17.7,
  west: -63.26,
  east: -63.08,
};

function cellColor(total: number): string {
  if (total >= 5) return "rgba(155, 28, 28, 0.85)";
  if (total >= 3) return "rgba(180, 90, 20, 0.82)";
  if (total >= 2) return "rgba(212, 160, 23, 0.85)";
  return "rgba(26, 60, 52, 0.78)";
}

function toPercent(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - SCZ.west) / (SCZ.east - SCZ.west)) * 100;
  const y = ((SCZ.north - lat) / (SCZ.north - SCZ.south)) * 100;
  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  };
}

function summarize(byType: Partial<Record<IncidentType, number>>): string {
  return (Object.keys(byType) as IncidentType[])
    .filter((k) => (byType[k] ?? 0) > 0)
    .map((k) => `${INCIDENT_TYPE_LABELS[k]}: ${byType[k]}`)
    .join(", ");
}

/** Mapa de celdas agregadas — sin marcadores individuales. */
export function AggregatedMap({ cells }: { cells: MapCellPublic[] }) {
  return (
    <div>
      <div className="map-shell" aria-label="Mapa agregado de casos por celda">
        <div className="map-canvas" data-readonly="true" role="img">
          {cells.map((cell) => {
            const pos = toPercent(cell.grid_lat, cell.grid_lng);
            const size = 28 + Math.min(cell.total, 8) * 4;
            return (
              <span
                key={`${cell.grid_lat}-${cell.grid_lng}`}
                className="map-cell"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: size,
                  height: size,
                  background: cellColor(cell.total),
                }}
                title={summarize(cell.by_type)}
              >
                <span className="sr-only">
                  Celda con {cell.total} casos. {summarize(cell.by_type)}
                </span>
                <span aria-hidden="true">{cell.total}</span>
              </span>
            );
          })}
        </div>
      </div>
      <div className="map-legend" aria-hidden="true">
        <span>1 caso</span>
        <span>2</span>
        <span>3–4</span>
        <span>5+</span>
      </div>
      <p className="muted field-help">
        Solo se muestran conteos por celda agregada. No hay marcadores de casos
        individuales ni coordenadas exactas.
      </p>
    </div>
  );
}
