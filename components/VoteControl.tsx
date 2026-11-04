"use client";

import { useEffect, useRef, useState } from "react";
import { ApiClientError, createVote } from "@/lib/client/api";
import type { PostPublic } from "@/lib/types";

export function VoteControl({
  postId,
  count,
  onVoted,
  describedBy,
  labeled = false,
}: {
  postId: string;
  count: number;
  onVoted?: (post: PostPublic) => void;
  describedBy?: string;
  labeled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pop, setPop] = useState(false);
  const [display, setDisplay] = useState(count);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [dir, setDir] = useState<"up" | "down" | null>(null);
  const lastCount = useRef(count);

  useEffect(() => {
    if (count === lastCount.current) return;
    const nextDir = count > lastCount.current ? "up" : "down";
    setDir(nextDir);
    setIncoming(count);
    setPop(true);
    lastCount.current = count;
    const timer = window.setTimeout(() => {
      setDisplay(count);
      setIncoming(null);
      setDir(null);
      setPop(false);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [count]);

  async function onVote() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await createVote(postId);
      onVoted?.(res.post);
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : "No se pudo registrar tu corroboración.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="vote-control">
      <button
        type="button"
        className={`vote-btn${pop ? " is-popping" : ""}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void onVote();
        }}
        disabled={busy}
        aria-describedby={describedBy}
        aria-label={`Corroborar denuncia, ${display} corroboraciones`}
      >
        <span className="vote-btn__icon" aria-hidden="true">
          ▲
        </span>
        {labeled ? <span>Corroborar</span> : null}
        <span className="vote-count" data-dir={dir ?? undefined}>
          <span className="vote-count__curr">{display}</span>
          {incoming !== null ? (
            <span className="vote-count__next">{incoming}</span>
          ) : null}
        </span>
      </button>
      {error ? (
        <p className="vote-control__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
