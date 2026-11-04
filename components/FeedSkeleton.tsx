export function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="feed-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando denuncias…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i} aria-hidden="true">
          <div className="skeleton-block skeleton-vote" />
          <div>
            <div className="skeleton-block skeleton-line skeleton-line--title" />
            <div className="skeleton-block skeleton-line skeleton-line--meta" />
            <div className="skeleton-block skeleton-line skeleton-line--body" />
          </div>
        </div>
      ))}
    </div>
  );
}
