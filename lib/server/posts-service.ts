import type {
  CreatePostResponse,
  CreateVoteResponse,
  IncidentType,
  ListPostsQuery,
  ListPostsResponse,
  PostPublic,
  PostStatus,
} from "@/lib/types";
import {
  isSupabaseConfigured,
  getSupabaseAdmin,
  getSupabaseAnon,
  getSupabaseForUser,
} from "@/lib/server/supabase";
import {
  generateFollowUpCode,
  hashFollowUpCode,
  followUpExpiresAt,
  canIssueFollowUpCode,
} from "@/lib/server/follow-up";
import {
  mockCreatePost,
  mockCreateVote,
  mockGetPost,
  mockGetPostPublic,
  mockGetZoneById,
  mockIssueFollowUp,
  mockListMapReports,
  mockListPostsPublic,
} from "@/lib/server/mocks/store";
import type { CreatePostParsed } from "@/lib/validation/posts";
import { buildMapCells, type MapCellPublic } from "@/lib/server/grid";
import { isPubliclyListed, toPostPublic } from "@/lib/server/public-post";

const PUBLIC_SELECT =
  "id, zone_id, type, status, title, body, grid_lat, grid_lng, is_establishment, publish_gate, created_at, updated_at, vote_count";

export async function listPostsPublic(
  query: ListPostsQuery,
): Promise<ListPostsResponse> {
  const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);

  if (!isSupabaseConfigured()) {
    return mockListPostsPublic(query, limit);
  }

  try {
    const client = getSupabaseAnon();
    let q = client
      .from("posts_public")
      .select(PUBLIC_SELECT)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (query.zone_id) q = q.eq("zone_id", query.zone_id);
    if (query.type) q = q.eq("type", query.type);
    if (query.status) q = q.eq("status", query.status);
    if (query.cursor) q = q.lt("created_at", query.cursor);

    const { data, error } = await q;
    if (error || !data) return { posts: [], next_cursor: null };

    const page = data.slice(0, limit);
    const posts = page.map((row) => toPostPublic(row as Parameters<typeof toPostPublic>[0]));
    const next =
      data.length > limit
        ? String(page[page.length - 1]?.created_at ?? null)
        : null;
    return { posts, next_cursor: next };
  } catch {
    return { posts: [], next_cursor: null };
  }
}

