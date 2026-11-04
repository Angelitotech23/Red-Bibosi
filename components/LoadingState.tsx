import { FeedSkeleton } from "@/components/FeedSkeleton";

export function LoadingState({
  label = "Cargando…",
  variant = "panel",
}: {
  label?: string;
  variant?: "panel" | "skeleton";
}) {
  if (variant === "skeleton") {
    return <FeedSkeleton />;
  }

  return (
    <div className="state-panel" role="status" aria-live="polite">
      {label}
    </div>
  );
}
