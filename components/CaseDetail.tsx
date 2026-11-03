"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ApiClientError,
  createComment,
  createVote,
  fetchComments,
  fetchOfficialResponse,
  fetchPost,
} from "@/lib/client/api";
import { formatCaseDate } from "@/lib/client/format";
import { subscribeToCaseRealtime } from "@/lib/client/realtime";
import type {
  CommentPublic,
  OfficialResponsePublic,
  PostPublic,
} from "@/lib/types";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { TypeBadge } from "@/components/TypeBadge";

export function CaseDetail({ postId }: { postId: string }) {
  const [post, setPost] = useState<PostPublic | null>(null);
  const [comments, setComments] = useState<CommentPublic[]>([]);
  const [official, setOfficial] = useState<OfficialResponsePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [voteBusy, setVoteBusy] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const [commentBody, setCommentBody] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [postRes, commentsRes, officialRes] = await Promise.all([
        fetchPost(postId),
        fetchComments(postId),
        fetchOfficialResponse(postId),
      ]);
      setPost(postRes.post);
      setComments(commentsRes.comments);
      setOfficial(officialRes.response);
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : "No pudimos cargar este caso.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const refreshComments = useCallback(async () => {
    try {
      const res = await fetchComments(postId);
      setComments(res.comments);
    } catch {
      /* silencioso en realtime */
    }
  }, [postId]);

  const refreshPost = useCallback(async () => {
    try {
      const res = await fetchPost(postId);
      setPost(res.post);
    } catch {
      /* silencioso en realtime */
    }
  }, [postId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    const unsubscribe = subscribeToCaseRealtime(postId, {
      onCommentChange: () => {
        void refreshComments();
      },
      onVoteChange: () => {
        void refreshPost();
      },
    });
    return unsubscribe;
  }, [postId, refreshComments, refreshPost]);

  async function onVote() {
    setVoteBusy(true);
    setVoteError(null);
    try {
      const res = await createVote(postId);
      setPost(res.post);
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : "No se pudo registrar tu corroboración.";
      setVoteError(msg);
    } finally {
      setVoteBusy(false);
    }
  }

  async function onComment(e: FormEvent) {
    e.preventDefault();
    setCommentBusy(true);
    setCommentError(null);
    try {
      const res = await createComment(postId, commentBody);
      setComments((prev) => [...prev, res.comment]);
      setCommentBody("");
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "No se pudo publicar el comentario.";
      setCommentError(msg);
    } finally {
      setCommentBusy(false);
    }
  }

  if (loading) {
    return <LoadingState label="Cargando caso…" />;
  }

  if (error || !post) {
    return (
      <ErrorState
        message={error ?? "Caso no encontrado."}
        onRetry={() => void loadAll()}
      />
    );
  }

  return (
    <article className="case-article page-narrow">
      <div className="meta-row">
        <TypeBadge type={post.type} />
        <StatusBadge status={post.status} />
        <span>{formatCaseDate(post.created_at)}</span>
        {post.author_pseudonym ? <span>por {post.author_pseudonym}</span> : null}
      </div>

      <h1
        style={{
          margin: 0,
          fontFamily: "var(--cuadra-font-display)",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          color: "var(--cuadra-brand)",
        }}
      >
        {post.title}
      </h1>

      <p className="case-body">{post.body}</p>

      <div className="stack" style={{ maxWidth: "18rem" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void onVote()}
          disabled={voteBusy}
          aria-describedby="vote-help"
        >
          {voteBusy
            ? "Registrando…"
            : `Corroborar (${post.vote_count ?? 0})`}
        </button>
        <p id="vote-help" className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
          Un voto por persona. Ayuda a confirmar que el hecho ocurrió.
        </p>
        {voteError ? <ErrorState message={voteError} /> : null}
      </div>

      {official ? (
        <section className="official-box" aria-labelledby="official-title">
          <h2 id="official-title" style={{ margin: "0 0 0.4rem", fontSize: "1.1rem" }}>
            Respuesta oficial
          </h2>
          <p style={{ margin: "0 0 0.5rem" }}>{official.body}</p>
          <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
            {official.author_pseudonym ?? "Autoridad"} ·{" "}
            {formatCaseDate(official.created_at)} · estado:{" "}
            <StatusBadge status={official.status_after} />
          </p>
        </section>
      ) : null}

      <section aria-labelledby="comments-title">
        <h2 id="comments-title" style={{ fontSize: "1.2rem" }}>
          Comentarios
        </h2>
        {comments.length === 0 ? (
          <p className="muted">Todavía no hay comentarios.</p>
        ) : (
          <ul className="comment-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item">
                <strong>{c.author_pseudonym ?? "vecino"}</strong>
                <span className="muted"> · {formatCaseDate(c.created_at)}</span>
                <p style={{ margin: "0.35rem 0 0" }}>{c.body}</p>
              </li>
            ))}
          </ul>
        )}

        <form
          className="comment-form"
          style={{ marginTop: "1rem" }}
          onSubmit={(e) => void onComment(e)}
        >
          <div className="field">
            <label htmlFor="comment-body">Tu comentario</label>
            <textarea
              id="comment-body"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              required
              placeholder="Sin nombres propios de personas o negocios."
            />
          </div>
          {commentError ? <ErrorState message={commentError} /> : null}
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={commentBusy}
          >
            {commentBusy ? "Publicando…" : "Comentar"}
          </button>
        </form>
      </section>

      <p>
        <Link href="/inicio">← Volver a zonas</Link>
      </p>
    </article>
  );
}
