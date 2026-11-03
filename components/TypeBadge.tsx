import { INCIDENT_TYPE_LABELS } from "@/lib/client/labels";
import type { IncidentType } from "@/lib/types";

export function TypeBadge({ type }: { type: IncidentType }) {
  return <span className="badge badge-type">{INCIDENT_TYPE_LABELS[type]}</span>;
}
