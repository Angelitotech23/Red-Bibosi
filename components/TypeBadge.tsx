import { feedCategoryForType } from "@/lib/client/feed-categories";
import { INCIDENT_TYPE_LABELS } from "@/lib/client/labels";
import type { IncidentType } from "@/lib/types";

export function TypeBadge({ type }: { type: IncidentType }) {
  const cat = feedCategoryForType(type);
  return (
    <span className="badge badge-type" data-cat={cat}>
      {INCIDENT_TYPE_LABELS[type]}
    </span>
  );
}
