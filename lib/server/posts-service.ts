import type {
  CreatePostResponse,
  CreateVoteResponse,
  IncidentType,
  PostPublic,
} from "@/lib/types";
import { isSupabaseConfigured, getSupabaseAdmin } from "@/lib/server/supabase";
import { toGridCell } from "@/lib/server/grid";
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

  // TODO(contrato): reemplazar al integrar — path real cuando A publique migraciones
  try {
    const admin = getSupabaseAdmin();
    const { grid_lat, grid_lng } = toGridCell(data.lat, data.lng);

    const { data: zone, error: zoneErr } = await admin
      .from("zones")
      .select("id")
      .eq("id", data.zone_id)
      .maybeSingle();
    if (zoneErr || !zone) return { error: "ZONE_NOT_FOUND" };

    let publish_gate: "published" | "pending_evidence" = "published";
    if (data.is_establishment && !evidencePath) {
      publish_gate = "pending_evidence";
    }

    const { data: post, error: postErr } = await admin
      .from("posts")
      .insert({
        author_id: authorId,
        zone_id: data.zone_id,
        type: data.type,
        title: data.title,
        body: data.body,
        grid_lat,
        grid_lng,
        is_establishment: data.is_establishment,
        publish_gate,
        status: "reportado",
      })
      .select("*")
      .single();

    if (postErr || !post) return { error: "INTERNAL" };

    const { error: privErr } = await admin.from("reports_private").insert({
      post_id: post.id,
      lat: data.lat,
      lng: data.lng,
      evidence_path: evidencePath,
    });
    if (privErr) return { error: "INTERNAL" };

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
    // Nunca devolver lat/lng exactos
    return { post: publicPost, follow_up_code: code };
  } catch {
    return { error: "INTERNAL" };
  }
}

export async function castVote(
  postId: string,
  userId: string,
): Promise<
  CreateVoteResponse | { error: "NOT_FOUND" | "CONFLICT" | "INTERNAL" }
> {
  if (!isSupabaseConfigured()) {
    return mockCreateVote(postId, userId);
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: post, error: postErr } = await admin
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();
    if (postErr || !post) return { error: "NOT_FOUND" };

    const { data: vote, error: voteErr } = await admin
      .from("votes")
      .insert({ post_id: postId, user_id: userId, value: 1 })
      .select("*")
      .single();

    if (voteErr) {
      if (voteErr.code === "23505") return { error: "CONFLICT" };
      return { error: "INTERNAL" };
    }

    const { count } = await admin
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    let status = post.status as string;
    if ((count ?? 0) >= 3 && status === "reportado") {
      status = "corroborado";
      await admin
        .from("posts")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", postId);
    } else if (status === "reportado") {
      status = "en_verificacion";
      await admin
        .from("posts")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", postId);
    }

    return {
      vote: vote as CreateVoteResponse["vote"],
      post: {
        ...(post as PostPublic),
        status: status as PostPublic["status"],
        vote_count: count ?? 1,
      },
    };
  } catch {
    return { error: "INTERNAL" };
  }
}

export async function issueFollowUpCode(
  postId: string,
): Promise<
  { follow_up_code: string } | { error: "NOT_FOUND" | "FORBIDDEN_STATUS" | "INTERNAL" }
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

  // TODO(contrato): reemplazar al integrar — idealmente RPC SQL agregada
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

export function zoneExistsSync(zoneId: string): boolean {
  if (!isSupabaseConfigured()) {
    return mockGetZoneById(zoneId) !== null;
  }
  // path async cubierto en createPost
  return true;
}

export { mockGetPost };
