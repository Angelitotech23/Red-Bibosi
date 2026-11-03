import type { IncidentType, PostStatus } from "@/lib/types";

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  robo: "Robo",
  acoso: "Acoso",
  vandalismo: "Vandalismo",
  consumo_via_publica: "Consumo en vía pública",
  convivencia_nocturna: "Convivencia nocturna",
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  reportado: "Reportado",
  en_verificacion: "En verificación",
  corroborado: "Corroborado",
  derivado: "Derivado",
  resuelto: "Resuelto",
  sin_respuesta: "Sin respuesta",
};

export const INCIDENT_TYPES = Object.keys(
  INCIDENT_TYPE_LABELS,
) as IncidentType[];

export const POST_STATUSES = Object.keys(POST_STATUS_LABELS) as PostStatus[];
