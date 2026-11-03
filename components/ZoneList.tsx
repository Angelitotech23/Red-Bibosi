"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiClientError, fetchZones } from "@/lib/client/api";
import type { Zone } from "@/lib/types";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export function ZoneList() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchZones();
      setZones(res.zones);
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : "No pudimos cargar las zonas.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label="Cargando zonas…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <ul className="zone-list">
      {zones.map((zone, index) => (
        <li key={zone.id} style={{ animationDelay: `${index * 40}ms` }}>
          <Link className="zone-link" href={`/zona/${zone.slug}`}>
            <strong>{zone.name}</strong>
            <em>Ver casos →</em>
          </Link>
        </li>
      ))}
    </ul>
  );
}
