import type { Post, PostPublic } from "@/lib/types";

/**
 * Capa pública: nunca author_id ni pseudónimo (auditoría C1).
 */
export function toPostPublic(
  row: Partial<Post> &
    Pick<
      Post,
      | "id"
      | "zone_id"
      | "type"
      | "status"
      | "title"
      | "body"
      | "grid_lat"
      | "grid_lng"
      | "is_establishment"
      | "publish_gate"
      | "created_at"
      | "updated_at"
    > & { vote_count?: number | null },
): PostPublic {
  return {
    id: row.id,
    zone_id: row.zone_id,
    type: row.type,
    status: row.status,
    title: row.title,
    body: row.body,
    grid_lat: Number(row.grid_lat),
    grid_lng: Number(row.grid_lng),
    is_establishment: row.is_establishment,
    publish_gate: row.publish_gate,
    created_at: row.created_at,
    updated_at: row.updated_at,
    vote_count: row.vote_count ?? 0,
  };
}

const PUBLIC_STATUSES = new Set([
  "reportado",
  "en_verificacion",
  "corroborado",
  "derivado",
  "resuelto",
  "sin_respuesta",
]);

/** ¿Visible en feed/mapa público? */
export function isPubliclyListed(post: {
  publish_gate: string;
  status: string;
}): boolean {
  return (
    post.publish_gate === "published" && PUBLIC_STATUSES.has(post.status)
  );
}
