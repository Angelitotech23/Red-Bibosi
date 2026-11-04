"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiClientError, fetchPosts } from "@/lib/client/api";
import {
  INCIDENT_TYPE_LABELS,
  INCIDENT_TYPES,
  POST_STATUS_LABELS,
  POST_STATUSES,
} from "@/lib/client/labels";
import type { IncidentType, PostPublic, PostStatus } from "@/lib/types";
import { ChipRow } from "@/components/ChipRow";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { ReportCard } from "@/components/ReportCard";

export function CaseThreadList({
  zoneId,
  zoneSlug,
  zoneName,
}: {
  zoneId: string;
  zoneSlug: string;
  zoneName: string;
}) {
  const [type, setType] = useState<IncidentType | "">("");
  const [status, setStatus] = useState<PostStatus | "">("");
  const [posts, setPosts] = useState<PostPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterKey, setFilterKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPosts({
        zone_id: zoneId,
        type,
        status,
        limit: 30,
      });
      setPosts(res.posts);
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : "No pudimos cargar los casos de esta zona.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [zoneId, type, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setFilterKey((key) => key + 1);
  }, [type, status]);

  const hasFilters = Boolean(type || status);
  const publishHref = `/publicar?zona=${encodeURIComponent(zoneSlug)}`;

  return (
    <div>
      <div className="feed-toolbar" role="search" aria-label="Filtros de casos">
        <ChipRow
          label="Tipo"
          allLabel="Todos"
          value={type}
          onChange={setType}
          options={INCIDENT_TYPES.map((item) => ({
            value: item,
            label: INCIDENT_TYPE_LABELS[item],
          }))}
        />
        <ChipRow
          label="Estado"
          allLabel="Todos"
          value={status}
          onChange={setStatus}
          options={POST_STATUSES.map((item) => ({
            value: item,
            label: POST_STATUS_LABELS[item],
          }))}
        />
        <p className="feed-toolbar__note">
          <Link href={publishHref}>Publicar en esta zona</Link>
        </p>
      </div>

      {loading ? <LoadingState label="Cargando denuncias…" variant="feed" /> : null}
      {!loading && error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}
      {!loading && !error && posts.length === 0 ? (
        <EmptyState
          title={
            hasFilters
              ? "No hay casos con estos filtros"
              : `Aún no hay casos en ${zoneName}`
          }
          message="Publica lo que viste en esta zona, sin nombres propios."
          actionHref={publishHref}
          actionLabel="Nueva denuncia"
          onClear={
            hasFilters
              ? () => {
                  setType("");
                  setStatus("");
                }
              : undefined
          }
        />
      ) : null}
      {!loading && !error && posts.length > 0 ? (
        <div className="feed-list" key={filterKey}>
          {posts.map((post, index) => (
            <ReportCard
              key={post.id}
              post={post}
              zoneName={zoneName}
              zoneSlug={zoneSlug}
              index={index}
              onVoted={(updated) =>
                setPosts((current) =>
                  current.map((item) =>
                    item.id === updated.id ? updated : item,
                  ),
                )
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
