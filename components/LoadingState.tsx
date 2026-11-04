export function LoadingState({
  label = "Cargando…",
  variant = "panel",
}: {
  label?: string;
  variant?: "panel" | "feed";
}) {
  if (variant === "feed") {
    return (
      <div className="feed-skeleton" role="status" aria-live="polite">
        <span className="sr-only">{label}</span>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="report-card is-skeleton" aria-hidden="true">
            <div className="skel skel-vote" />
            <div className="report-card__body">
              <div className="skel skel-title" />
              <div className="skel skel-chips" />
              <div className="skel skel-excerpt" />
              <div className="skel skel-meta" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="state-panel" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="skel skel-title" aria-hidden="true" />
      <div className="skel skel-excerpt" aria-hidden="true" />
    </div>
  );
}
