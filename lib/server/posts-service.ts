import type {
  CreatePostResponse,
  CreateVoteResponse,
  IncidentType,
  PostPublic,
} from "@/lib/types";
import {
  isSupabaseConfigured,
  getSupabaseAdmin,
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
} from "@/lib/server/mocks/store";
import type { CreatePostParsed } from "@/lib/validation/posts";
import { buildMapCells, type MapCellPublic } from "@/lib/server/grid";

export async function createPost(
  authorId: string,
  data: CreatePostParsed,
  evidencePath: string | null,
  accessToken: string | null,
): Promise<CreatePostResponse | { error: "ZONE_NOT_FOUND" | "INTERNAL" }> {
  if (!isSupabaseConfigured() || !accessToken) {
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
    const userClient = getSupabaseForUser(accessToken);
    const admin = getSupabaseAdmin();

    const { data: zone, error: zoneErr } = await admin
      .from("zones")
      .select("id")
      .eq("id", data.zone_id)
      .maybeSingle();
    if (zoneErr || !zone) return { error: "ZONE_NOT_FOUND" };

    // RPC del Agente A: grilla + posts + reports_private + gate
    const { data: post, error: postErr } = await userClient.rpc(
      "create_post_with_private",
      {
        p_zone_id: data.zone_id,
        p_type: data.type,
        p_title: data.title,
        p_body: data.body,
        p_lat: data.lat,
        p_lng: data.lng,
        p_is_establishment: data.is_establishment,
        p_evidence_path: evidencePath,
        p_raw_notes: null,
      },
    );

    if (postErr || !post) return { error: "INTERNAL" };

    const code = generateFollowUpCode();
    const { error: codeErr } = await admin.from("follow_up_codes").insert({
      post_id: post.id,
      code_hash: hashFollowUpCode(code),
      expires_at: followUpExpiresAt(),
    });
    if (codeErr) return { error: "INTERNAL" };

    const publicPost: PostPublic = {
      ...(post as PostPublic),
      vote_count: 0,
    };
    return { post: publicPost, follow_up_code: code };
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
    const admin = getSupabaseAdmin();

    const { data: post, error: postErr } = await admin
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();
    if (postErr || !post) return { error: "NOT_FOUND" };

    const { data: vote, error: voteErr } = await userClient
      .from("votes")
      .insert({ post_id: postId, user_id: userId, value: 1 })
      .select("*")
      .single();

    if (voteErr) {
      if (voteErr.code === "23505") return { error: "CONFLICT" };
      return { error: "INTERNAL" };
    }

    // El trigger on_vote_inserted del Agente A actualiza status
    const { data: refreshed } = await admin
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    const { data: countData } = await admin.rpc("vote_count", {
      p_post_id: postId,
    });

    return {
      vote: vote as CreateVoteResponse["vote"],
      post: {
        ...((refreshed ?? post) as PostPublic),
        vote_count: (countData as number) ?? 1,
      },
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
    if (!canIssueFollowUpCode(post.status)) {
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

  // TODO(contrato): reemplazar al integrar — pedir a A RPC map_cells_k_anonymous(k)
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("posts")
      .select("grid_lat, grid_lng, type")
      .eq("publish_gate", "published");
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

export async function getPostOrNull(id: string): Promise<PostPublic | null> {
  if (!isSupabaseConfigured()) {
    return mockGetPostPublic(id);
  }
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as PostPublic) ?? null;
  } catch {
    return null;
  }
}

export { mockGetPost };
