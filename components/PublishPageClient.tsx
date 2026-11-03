"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiClientError, fetchZones } from "@/lib/client/api";
import { PublishForm } from "@/components/PublishForm";

export function PublishPageClient() {
  const search = useSearchParams();
  const zonaSlug = search.get("zona");
  const [initialZoneId, setInitialZoneId] = useState<string | undefined>();

  useEffect(() => {
    if (!zonaSlug) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchZones();
        if (cancelled) return;
        const zone = res.zones.find((z) => z.slug === zonaSlug);
        if (zone) setInitialZoneId(zone.id);
      } catch (e) {
        if (e instanceof ApiClientError) {
          /* el formulario cargará zonas igual */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [zonaSlug]);

  return <PublishForm initialZoneId={initialZoneId} />;
}
