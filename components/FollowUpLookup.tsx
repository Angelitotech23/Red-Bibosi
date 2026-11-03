"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ApiClientError, lookupFollowUp } from "@/lib/client/api";
import { formatCaseDate } from "@/lib/client/format";
import type { PostPublic } from "@/lib/types";
import { ErrorState } from "@/components/ErrorState";
import { StatusBadge } from "@/components/StatusBadge";
import { TypeBadge } from "@/components/TypeBadge";

export function FollowUpLookup() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<PostPublic | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPost(null);
    try {
      const res = await lookupFollowUp(code);
      setPost(res.post);
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "No pudimos consultar ese código.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-narrow stack">
      <form className="follow-form" onSubmit={(e) => void onSubmit(e)}>
        <div className="field">
          <label htmlFor="follow-code">Código de seguimiento</label>
          <input
            id="follow-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="Ej. CUADRA-DEMO-1001"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Consultando…" : "Consultar estado"}
        </button>
      </form>

      {error ? <ErrorState message={error} /> : null}

      {post ? (
        <div className="state-panel" role="status">
          <div className="meta-row" style={{ marginBottom: "0.5rem" }}>
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
            <span>{formatCaseDate(post.updated_at)}</span>
          </div>
          <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.25rem" }}>
            {post.title}
          </h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Estado actual del caso. No se muestran datos privados ni ubicación
            exacta.
          </p>
          <Link className="btn btn-secondary" href={`/caso/${post.id}`}>
            Ver publicación pública
          </Link>
        </div>
      ) : null}
    </div>
  );
}
