import Link from "next/link";

export function EmptyState({
  title,
  message,
  actionHref,
  actionLabel,
  onClear,
  clearLabel = "Quitar filtros",
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  onClear?: () => void;
  clearLabel?: string;
}) {
  return (
    <div className="empty-panel" role="status">
      <p className="empty-panel__kicker">Nada por aquí</p>
      <h2 className="empty-panel__title">{title}</h2>
      <p className="empty-panel__text">{message}</p>
      <div className="empty-panel__actions">
        {onClear ? (
          <button type="button" className="btn btn-secondary" onClick={onClear}>
            {clearLabel}
          </button>
        ) : null}
        {actionHref && actionLabel ? (
          <Link className="btn btn-accent" href={actionHref}>
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
