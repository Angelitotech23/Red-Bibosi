"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ApiClientError,
  createComment,
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
import { VoteControl } from "@/components/VoteControl";

export function CaseDetail({ postId }: { postId: string }) {
  const [post, setPost] = useState<PostPublic | null>(null);
  const [comments, setComments] = useState<CommentPublic[]>([]);
  const [official, setOfficial] = useState<OfficialResponsePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <span className="muted">reporte anónimo</span>
      </div>

      <h1 className="case-title">{post.title}</h1>

      <p className="case-body">{post.body}</p>

      <div className="case-vote">
        <VoteControl
          postId={postId}
          count={post.vote_count ?? 0}
          onVoted={setPost}
          describedBy="vote-help"
          labeled
        />
        <p id="vote-help" className="muted">
          Un voto por persona. Ayuda a confirmar que el hecho ocurrió.
        </p>
      </div>

      {official ? (
        <section className="official-box" aria-labelledby="official-title">
          <h2 id="official-title" className="subhead">
            Respuesta oficial
          </h2>
          <p className="official-box__body">{official.body}</p>
          <p className="muted">
            Autoridad · {formatCaseDate(official.created_at)} · estado:{" "}
            <StatusBadge status={official.status_after} />
          </p>
        </section>
      ) : null}

      <section aria-labelledby="comments-title">
        <h2 id="comments-title" className="subhead">
          Comentarios
        </h2>
        {comments.length === 0 ? (
          <p className="muted">Todavía no hay comentarios.</p>
        ) : (
          <ul className="comment-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item">
                <strong>Vecino</strong>
                <span className="muted"> · {formatCaseDate(c.created_at)}</span>
                <p className="comment-item__body">{c.body}</p>
              </li>
            ))}
          </ul>
        )}

        <form
          className="comment-form"
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
        <Link href="/inicio">← Volver al feed</Link>
      </p>
    </article>
  );
}
