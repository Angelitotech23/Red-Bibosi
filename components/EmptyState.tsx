import Link from "next/link";

export function EmptyState({
  title = "Todavía no hay denuncias aquí",
  message = "Prueba otro filtro o sé el primero en publicar un caso de tu zona.",
  actionHref = "/publicar",
  actionLabel = "Nueva denuncia",
}: {
  title?: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty-panel" role="status">
      <h3>{title}</h3>
      <p>{message}</p>
      <Link className="btn btn-accent" href={actionHref}>
        {actionLabel}
      </Link>
    </div>
  );
}
