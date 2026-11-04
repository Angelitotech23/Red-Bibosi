"use client";

import { useId } from "react";
import { CityMap, type LatLng } from "@/components/CityMap";

export type { LatLng };

/**
 * Mapa de selección de ubicación exacta.
 * Las coordenadas solo se mantienen en estado local para enviar al servidor;
 * no se muestran al usuario.
 */
export function LocationPicker({
  value,
  onChange,
  disabled,
}: {
  value: LatLng | null;
  onChange: (next: LatLng) => void;
  disabled?: boolean;
}) {
  const labelId = useId();

  return (
    <div>
      <p id={labelId} className="muted field-help">
        Marca en el mapa el punto exacto del hecho. La ubicación precisa solo se
        envía al servidor; no se muestra en el foro.
      </p>
      <div className="map-shell">
        <CityMap
          labelledBy={labelId}
          describedBy={`${labelId}-help`}
          pick={{ value, onChange, disabled }}
        />
      </div>
      <p id={`${labelId}-help`} className="muted field-help">
        {value
          ? "Ubicación marcada. Puedes ajustar con clic o flechas del teclado."
          : "Aún no hay punto marcado."}
      </p>
    </div>
  );
}
