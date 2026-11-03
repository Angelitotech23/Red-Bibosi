"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiClientError, fetchPosts } from "@/lib/client/api";
import { formatCaseDate } from "@/lib/client/format";
import {
  INCIDENT_TYPE_LABELS,
  INCIDENT_TYPES,
  POST_STATUS_LABELS,
  POST_STATUSES,
} from "@/lib/client/labels";
import type { IncidentType, PostPublic, PostStatus } from "@/lib/types";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { TypeBadge } from "@/components/TypeBadge";

export function CaseThreadList({
  zoneId,
  zoneSlug,
}: {
  zoneId: string;
  zoneSlug: string;
}) {
  const [type, setType] = useState<IncidentType | "">("");
  const [status, setStatus] = useState<PostStatus | "">("");
  const [posts, setPosts] = useState<PostPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <div className="filters" role="search" aria-label="Filtros de casos">
        <div className="field">
          <label htmlFor="filter-type">Tipo</label>
          <select
            id="filter-type"
            value={type}
            onChange={(e) => setType(e.target.value as IncidentType | "")}
          >
            <option value="">Todos</option>
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {INCIDENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="filter-status">Estado</label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus | "")}
          >
            <option value="">Todos</option>
            {POST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {POST_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div style={{ alignSelf: "end" }}>
          <Link
            className="btn btn-accent"
            href={`/publicar?zona=${encodeURIComponent(zoneSlug)}`}
          >
            Publicar caso
          </Link>
        </div>
      </div>

      {loading ? <LoadingState label="Cargando hilos…" /> : null}
      {!loading && error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}
      {!loading && !error && posts.length === 0 ? (
        <div className="state-panel">
          No hay casos publicados con estos filtros.
        </div>
      ) : null}
      {!loading && !error && posts.length > 0 ? (
        <ul className="thread-list">
          {posts.map((post) => (
            <li key={post.id} className="thread-item">
              <div className="vote-col" aria-label="Corroboraciones">
                <span aria-hidden="true">▲</span>
                <span>{post.vote_count ?? 0}</span>
              </div>
              <div>
                <Link className="title" href={`/caso/${post.id}`}>
                  {post.title}
                </Link>
                <div className="meta-row">
                  <TypeBadge type={post.type} />
                  <StatusBadge status={post.status} />
                  <span>{formatCaseDate(post.created_at)}</span>
                  {post.author_pseudonym ? (
                    <span>por {post.author_pseudonym}</span>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
