export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      {label}
    </div>
  );
}
