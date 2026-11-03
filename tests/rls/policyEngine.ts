/**
 * Motor mínimo que refleja las políticas RLS de supabase/migrations.
 * Usado en CI sin Postgres: valida las reglas del contrato Agente A.
 * No sustituye una corrida real contra Supabase; ver rls_live.sql.
 */

export type Role = "anon" | "ciudadano" | "moderador" | "autoridad" | "admin";

export type PostStatus =
  | "reportado"
  | "en_verificacion"
  | "corroborado"
  | "derivado"
  | "resuelto"
  | "sin_respuesta";

export type PublishGate =
  | "pending_evidence"
  | "pending_corroboration"
  | "published";

export interface Actor {
  role: Role;
  userId?: string;
}

export interface PostRow {
  id: string;
  author_id: string | null;
  status: PostStatus;
  publish_gate: PublishGate;
}

export interface VoteRow {
  post_id: string;
  user_id: string;
}

function isModerator(actor: Actor): boolean {
  return actor.role === "moderador" || actor.role === "admin";
}

function isStaff(actor: Actor): boolean {
  return isModerator(actor) || actor.role === "autoridad";
}

/** SELECT reports_private — debe fallar para todos los roles cliente */
export function canSelectReportsPrivate(_actor: Actor): boolean {
  return false;
}

/** UPDATE posts de otro usuario */
export function canUpdatePost(actor: Actor, post: PostRow): boolean {
  if (actor.role === "anon" || !actor.userId) return false;
  if (isModerator(actor)) return true;
  return post.author_id === actor.userId;
}

/**
 * SELECT posts — feed público si publish_gate=published (cualquier status de ciclo).
 * Pendientes de gate no son visibles para anon.
 */
export function canSelectPost(actor: Actor, post: PostRow): boolean {
  const publicOk = post.publish_gate === "published";

  if (publicOk) return true;
  if (actor.role === "anon" || !actor.userId) return false;
  if (isModerator(actor) || isStaff(actor)) return true;
  return post.author_id === actor.userId;
}

/** INSERT vote duplicado — unique (post_id, user_id) */
export function canInsertVote(
  actor: Actor,
  vote: VoteRow,
  existing: VoteRow[],
): { ok: boolean; reason?: string } {
  if (actor.role === "anon" || !actor.userId) {
    return { ok: false, reason: "UNAUTHORIZED" };
  }
  if (vote.user_id !== actor.userId) {
    return { ok: false, reason: "FORBIDDEN" };
  }
  const dup = existing.some(
    (v) => v.post_id === vote.post_id && v.user_id === vote.user_id,
  );
  if (dup) return { ok: false, reason: "UNIQUE_VIOLATION" };
  return { ok: true };
}

/** Redondeo de grilla (espejo de round_grid SQL, 4 decimales) */
export function roundGrid(
  lat: number,
  lng: number,
): { grid_lat: number; grid_lng: number } {
  const r = (n: number) => Math.round(n * 1e4) / 1e4;
  return { grid_lat: r(lat), grid_lng: r(lng) };
}
