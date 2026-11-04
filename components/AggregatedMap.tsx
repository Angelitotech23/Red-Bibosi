"use client";

import type { MapCellPublic } from "@/lib/client/api";
import { CityMap } from "@/components/CityMap";

/** Mapa real de Santa Cruz con celdas agregadas — sin marcadores individuales. */
export function AggregatedMap({ cells }: { cells: MapCellPublic[] }) {
  return (
    <div>
      <div className="map-shell">
        <CityMap
          cells={cells}
          label="Mapa de Santa Cruz de la Sierra con conteo agregado de casos"
        />
      </div>
      <div className="map-legend" aria-hidden="true">
        <span>1 caso</span>
        <span>2</span>
        <span>3–4</span>
        <span>5+</span>
      </div>
      <p className="muted field-help">
        Mapa de la ciudad con conteos por celda agregada. No hay marcadores de
        casos individuales ni coordenadas exactas.
      </p>
    </div>
  );
}
