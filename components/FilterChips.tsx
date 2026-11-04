"use client";

import {
  FEED_CATEGORIES,
  FEED_CATEGORY_LABELS,
  type FeedCategory,
} from "@/lib/client/feed-categories";

type ChipOption = {
  id: string;
  label: string;
  cat?: FeedCategory;
};

export function FilterChips({
  label,
  options,
  value,
  onChange,
  allLabel = "Todos",
}: {
  label: string;
  options: ChipOption[];
  value: string;
  onChange: (next: string) => void;
  allLabel?: string;
}) {
  return (
    <div
      className="chip-row"
      role="toolbar"
      aria-label={label}
    >
      <span className="chip-row__label">{label}</span>
      <button
        type="button"
        className="chip"
        aria-pressed={value === ""}
        onClick={() => onChange("")}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`chip${opt.cat ? " chip--cat" : ""}`}
          data-cat={opt.cat}
          aria-pressed={value === opt.id}
          onClick={() => onChange(opt.id)}
        >
          {opt.cat ? <span className="chip__dot" aria-hidden="true" /> : null}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function categoryChipOptions(): ChipOption[] {
  return FEED_CATEGORIES.map((id) => ({
    id,
    label: FEED_CATEGORY_LABELS[id],
    cat: id,
  }));
}
