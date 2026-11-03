import { POST_STATUS_LABELS } from "@/lib/client/labels";
import type { PostStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className="badge badge-status" data-status={status}>
      {POST_STATUS_LABELS[status]}
    </span>
  );
}
