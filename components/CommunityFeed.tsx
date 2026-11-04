"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiClientError, fetchPosts, fetchZones } from "@/lib/client/api";
import {
  typesForFeedCategory,
  type FeedCategory,
} from "@/lib/client/feed-categories";
import type { PostPublic, Zone } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import {
  FilterChips,
  categoryChipOptions,
} from "@/components/FilterChips";
import { ReportCard } from "@/components/ReportCard";

export function CommunityFeed({
  zoneId,
  zoneSlug,
  showZoneChips = true,
  highlightPostId,
}: {
  zoneId?: string;
  zoneSlug?: string;
  showZoneChips?: boolean;
  highlightPostId?: string | null;
}) {
  const searchParams = useSearchParams();
  const qParam = (searchParams.get("q") ?? "").trim();

  const [category, setCategory] = useState<FeedCategory | "">("");
  const [district, setDistrict] = useState(zoneId ?? "");
  const [zones, setZones] = useState<Zone[]>([]);
  const [posts, setPosts] = useState<PostPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileQ, setMobileQ] = useState(qParam);

  const zoneMap = useMemo(() => {
    const map = new Map<string, Zone>();
    for (const z of zones) map.set(z.id, z);
    return map;
  }, [zones]);

  const loadZones = useCallback(async () => {
    try {
      const res = await fetchZones();
      setZones(res.zones);
    } catch {
      /* zonas opcionales para etiquetas */
    }
  }, []);

  const loadPosts = useCallback(
    async (opts?: { soft?: boolean }) => {
      if (opts?.soft) setFiltering(true);
      else setLoading(true);
      setError(null);
      try {
        const activeZone = zoneId || district || undefined;
        const res = await fetchPosts({
          zone_id: activeZone,
          limit: 40,
        });
        setPosts(res.posts);
      } catch (e) {
        const msg =
          e instanceof ApiClientError
            ? e.message
            : "No pudimos cargar las denuncias.";
        setError(msg);
      } finally {
        setLoading(false);
        window.setTimeout(() => setFiltering(false), 180);
      }
    },
    [zoneId, district],
  );

  useEffect(() => {
    void loadZones();
  }, [loadZones]);

  const hasLoadedOnce = useRef(false);
  useEffect(() => {
    const soft = hasLoadedOnce.current;
    hasLoadedOnce.current = true;
    void loadPosts({ soft });
  }, [loadPosts]);

  useEffect(() => {
    setMobileQ(qParam);
  }, [qParam]);

  const query = (qParam || mobileQ).trim().toLowerCase();

  const visible = useMemo(() => {
    let list = posts;
    const types = typesForFeedCategory(category);
    if (types) {
      list = list.filter((p) => types.includes(p.type));
    }
    if (query) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.body.toLowerCase().includes(query),
      );
    }
    return list;
  }, [posts, category, query]);

  function onCategoryChange(next: string) {
    setCategory(next as FeedCategory | "");
    // Cambio de filtro: transición de opacidad sin salto
    setFiltering(true);
    window.setTimeout(() => setFiltering(false), 200);
  }

  const districtOptions = zones.map((z) => ({
    id: z.id,
    label: z.name,
  }));

  return (
    <div>
      {!zoneId ? (
        <div className="mobile-search">
          <label className="sr-only" htmlFor="mobile-feed-search">
            Buscar denuncias
          </label>
          <input
            id="mobile-feed-search"
            type="search"
            placeholder="Buscar denuncias…"
            value={mobileQ}
            onChange={(e) => setMobileQ(e.target.value)}
          />
        </div>
      ) : null}

      <FilterChips
        label="Categoría"
        options={categoryChipOptions()}
        value={category}
        onChange={onCategoryChange}
      />

      {showZoneChips && !zoneId ? (
        <FilterChips
          label="Distrito"
          options={districtOptions}
          value={district}
          onChange={setDistrict}
          allLabel="Toda SCZ"
        />
      ) : null}

      {loading ? <FeedSkeleton /> : null}
      {!loading && error ? (
        <ErrorState message={error} onRetry={() => void loadPosts()} />
      ) : null}
      {!loading && !error && visible.length === 0 ? (
        <EmptyState
          actionHref={
            zoneSlug
              ? `/publicar?zona=${encodeURIComponent(zoneSlug)}`
              : "/publicar"
          }
        />
      ) : null}
      {!loading && !error && visible.length > 0 ? (
        <div
          className={`feed-stage${filtering ? " is-filtering" : ""}`}
          aria-busy={filtering}
        >
          <ul className="thread-list">
            {visible.map((post, index) => (
              <ReportCard
                key={post.id}
                post={post}
                zoneName={zoneMap.get(post.zone_id)?.name}
                index={index}
                highlight={highlightPostId === post.id}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
