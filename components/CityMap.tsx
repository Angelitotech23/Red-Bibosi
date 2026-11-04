"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CircleMarker,
  LatLngBoundsExpression,
  Map as LeafletMap,
  Marker,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapCellPublic } from "@/lib/client/api";
import { INCIDENT_TYPE_LABELS } from "@/lib/client/labels";
import type { IncidentType } from "@/lib/types";

/** Bbox aproximado del área urbana de Santa Cruz (solo para UI). */
export const SCZ_BOUNDS = {
  south: -17.86,
  north: -17.7,
  west: -63.26,
  east: -63.08,
};

export const SCZ_CENTER = { lat: -17.7833, lng: -63.1821 };

export type LatLng = { lat: number; lng: number };

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function toPercent(point: LatLng): { x: number; y: number } {
  const x = ((point.lng - SCZ_BOUNDS.west) / (SCZ_BOUNDS.east - SCZ_BOUNDS.west)) * 100;
  const y =
    ((SCZ_BOUNDS.north - point.lat) / (SCZ_BOUNDS.north - SCZ_BOUNDS.south)) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
}

export function latLngFromEvent(
  el: HTMLElement,
  clientX: number,
  clientY: number,
): LatLng {
  const rect = el.getBoundingClientRect();
  const x = clamp((clientX - rect.left) / rect.width, 0, 1);
  const y = clamp((clientY - rect.top) / rect.height, 0, 1);
  return {
    lng: SCZ_BOUNDS.west + x * (SCZ_BOUNDS.east - SCZ_BOUNDS.west),
    lat: SCZ_BOUNDS.north - y * (SCZ_BOUNDS.north - SCZ_BOUNDS.south),
  };
}

export function cellColor(total: number): string {
  if (total >= 5) return "#9b1c1c";
  if (total >= 3) return "#b45a14";
  if (total >= 2) return "#d4a017";
  return "#1a3c34";
}

export function summarizeCell(
  byType: Partial<Record<IncidentType, number>>,
): string {
  return (Object.keys(byType) as IncidentType[])
    .filter((key) => (byType[key] ?? 0) > 0)
    .map((key) => `${INCIDENT_TYPE_LABELS[key]}: ${byType[key]}`)
    .join(", ");
}

async function loadLeaflet() {
  const mod = await import("leaflet");
  return mod.default ?? mod;
}

