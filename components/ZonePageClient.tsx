"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiClientError, fetchZones } from "@/lib/client/api";
import type { Zone } from "@/lib/types";
import { CaseThreadList } from "@/components/CaseThreadList";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export function ZonePageClient({ slug }: { slug: string }) {
  const [zone, setZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchZones();
      const found = res.zones.find((z) => z.slug === slug) ?? null;
      if (!found) {
        setError("No encontramos esa zona.");
        setZone(null);
      } else {
        setZone(found);
      }
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : "No pudimos cargar la zona.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label="Cargando zona…" />;
  if (error || !zone) {
    return (
      <ErrorState
        message={error ?? "Zona no encontrada."}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1>{zone.name}</h1>
          <p className="lede">
            Casos publicados en esta zona. Filtra por tipo o estado.
          </p>
        </div>
      </div>
      <CaseThreadList
        zoneId={zone.id}
        zoneSlug={zone.slug}
        zoneName={zone.name}
      />
    </div>
  );
}
