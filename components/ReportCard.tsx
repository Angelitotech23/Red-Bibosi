"use client";

import Link from "next/link";
import {
  FEED_CATEGORY_LABELS,
  FEED_CATEGORY_CHIP_LABELS,
  feedCategoryForType,
} from "@/lib/client/feed-categories";
import { excerpt } from "@/lib/client/excerpt";
import { formatCardDate } from "@/lib/client/format";
import type { PostPublic } from "@/lib/types";
import { VoteControl } from "@/components/VoteControl";

export function ReportCard({
  post,
  zoneName,
  zoneSlug,
  highlight = false,
  index = 0,
  onVoted,
}: {
  post: PostPublic;
  zoneName: string;
  zoneSlug?: string;
  highlight?: boolean;
  index?: number;
  onVoted?: (updated: PostPublic) => void;
}) {
  const category = feedCategoryForType(post.type);
  const delay = Math.min(index, 5) * 50;

  return (
    <article
      id={`denuncia-${post.id}`}
      className={`report-card${highlight ? " is-fresh" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <VoteControl
        postId={post.id}
        count={post.vote_count ?? 0}
        onVoted={onVoted}
      />
      <div className="report-card__body">
        <h3 className="report-card__title">
          <Link href={`/caso/${post.id}`}>{post.title}</Link>
        </h3>
        <p className="report-card__tags">
          <span className="tag" data-tone={category}>
            <span className="chip__dot" aria-hidden="true" />
            {FEED_CATEGORY_CHIP_LABELS[category]}
          </span>
          <span className="sr-only">{FEED_CATEGORY_LABELS[category]}</span>
          {zoneSlug ? (
            <Link className="tag tag-link" href={`/zona/${zoneSlug}`}>
              {zoneName}
            </Link>
          ) : (
            <span className="tag">{zoneName}</span>
          )}
        </p>
        <p className="report-card__excerpt">{excerpt(post.body)}</p>
        <p className="report-card__meta">
          <span>{formatCardDate(post.created_at)}</span>
        </p>
      </div>
    </article>
  );
}
