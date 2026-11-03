/**
 * Tipos compartidos Cuadra — fuente única.
 * Agentes A, B y C importan desde aquí; no redefinir.
 * Alineado con docs/contracts.md
 */

// —— Enums / uniones ——

export type PostStatus =
  | "reportado"
  | "en_verificacion"
  | "corroborado"
  | "derivado"
  | "resuelto"
  | "sin_respuesta";

export type IncidentType =
  | "robo"
  | "acoso"
  | "vandalismo"
  | "consumo_via_publica"
  | "convivencia_nocturna";

export type UserRole = "ciudadano" | "moderador" | "autoridad" | "admin";

export type PublishGate =
  | "pending_evidence"
  | "pending_corroboration"
  | "published";

export type ModAction =
  | "hide"
  | "restore"
  | "escalate"
  | "reject_gate"
  | "approve_gate";

export type ModerationTargetType = "post" | "comment" | "user";

// —— Filas de dominio ——

export interface Zone {
  id: string;
  slug: string;
  name: string;
  bbox: Record<string, unknown> | null;
  created_at: string;
}

export interface Profile {
  id: string;
  pseudonym: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/** Perfil seguro para respuestas públicas /api/me */
export type ProfilePublic = Pick<
  Profile,
  "id" | "pseudonym" | "role" | "created_at"
>;

export interface Post {
  id: string;
  author_id: string | null;
  zone_id: string;
  type: IncidentType;
  status: PostStatus;
  title: string;
  body: string;
  grid_lat: number;
  grid_lng: number;
  is_establishment: boolean;
  publish_gate: PublishGate;
  created_at: string;
  updated_at: string;
}

/**
 * Post en API pública: sin coords exactas, sin author_id ni pseudónimo.
 * Nunca incluir lat/lng exactos ni nombres propios (regla de privacidad / anonimato).
 */
export type PostPublic = Omit<Post, "author_id"> & {
  vote_count?: number;
};

export interface ReportPrivate {
  post_id: string;
  lat: number;
  lng: number;
  evidence_path: string | null;
  raw_notes: string | null;
  created_at: string;
}

export interface Vote {
  id: string;
  post_id: string;
  user_id: string;
  value: 1;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  deleted_at: string | null;
}

/** Comentario público: sin author_id ni pseudónimo (etiqueta genérica en UI). */
export type CommentPublic = Omit<Comment, "deleted_at" | "author_id">;

export interface OfficialResponse {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  status_after: PostStatus;
  created_at: string;
}

/** Respuesta oficial pública: sin author_id; la UI muestra rol genérico. */
export type OfficialResponsePublic = Omit<OfficialResponse, "author_id">;

export interface FollowUpCode {
  id: string;
  post_id: string;
  code_hash: string;
  expires_at: string;
  created_at: string;
}

export interface ModerationAction {
  id: string;
  post_id: string | null;
  target_type: ModerationTargetType;
  target_id: string;
  actor_id: string;
  action: ModAction;
  reason: string;
  created_at: string;
}

// —— Errores de API ——

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "PII_NOT_ALLOWED"
  | "ESTABLISHMENT_GATE"
  | "RATE_LIMITED"
  | "INTERNAL";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode | string;
    message: string;
  };
}

// —— Payloads de request / response (contrato §3) ——

export interface CreatePostInput {
  zone_id: string;
  type: IncidentType;
  title: string;
  body: string;
  lat: number;
  lng: number;
  is_establishment: boolean;
  /** Path ya subido o manejado por multipart en el route handler */
  evidence_path?: string | null;
}

export interface CreatePostResponse {
  post: PostPublic;
  follow_up_code: string;
}

export interface ListPostsQuery {
  zone_id?: string;
  type?: IncidentType;
  status?: PostStatus;
  cursor?: string;
  limit?: number;
}

export interface ListPostsResponse {
  posts: PostPublic[];
  next_cursor: string | null;
}

export interface CreateVoteInput {
  value: 1;
}

export interface CreateVoteResponse {
  vote: Vote;
  post: PostPublic;
}

export interface CreateCommentInput {
  body: string;
}

export interface CreateCommentResponse {
  comment: CommentPublic;
}

export interface CreateOfficialResponseInput {
  body: string;
  status_after: PostStatus;
}

export interface CreateOfficialResponseResult {
  response: OfficialResponsePublic;
  post: PostPublic;
}

export interface FollowUpLookupInput {
  code: string;
}

export interface FollowUpLookupResponse {
  post: PostPublic;
}

export interface CreateModerationActionInput {
  target_type: ModerationTargetType;
  target_id: string;
  action: ModAction;
  reason: string;
  post_id?: string;
}

export interface CreateModerationActionResponse {
  action: ModerationAction;
}

export interface PatchMeInput {
  pseudonym?: string;
}

export interface MeResponse {
  profile: ProfilePublic;
}

export interface ZonesResponse {
  zones: Zone[];
}
