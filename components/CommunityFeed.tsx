"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiClientError, fetchPosts, fetchZones } from "@/lib/client/api";
import { alignPostsToZones } from "@/lib/client/align-demo-posts";
import {
  FEED_CATEGORIES,
  FEED_CATEGORY_CHIP_LABELS,
  typesForFeedCategory,
  type FeedCategory,
} from "@/lib/client/feed-categories";
import type { PostPublic, Zone } from "@/lib/types";
import { ChipRow } from "@/components/ChipRow";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { ReportCard } from "@/components/ReportCard";

function isFeedCategory(value: string | null): value is FeedCategory {
  return Boolean(value && FEED_CATEGORIES.includes(value as FeedCategory));
}

export function CommunityFeed() {
  const router = useRouter();
  const params = useSearchParams();
  const rawCategory = params.get("categoria");
  const category: FeedCategory | "" = isFeedCategory(rawCategory)
    ? rawCategory
    : "";
  const zoneSlug = params.get("zona") ?? "";
  const query = (params.get("q") ?? "").trim();
  const publishedId = params.get("publicado");

  const [zones, setZones] = useState<Zone[]>([]);
  const [posts, setPosts] = useState<PostPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterKey, setFilterKey] = useState(0);

  const zoneById = useMemo(() => {
    const map = new Map<string, Zone>();
    for (const zone of zones) map.set(zone.id, zone);
    return map;
  }, [zones]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [zonesRes, postsRes] = await Promise.all([
        fetchZones(),
        fetchPosts({ limit: 50 }),
      ]);
      setZones(zonesRes.zones);
      setPosts(alignPostsToZones(postsRes.posts, zonesRes.zones));
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : "No pudimos cargar el feed de denuncias.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setFilterKey((key) => key + 1);
  }, [category, zoneSlug, query]);

  useEffect(() => {
    if (!publishedId || loading) return;
    const card = document.getElementById(`denuncia-${publishedId}`);
    if (!card) return;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  }, [publishedId, loading, posts]);

  function replaceParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    const qs = next.toString();
    router.replace(qs ? `/inicio?${qs}` : "/inicio", { scroll: false });
  }

  const visible = useMemo(() => {
    const types = typesForFeedCategory(category);
    const zone = zones.find((item) => item.slug === zoneSlug);
    const needle = query.toLocaleLowerCase("es-BO");
    return posts.filter((post) => {
      if (types && !types.includes(post.type)) return false;
      if (zone && post.zone_id !== zone.id) return false;
      if (needle) {
        const hay = `${post.title} ${post.body}`.toLocaleLowerCase("es-BO");
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [posts, category, zoneSlug, query, zones]);

  const hasFilters = Boolean(category || zoneSlug || query);

  return (
    <div className="feed-page">
      <header className="feed-intro">
        <p className="feed-intro__kicker">Santa Cruz de la Sierra</p>
        <h1>Denuncias de vecinos</h1>
        <p className="feed-intro__lede">
          Lectura abierta, anónima y por barrio. Elige una categoría o tu zona
          para ver qué está pasando.
        </p>
      </header>

      <p className="demo-banner" role="status">
        Casos de demostración. Los relatos son inventados para mostrar cómo se
        ve el foro, sin datos personales reales.
      </p>

      {publishedId ? (
        <p className="confirm-banner" role="status">
          Tu denuncia ya está visible en el feed.
        </p>
      ) : null}

      <div className="feed-toolbar">
        <ChipRow
          label="Categoría"
          allLabel="Todas"
          value={category}
          onChange={(next) =>
            replaceParams((search) => {
              if (next) search.set("categoria", next);
              else search.delete("categoria");
            })
          }
          options={FEED_CATEGORIES.map((item) => ({
            value: item,
            label: FEED_CATEGORY_CHIP_LABELS[item],
            tone: item,
          }))}
        />
        <ChipRow
          label="Distrito"
          allLabel="Toda la ciudad"
          value={zoneSlug}
          onChange={(next) =>
            replaceParams((search) => {
              if (next) search.set("zona", next);
              else search.delete("zona");
            })
          }
          options={zones.map((zone) => ({
            value: zone.slug,
            label: zone.name,
          }))}
        />
      </div>

      {loading ? <LoadingState label="Cargando denuncias…" variant="feed" /> : null}
      {!loading && error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}
      {!loading && !error && visible.length === 0 ? (
        <EmptyState
          title={
            hasFilters
              ? "No hay denuncias con este filtro"
              : "Aún no hay denuncias publicadas"
          }
          message={
            hasFilters
              ? "Prueba otra categoría o distrito, o publica la primera en esta zona."
              : "Sé la primera persona en contar lo que ocurre en tu barrio."
          }
          actionHref="/publicar"
          actionLabel="Nueva denuncia"
          onClear={
            hasFilters
              ? () =>
                  replaceParams((search) => {
                    search.delete("categoria");
                    search.delete("zona");
                    search.delete("q");
                  })
              : undefined
          }
        />
      ) : null}
      {!loading && !error && visible.length > 0 ? (
        <div className="feed-list" key={filterKey}>
          {visible.map((post, index) => {
            const zone = zoneById.get(post.zone_id);
            return (
              <ReportCard
                key={post.id}
                post={post}
                zoneName={zone?.name ?? "Zona"}
                zoneSlug={zone?.slug}
                highlight={post.id === publishedId}
                index={index}
                onVoted={(updated) =>
                  setPosts((current) =>
                    current.map((item) =>
                      item.id === updated.id ? updated : item,
                    ),
                  )
                }
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