export async function getPostPublicOrNull(
  id: string,
): Promise<PostPublic | null> {
  if (!isSupabaseConfigured()) {
    return mockGetPostPublic(id);
  }
  try {
    const client = getSupabaseAnon();
    const { data, error } = await client
      .from("posts_public")
      .select(PUBLIC_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return toPostPublic(data as Parameters<typeof toPostPublic>[0]);
  } catch {
    return null;
  }
}

export async function listZones() {
  if (!isSupabaseConfigured()) {
    const { mockListZones } = await import("@/lib/server/mocks/store");
    return mockListZones();
  }
  try {
    const client = getSupabaseAnon();
    const { data, error } = await client
      .from("zones")
      .select("id, slug, name, bbox, created_at")
      .order("name", { ascending: true });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function createPost(
  authorId: string | null,
  data: CreatePostParsed,
  evidencePath: string | null,
  accessToken: string | null,
): Promise<CreatePostResponse | { error: "ZONE_NOT_FOUND" | "INTERNAL" }> {
  if (!isSupabaseConfigured()) {
    const zone = mockGetZoneById(data.zone_id);
    if (!zone) return { error: "ZONE_NOT_FOUND" };
    return mockCreatePost({
      author_id: authorId,
      zone_id: data.zone_id,
      type: data.type,
      title: data.title,
      body: data.body,
      lat: data.lat,
      lng: data.lng,
      is_establishment: data.is_establishment,
      evidence_path: evidencePath,
    });
  }

  try {
    const admin = getSupabaseAdmin();

    const { data: zone, error: zoneErr } = await admin
      .from("zones")
      .select("id")
      .eq("id", data.zone_id)
      .maybeSingle();
    if (zoneErr || !zone) return { error: "ZONE_NOT_FOUND" };

    const rpcArgs = {
      p_zone_id: data.zone_id,
      p_type: data.type,
      p_title: data.title,
      p_body: data.body,
      p_lat: data.lat,
      p_lng: data.lng,
      p_is_establishment: data.is_establishment,
      p_evidence_path: evidencePath,
      p_raw_notes: null as string | null,
    };

    let post: Record<string, unknown> | null = null;

    if (accessToken && authorId) {
      const userClient = getSupabaseForUser(accessToken);
      const { data: created, error: postErr } = await userClient.rpc(
        "create_post_with_private",
        rpcArgs,
      );
      if (postErr || !created) return { error: "INTERNAL" };
      post = created as Record<string, unknown>;
    } else {
      const { data: created, error: postErr } = await admin.rpc(
        "create_post_anonymous",
        rpcArgs,
      );
      if (postErr || !created) return { error: "INTERNAL" };
      post = created as Record<string, unknown>;
    }

    const code = generateFollowUpCode();
    const { error: codeErr } = await admin.from("follow_up_codes").insert({
      post_id: post.id,
      code_hash: hashFollowUpCode(code),
      expires_at: followUpExpiresAt(),
    });
    if (codeErr) return { error: "INTERNAL" };

    return {
      post: toPostPublic({
        ...(post as Parameters<typeof toPostPublic>[0]),
        vote_count: 0,
      }),
      follow_up_code: code,
    };
  } catch {
    return { error: "INTERNAL" };
  }
}

export async function castVote(
  postId: string,
  userId: string,
  accessToken: string | null,
): Promise<
  CreateVoteResponse | { error: "NOT_FOUND" | "CONFLICT" | "INTERNAL" }
> {
  if (!isSupabaseConfigured() || !accessToken) {
    return mockCreateVote(postId, userId);
  }

  try {
    const userClient = getSupabaseForUser(accessToken);

    const existing = await getPostPublicOrNull(postId);
    if (!existing) return { error: "NOT_FOUND" };

    const { data: vote, error: voteErr } = await userClient
      .from("votes")
      .insert({ post_id: postId, user_id: userId, value: 1 })
      .select("*")
      .single();

    if (voteErr) {
      if (voteErr.code === "23505") return { error: "CONFLICT" };
      return { error: "INTERNAL" };
    }

    const refreshed = await getPostPublicOrNull(postId);

    return {
      vote: vote as CreateVoteResponse["vote"],
      post: refreshed ?? existing,
    };
  } catch {
    return { error: "INTERNAL" };
  }
}

export async function issueFollowUpCode(
  postId: string,
): Promise<
  | { follow_up_code: string }
  | { error: "NOT_FOUND" | "FORBIDDEN_STATUS" | "INTERNAL" }
> {
  if (!isSupabaseConfigured()) {
    const result = mockIssueFollowUp(postId);
    if ("error" in result) return result;
    return { follow_up_code: result.code };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: post, error } = await admin
      .from("posts")
      .select("id, status")
      .eq("id", postId)
      .maybeSingle();
    if (error || !post) return { error: "NOT_FOUND" };
    if (!canIssueFollowUpCode(post.status as PostStatus)) {
      return { error: "FORBIDDEN_STATUS" };
    }

    const code = generateFollowUpCode();
    const { error: insertErr } = await admin.from("follow_up_codes").insert({
      post_id: postId,
      code_hash: hashFollowUpCode(code),
      expires_at: followUpExpiresAt(),
    });
    if (insertErr) return { error: "INTERNAL" };
    return { follow_up_code: code };
  } catch {
    return { error: "INTERNAL" };
  }
}

export async function getMapCells(): Promise<MapCellPublic[]> {
  if (!isSupabaseConfigured()) {
    return buildMapCells(mockListMapReports());
  }

  try {
    const client = getSupabaseAnon();
    const { data, error } = await client
      .from("posts_public")
      .select("grid_lat, grid_lng, type");
    if (error || !data) return [];
    return buildMapCells(
      data.map((r) => ({
        grid_lat: Number(r.grid_lat),
        grid_lng: Number(r.grid_lng),
        type: r.type as IncidentType,
      })),
    );
  } catch {
    return [];
  }
}

/** @deprecated prefer getPostPublicOrNull */
export async function getPostOrNull(id: string): Promise<PostPublic | null> {
  return getPostPublicOrNull(id);
}

export { mockGetPost, isPubliclyListed };
