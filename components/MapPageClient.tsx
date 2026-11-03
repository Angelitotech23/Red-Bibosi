"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiClientError,
  fetchMapCells,
  type MapCellPublic,
} from "@/lib/client/api";
import { AggregatedMap } from "@/components/AggregatedMap";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export function MapPageClient() {
  const [cells, setCells] = useState<MapCellPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMapCells();
      setCells(res.cells);
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : "No pudimos cargar el mapa agregado.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label="Cargando mapa…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return <AggregatedMap cells={cells} />;
}
