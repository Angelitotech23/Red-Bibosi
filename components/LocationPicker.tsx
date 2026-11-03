"use client";

import { useId } from "react";

/** Bbox aproximado del área urbana de Santa Cruz (solo para UI). */
const SCZ = {
  south: -17.86,
  north: -17.7,
  west: -63.26,
  east: -63.08,
};

export type LatLng = { lat: number; lng: number };

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function toPercent(point: LatLng): { x: number; y: number } {
  const x = ((point.lng - SCZ.west) / (SCZ.east - SCZ.west)) * 100;
  const y = ((SCZ.north - point.lat) / (SCZ.north - SCZ.south)) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
}

function fromEvent(
  el: HTMLElement,
  clientX: number,
  clientY: number,
): LatLng {
  const rect = el.getBoundingClientRect();
  const x = clamp((clientX - rect.left) / rect.width, 0, 1);
  const y = clamp((clientY - rect.top) / rect.height, 0, 1);
  return {
    lng: SCZ.west + x * (SCZ.east - SCZ.west),
    lat: SCZ.north - y * (SCZ.north - SCZ.south),
  };
}

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
  const pin = value ? toPercent(value) : null;

  return (
    <div>
      <p id={labelId} className="muted" style={{ margin: "0 0 0.5rem" }}>
        Marca en el mapa el punto exacto del hecho. La ubicación precisa solo se
        envía al servidor; no se muestra en el foro.
      </p>
      <div className="map-shell">
        <div
          className="map-canvas"
          role="application"
          aria-labelledby={labelId}
          aria-describedby={`${labelId}-help`}
          tabIndex={disabled ? -1 : 0}
          data-readonly={disabled ? "true" : "false"}
          onClick={(e) => {
            if (disabled) return;
            onChange(fromEvent(e.currentTarget, e.clientX, e.clientY));
          }}
          onKeyDown={(e) => {
            if (disabled || !value) return;
            const step = e.shiftKey ? 0.002 : 0.0005;
            let { lat, lng } = value;
            if (e.key === "ArrowUp") lat += step;
            else if (e.key === "ArrowDown") lat -= step;
            else if (e.key === "ArrowLeft") lng -= step;
            else if (e.key === "ArrowRight") lng += step;
            else return;
            e.preventDefault();
            onChange({
              lat: clamp(lat, SCZ.south, SCZ.north),
              lng: clamp(lng, SCZ.west, SCZ.east),
            });
          }}
        >
          {pin ? (
            <span
              className="map-pin"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
      <p id={`${labelId}-help`} className="muted" style={{ margin: "0.5rem 0 0" }}>
        {value
          ? "Ubicación marcada. Puedes ajustar con clic o flechas del teclado."
          : "Aún no hay punto marcado."}
      </p>
    </div>
  );
}
