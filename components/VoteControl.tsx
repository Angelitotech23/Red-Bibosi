"use client";

import { useState } from "react";
import { ApiClientError, createVote } from "@/lib/client/api";

export function VoteControl({
  postId,
  initialCount,
  onCountChange,
  compact = false,
}: {
  postId: string;
  initialCount: number;
  onCountChange?: (count: number) => void;
  compact?: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);
  const [dir, setDir] = useState<"up" | "down" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVote() {
    if (busy || voted) return;
    setBusy(true);
    setError(null);
    const prev = count;
    // Optimistic: feedback inmediato al corroborar
    setCount(prev + 1);
    setDir("up");
    setPop(true);
    onCountChange?.(prev + 1);
    try {
      const res = await createVote(postId);
      const next = res.post.vote_count ?? prev + 1;
      setCount(next);
      setVoted(true);
      onCountChange?.(next);
    } catch (e) {
      setCount(prev);
      setDir("down");
      onCountChange?.(prev);
      const msg =
        e instanceof ApiClientError
          ? e.message
          : "No pudimos registrar tu corroboración.";
      setError(msg);
    } finally {
      setBusy(false);
      window.setTimeout(() => {
        setPop(false);
        setDir(null);
      }, 200);
    }
  }

  return (
    <div className="vote-col" aria-label="Corroboraciones">
      <button
        type="button"
        className={`vote-btn${voted ? " is-voted" : ""}${pop ? " is-pop" : ""}`}
        onClick={() => void handleVote()}
        disabled={busy || voted}
        aria-pressed={voted}
        aria-label={
          voted ? "Ya corroboraste este caso" : "Corroborar este caso"
        }
        title={voted ? "Ya corroboraste" : "Corroborar"}
      >
        <span aria-hidden="true">▲</span>
      </button>
      <div
        className={`vote-count${dir === "up" ? " is-up" : ""}${dir === "down" ? " is-down" : ""}`}
        aria-live="polite"
      >
        <span className="vote-count__inner">{count}</span>
      </div>
      {!compact && error ? (
        <span className="sr-only" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
