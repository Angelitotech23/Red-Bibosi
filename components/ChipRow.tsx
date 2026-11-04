"use client";

export type ChipOption<T extends string> = {
  value: T;
  label: string;
  tone?: string;
};

export function ChipRow<T extends string>({
  label,
  options,
  value,
  onChange,
  allLabel = "Todas",
}: {
  label: string;
  options: ChipOption<T>[];
  value: T | "";
  onChange: (next: T | "") => void;
  allLabel?: string;
}) {
  return (
    <div className="chip-block">
      <p className="chip-block__label" id={`${label}-chips`}>
        {label}
      </p>
      <div
        className="chip-row"
        role="group"
        aria-labelledby={`${label}-chips`}
      >
        <button
          type="button"
          className="chip"
          aria-pressed={value === ""}
          onClick={() => onChange("")}
        >
          {allLabel}
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="chip"
            data-tone={option.tone}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.tone ? (
              <span className="chip__dot" aria-hidden="true" />
            ) : null}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