export function CityMap({
  cells = [],
  pick,
  labelledBy,
  describedBy,
  label,
}: {
  cells?: MapCellPublic[];
  pick?: {
    value: LatLng | null;
    onChange: (next: LatLng) => void;
    disabled?: boolean;
  };
  labelledBy?: string;
  describedBy?: string;
  label?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const cellMarkersRef = useRef<CircleMarker[]>([]);
  const pickMarkerRef = useRef<Marker | null>(null);
  const pickRef = useRef(pick);
  pickRef.current = pick;

  const [mapReady, setMapReady] = useState(false);
  const picking = Boolean(pick) && !pick?.disabled;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;

    void (async () => {
      try {
        const L = await loadLeaflet();
        if (disposed || !hostRef.current) return;

        const reduce =
          typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const bounds: LatLngBoundsExpression = [
          [SCZ_BOUNDS.south, SCZ_BOUNDS.west],
          [SCZ_BOUNDS.north, SCZ_BOUNDS.east],
        ];

        const map = L.map(host, {
          center: [SCZ_CENTER.lat, SCZ_CENTER.lng],
          zoom: 12,
          minZoom: 11,
          maxZoom: 16,
          zoomControl: true,
          attributionControl: true,
          keyboard: false,
          zoomAnimation: !reduce,
          fadeAnimation: !reduce,
          markerZoomAnimation: !reduce,
          maxBounds: bounds,
          maxBoundsViscosity: 0.85,
        });

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          },
        ).addTo(map);

        map.on("click", (event) => {
          const current = pickRef.current;
          if (!current || current.disabled) return;
          current.onChange({
            lat: event.latlng.lat,
            lng: event.latlng.lng,
          });
        });

        mapRef.current = map;
        requestAnimationFrame(() => {
          map.invalidateSize();
          setMapReady(true);
        });
      } catch {
        if (!disposed) setMapReady(false);
      }
    })();

    return () => {
      disposed = true;
      setMapReady(false);
      for (const marker of cellMarkersRef.current) marker.remove();
      cellMarkersRef.current = [];
      pickMarkerRef.current?.remove();
      pickMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    let cancelled = false;

    void (async () => {
      const L = await loadLeaflet();
      if (cancelled || mapRef.current !== map) return;

      for (const marker of cellMarkersRef.current) marker.remove();
      cellMarkersRef.current = cells.map((cell) => {
        const summary = summarizeCell(cell.by_type);
        const marker = L.circleMarker([cell.grid_lat, cell.grid_lng], {
          radius: 10 + Math.min(cell.total, 8) * 2,
          color: "#f4efe6",
          weight: 1,
          fillColor: cellColor(cell.total),
          fillOpacity: 0.86,
        });
        marker.bindTooltip(`${cell.total} casos`);
        marker.bindPopup(
          `<strong>${cell.total} casos en esta celda</strong><br/>${
            summary || "Sin desglose por tipo"
          }`,
        );
        marker.addTo(map);
        return marker;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [cells, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const point = pick?.value;
    if (!map || !mapReady) return;
    let cancelled = false;

    void (async () => {
      const L = await loadLeaflet();
      if (cancelled || mapRef.current !== map) return;

      if (!point) {
        pickMarkerRef.current?.remove();
        pickMarkerRef.current = null;
        return;
      }

      const icon = L.divIcon({
        className: "city-map__pin",
        iconSize: [18, 18],
        iconAnchor: [9, 18],
      });

      if (pickMarkerRef.current) {
        pickMarkerRef.current.setLatLng([point.lat, point.lng]);
        return;
      }

      pickMarkerRef.current = L.marker([point.lat, point.lng], {
        icon,
        interactive: false,
        keyboard: false,
      }).addTo(map);
    })();

    return () => {
      cancelled = true;
    };
  }, [pick?.value, mapReady]);

  const fallbackPin = !mapReady && pick?.value ? toPercent(pick.value) : null;

  return (
    <div
      ref={canvasRef}
      className={picking ? "map-canvas city-map city-map--pick" : "map-canvas city-map"}
      role={pick ? "application" : "img"}
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      tabIndex={picking ? 0 : undefined}
      data-readonly={picking ? "false" : "true"}
      data-map-ready={mapReady ? "true" : "false"}
      onClick={(event) => {
        if (mapReady || !pick || pick.disabled) return;
        pick.onChange(
          latLngFromEvent(event.currentTarget, event.clientX, event.clientY),
        );
      }}
      onKeyDown={(event) => {
        if (!pick || pick.disabled || !pick.value) return;
        const step = event.shiftKey ? 0.002 : 0.0005;
        let { lat, lng } = pick.value;
        if (event.key === "ArrowUp") lat += step;
        else if (event.key === "ArrowDown") lat -= step;
        else if (event.key === "ArrowLeft") lng -= step;
        else if (event.key === "ArrowRight") lng += step;
        else return;
        event.preventDefault();
        pick.onChange({
          lat: clamp(lat, SCZ_BOUNDS.south, SCZ_BOUNDS.north),
          lng: clamp(lng, SCZ_BOUNDS.west, SCZ_BOUNDS.east),
        });
      }}
    >
      <div ref={hostRef} className="city-map__leaflet" />
      {!mapReady ? (
        <div className="city-map__fallback" aria-hidden={cells.length === 0}>
          {cells.map((cell) => {
            const pos = toPercent({ lat: cell.grid_lat, lng: cell.grid_lng });
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
                title={summarizeCell(cell.by_type)}
              >
                <span className="sr-only">
                  Celda con {cell.total} casos. {summarizeCell(cell.by_type)}
                </span>
                <span aria-hidden="true">{cell.total}</span>
              </span>
            );
          })}
          {fallbackPin ? (
            <span
              className="map-pin"
              style={{ left: `${fallbackPin.x}%`, top: `${fallbackPin.y}%` }}
              aria-hidden="true"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
