"use client";

import Link from "next/link";
import { feedCategoryForType } from "@/lib/client/feed-categories";
import { formatCaseDate } from "@/lib/client/format";
import type { PostPublic } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { TypeBadge } from "@/components/TypeBadge";
import { VoteControl } from "@/components/VoteControl";

function excerpt(body: string, max = 140): string {
  const clean = body.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

export function ReportCard({
  post,
  zoneName,
  index = 0,
  highlight = false,
}: {
  post: PostPublic;
  zoneName?: string;
  index?: number;
  highlight?: boolean;
}) {
  const cat = feedCategoryForType(post.type);
  const stagger = Math.min(index, 5) * 50;

  return (
    <li
      className={`report-card${highlight ? " is-entering" : ""}`}
      style={{ animationDelay: `${stagger}ms` }}
      data-cat={cat}
    >
      <div className="report-card__body">
        <Link className="report-card__title" href={`/caso/${post.id}`}>
          {post.title}
        </Link>
        <div className="report-card__tags">
          <TypeBadge type={post.type} />
          {zoneName ? (
            <span className="badge badge-district">{zoneName}</span>
          ) : null}
        </div>
        <p className="report-card__excerpt">{excerpt(post.body)}</p>
        <div className="report-card__meta">
          <StatusBadge status={post.status} />
          <time dateTime={post.created_at}>
            {formatCaseDate(post.created_at)}
          </time>
        </div>
      </div>
      {/* Voto: columna izquierda en escritorio, barra inferior en móvil (CSS order) */}
      <div className="report-card__vote">
        <VoteControl postId={post.id} initialCount={post.vote_count ?? 0} />
      </div>
    </li>
  );
}
