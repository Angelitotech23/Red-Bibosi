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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
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

export async function fetchZones(): Promise<ZonesResponse> {
  if (getApiMode() === "mock") {
    try {
      return await mockGetZones();
    } catch (e) {
      rethrowMock(e);
    }
  }
  return apiFetch<ZonesResponse>("/api/zones");
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

  if (getApiMode() === "mock") {
    try {
      return await mockListPosts({
        zone_id: params.zone_id,
        type: params.type || undefined,
        status: params.status || undefined,
        cursor: params.cursor,
        limit: params.limit,
      });
    } catch (e) {
      rethrowMock(e);
    }
  }
  const qs = query.toString();
  return apiFetch<ListPostsResponse>(`/api/posts${qs ? `?${qs}` : ""}`);
}

export async function fetchPost(id: string): Promise<{ post: PostPublic }> {
  if (getApiMode() === "mock") {
    try {
      return await mockGetPost(id);
    } catch (e) {
      rethrowMock(e);
    }
  }
  return apiFetch<{ post: PostPublic }>(`/api/posts/${id}`);
}

export async function fetchComments(
  postId: string,
): Promise<{ comments: CommentPublic[] }> {
  if (getApiMode() === "mock") {
    try {
      return await mockGetComments(postId);
    } catch (e) {
      rethrowMock(e);
    }
  }
  return apiFetch<{ comments: CommentPublic[] }>(
    `/api/posts/${postId}/comments`,
  );
}

/**
 * Respuesta oficial del caso.
 * Contrato actual: no hay GET dedicado; en live se intenta campo del post
 * y, si no existe, se deja null (Solicitud S-01).
 */
export async function fetchOfficialResponse(
  postId: string,
): Promise<{ response: OfficialResponsePublic | null }> {
  if (getApiMode() === "mock") {
    try {
      return await mockGetOfficialResponse(postId);
    } catch (e) {
      rethrowMock(e);
    }
  }
  try {
    const { post } = await apiFetch<{
      post: PostPublic & { official_response?: OfficialResponsePublic | null };
    }>(`/api/posts/${postId}`);
    return { response: post.official_response ?? null };
  } catch (e) {
    if (e instanceof ApiClientError && e.status === 404) throw e;
    return { response: null };
  }
}

export async function createVote(
  postId: string,
): Promise<{ vote: Vote; post: PostPublic }> {
  if (getApiMode() === "mock") {
    try {
      return await mockCreateVote(postId);
    } catch (e) {
      rethrowMock(e);
    }
  }
  return apiFetch<{ vote: Vote; post: PostPublic }>(
    `/api/posts/${postId}/votes`,
    {
      method: "POST",
      body: JSON.stringify({ value: 1 }),
    },
  );
}

export async function createComment(
  postId: string,
  body: string,
): Promise<{ comment: CommentPublic }> {
  if (getApiMode() === "mock") {
    try {
      return await mockCreateComment(postId, body);
    } catch (e) {
      rethrowMock(e);
    }
  }
  return apiFetch<{ comment: CommentPublic }>(
    `/api/posts/${postId}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
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
  /** Solo UI/mock hasta que el contrato acepte establishment_id */
  establishment_id?: string | null;
  evidence?: File | null;
}): Promise<CreatePostResponse> {
  if (getApiMode() === "mock") {
    try {
      return await mockCreatePost(input);
    } catch (e) {
      rethrowMock(e);
    }
  }
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
}

export async function lookupFollowUp(
  code: string,
): Promise<FollowUpLookupResponse> {
  if (getApiMode() === "mock") {
    try {
      return await mockFollowUpLookup(code);
    } catch (e) {
      rethrowMock(e);
    }
  }
  return apiFetch<FollowUpLookupResponse>("/api/follow-up/lookup", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

/** Endpoint pendiente de contrato (Solicitud S-02). */
export async function fetchEstablishments(
  zoneId?: string,
): Promise<{ establishments: EstablishmentPublic[] }> {
  if (getApiMode() === "mock") {
    try {
      return await mockListEstablishments(zoneId);
    } catch (e) {
      rethrowMock(e);
    }
  }
  const qs = zoneId ? `?zone_id=${encodeURIComponent(zoneId)}` : "";
  return apiFetch<{ establishments: EstablishmentPublic[] }>(
    `/api/establishments${qs}`,
  );
}

/** Endpoint pendiente de contrato (Solicitud S-03). */
export async function fetchMapCells(): Promise<{ cells: MapCellPublic[] }> {
  if (getApiMode() === "mock") {
    try {
      return await mockGetMapCells();
    } catch (e) {
      rethrowMock(e);
    }
  }
  return apiFetch<{ cells: MapCellPublic[] }>("/api/map/cells");
}

export type { EstablishmentPublic, MapCellPublic };
