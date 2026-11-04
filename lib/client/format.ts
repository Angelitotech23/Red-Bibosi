/** Fecha relativa / corta en español boliviano neutro. */
export function formatCaseDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Meta de tarjeta: fecha breve para no competir con título ni extracto. */
export function formatCardDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-BO", {
    day: "numeric",
    month: "short",
  }).format(date);
}
