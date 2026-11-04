export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-panel" role="alert">
      <p className="error-panel__kicker">No se pudo completar</p>
      <p className="error-panel__text">{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
