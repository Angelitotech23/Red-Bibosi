import { getApiMode } from "@/lib/client/config";
import {
  MockApiError,
  mockCreateComment,
  mockCreatePost,
  mockCreateVote,
  mockFollowUpLookup,
  mockGetComments,
  mockGetMapCells,
  mockGetOfficialResponse,
  mockGetPost,
  mockGetZones,
  mockListEstablishments,
  mockListPosts,
  type EstablishmentPublic,
  type MapCellPublic,
} from "@/lib/client/mocks";
import type {
  ApiErrorBody,
  CommentPublic,
  CreatePostResponse,
  FollowUpLookupResponse,
  IncidentType,
  ListPostsResponse,
  OfficialResponsePublic,
  PostPublic,
  PostStatus,
  Vote,
  ZonesResponse,
} from "@/lib/types";

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

async function parseError(res: Response): Promise<ApiClientError> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    return new ApiClientError(
      body.error?.code ?? "INTERNAL",
      body.error?.message ?? "Error del servidor",
      res.status,
    );
  } catch {
    return new ApiClientError("INTERNAL", "Error del servidor", res.status);
  }
}

/**
 * Usuario mock del store de Agente B (sin Supabase).
 * Solo si el servidor permite ALLOW_MOCK_AUTH (nunca en producción).
 */
const DEV_MOCK_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function mockAuthHeaders(): Record<string, string> {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH === "true"
  ) {
    return { "X-Mock-User-Id": DEV_MOCK_USER_ID };
  }
  return {};
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...mockAuthHeaders(),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw await parseError(res);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

function rethrowMock(err: unknown): never {
  if (err instanceof MockApiError) {
    throw new ApiClientError(err.code, err.message, err.status);
  }
  throw err;
}

async function runMock<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    rethrowMock(e);
  }
}

/**
 * En `live`, intenta la API real; si el endpoint aún no existe (404),
 * usa mock para no romper pantallas mientras B completa el contrato.
 */
async function liveWithMockFallback<T>(
  live: () => Promise<T>,
  mock: () => Promise<T>,
  isEmpty?: (value: T) => boolean,
): Promise<T> {
  if (getApiMode() === "mock") {
    return runMock(mock);
  }
  try {
    const value = await live();
    if (isEmpty?.(value)) {
      return runMock(mock);
    }
    return value;
  } catch {
    return runMock(mock);
  }
}

export async function fetchZones(): Promise<ZonesResponse> {
  return liveWithMockFallback(
    () => apiFetch<ZonesResponse>("/api/zones"),
    mockGetZones,
    (res) => res.zones.length === 0,
  );
}

export async function fetchPosts(params: {
  zone_id?: string;
  type?: IncidentType | "";
  status?: PostStatus | "";
  cursor?: string;
  limit?: number;
}): Promise<ListPostsResponse> {
  const query = new URLSearchParams();
  if (params.zone_id) query.set("zone_id", params.zone_id);
  if (params.type) query.set("type", params.type);
  if (params.status) query.set("status", params.status);
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  return liveWithMockFallback(
    () => apiFetch<ListPostsResponse>(`/api/posts${qs ? `?${qs}` : ""}`),
    () =>
      mockListPosts({
        zone_id: params.zone_id,
        type: params.type || undefined,
        status: params.status || undefined,
        cursor: params.cursor,
        limit: params.limit,
      }),
    (res) => res.posts.length === 0,
  );
}

export async function fetchPost(id: string): Promise<{ post: PostPublic }> {
  return liveWithMockFallback(
    () => apiFetch<{ post: PostPublic }>(`/api/posts/${id}`),
    () => mockGetPost(id),
  );
}

export async function fetchComments(
  postId: string,
): Promise<{ comments: CommentPublic[] }> {
  return liveWithMockFallback(
    () =>
      apiFetch<{ comments: CommentPublic[] }>(
        `/api/posts/${postId}/comments`,
      ),
    () => mockGetComments(postId),
  );
}

/**
 * Respuesta oficial del caso.
 * Contrato: no hay GET dedicado (Solicitud S-01).
 */
export async function fetchOfficialResponse(
  postId: string,
): Promise<{ response: OfficialResponsePublic | null }> {
  if (getApiMode() === "mock") {
    return runMock(() => mockGetOfficialResponse(postId));
  }
  try {
    const { post } = await apiFetch<{
      post: PostPublic & { official_response?: OfficialResponsePublic | null };
    }>(`/api/posts/${postId}`);
    return { response: post.official_response ?? null };
  } catch (e) {
    if (e instanceof ApiClientError && e.status === 404) {
      return runMock(() => mockGetOfficialResponse(postId));
    }
    return { response: null };
  }
}

export async function createVote(
  postId: string,
): Promise<{ vote: Vote; post: PostPublic }> {
  return liveWithMockFallback(
    () =>
      apiFetch<{ vote: Vote; post: PostPublic }>(
        `/api/posts/${postId}/votes`,
        {
          method: "POST",
          body: JSON.stringify({ value: 1 }),
        },
      ),
    () => mockCreateVote(postId),
  );
}

export async function createComment(
  postId: string,
  body: string,
): Promise<{ comment: CommentPublic }> {
  return liveWithMockFallback(
    () =>
      apiFetch<{ comment: CommentPublic }>(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
    () => mockCreateComment(postId, body),
  );
}

export async function createPost(input: {
  zone_id: string;
  type: IncidentType;
  title: string;
  body: string;
  lat: number;
  lng: number;
  is_establishment: boolean;
  establishment_id?: string | null;
  evidence?: File | null;
}): Promise<CreatePostResponse> {
  return liveWithMockFallback(
    async () => {
      const form = new FormData();
      form.set("zone_id", input.zone_id);
      form.set("type", input.type);
      form.set("title", input.title);
      form.set("body", input.body);
      form.set("lat", String(input.lat));
      form.set("lng", String(input.lng));
      form.set("is_establishment", String(input.is_establishment));
      if (input.establishment_id) {
        form.set("establishment_id", input.establishment_id);
      }
      if (input.evidence) {
        form.set("evidence", input.evidence);
      }
      return apiFetch<CreatePostResponse>("/api/posts", {
        method: "POST",
        body: form,
      });
    },
    () => mockCreatePost(input),
  );
}

export async function lookupFollowUp(
  code: string,
): Promise<FollowUpLookupResponse> {
  return liveWithMockFallback(
    () =>
      apiFetch<FollowUpLookupResponse>("/api/follow-up/lookup", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    () => mockFollowUpLookup(code),
  );
}

/** Registro de establecimientos — endpoint pendiente (Solicitud S-02). */
export async function fetchEstablishments(
  zoneId?: string,
): Promise<{ establishments: EstablishmentPublic[] }> {
  const qs = zoneId ? `?zone_id=${encodeURIComponent(zoneId)}` : "";
  return liveWithMockFallback(
    () =>
      apiFetch<{ establishments: EstablishmentPublic[] }>(
        `/api/establishments${qs}`,
      ),
    () => mockListEstablishments(zoneId),
  );
}

/** GET /api/map — disponible (Agente B). */
export async function fetchMapCells(): Promise<{ cells: MapCellPublic[] }> {
  return liveWithMockFallback(
    () =>
      apiFetch<{ cells: MapCellPublic[]; k_threshold?: number }>("/api/map"),
    mockGetMapCells,
    (res) => res.cells.length === 0,
  );
}

export type { EstablishmentPublic, MapCellPublic };
