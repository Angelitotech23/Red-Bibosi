// TODO(contrato): reemplazar al integrar — store en memoria mientras A no publica schema en main.

import { randomUUID } from "crypto";
import type {
  FollowUpCode,
  IncidentType,
  Post,
  PostPublic,
  Profile,
  ReportPrivate,
  Vote,
  Zone,
} from "@/lib/types";
import { toGridCell } from "@/lib/server/grid";
import {
  generateFollowUpCode,
  hashFollowUpCode,
  followUpExpiresAt,
} from "@/lib/server/follow-up";

const zones: Zone[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "equipetrol",
    name: "Equipetrol",
    bbox: {
      minLat: -17.78,
      maxLat: -17.75,
      minLng: -63.2,
      maxLng: -63.17,
    },
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "plan_3000",
    name: "Plan 3000",
    bbox: null,
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

const profiles = new Map<string, Profile>([
  [
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      pseudonym: "vecino_scz",
      role: "ciudadano",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  [
    "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      pseudonym: "otro_vecino",
      role: "ciudadano",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
]);

const posts = new Map<string, Post>();
const privateReports = new Map<string, ReportPrivate>();
const votes = new Map<string, Vote>();
const followUps = new Map<string, FollowUpCode>();
const evidenceBlobs = new Map<string, Buffer>();

function nowIso(): string {
  return new Date().toISOString();
}

function toPublic(post: Post): PostPublic {
  const vote_count = [...votes.values()].filter(
    (v) => v.post_id === post.id,
  ).length;
  const author = post.author_id
    ? profiles.get(post.author_id)
    : undefined;
  return {
    ...post,
    author_pseudonym: author?.pseudonym ?? null,
    vote_count,
  };
}

export function mockGetProfileById(id: string): Profile | null {
  return profiles.get(id) ?? null;
}

export function mockGetZoneById(id: string): Zone | null {
  return zones.find((z) => z.id === id) ?? null;
}

export function mockListZones(): Zone[] {
  return [...zones];
}

export interface MockCreatePostInput {
  author_id: string;
  zone_id: string;
  type: IncidentType;
  title: string;
  body: string;
  lat: number;
  lng: number;
  is_establishment: boolean;
  evidence_path?: string | null;
}

export function mockCreatePost(input: MockCreatePostInput): {
  post: PostPublic;
  follow_up_code: string;
} {
  const id = randomUUID();
  const ts = nowIso();
  const { grid_lat, grid_lng } = toGridCell(input.lat, input.lng);

  let publish_gate: Post["publish_gate"] = "published";
  if (input.is_establishment) {
    publish_gate = input.evidence_path
      ? "published"
      : "pending_evidence";
  }

  const post: Post = {
    id,
    author_id: input.author_id,
    zone_id: input.zone_id,
    type: input.type,
    status: "reportado",
    title: input.title,
    body: input.body,
    grid_lat,
    grid_lng,
    is_establishment: input.is_establishment,
    publish_gate,
    created_at: ts,
    updated_at: ts,
  };
  posts.set(id, post);

  privateReports.set(id, {
    post_id: id,
    lat: input.lat,
    lng: input.lng,
    evidence_path: input.evidence_path ?? null,
    raw_notes: null,
    created_at: ts,
  });

  const code = generateFollowUpCode();
  followUps.set(id, {
    id: randomUUID(),
    post_id: id,
    code_hash: hashFollowUpCode(code),
    expires_at: followUpExpiresAt(),
    created_at: ts,
  });

  return { post: toPublic(post), follow_up_code: code };
}

export function mockGetPost(id: string): Post | null {
  return posts.get(id) ?? null;
}

export function mockGetPostPublic(id: string): PostPublic | null {
  const post = posts.get(id);
  return post ? toPublic(post) : null;
}

export function mockCreateVote(
  postId: string,
  userId: string,
): { vote: Vote; post: PostPublic } | { error: "NOT_FOUND" | "CONFLICT" } {
  const post = posts.get(postId);
  if (!post) return { error: "NOT_FOUND" };

  const already = [...votes.values()].find(
    (v) => v.post_id === postId && v.user_id === userId,
  );
  if (already) return { error: "CONFLICT" };

  const vote: Vote = {
    id: randomUUID(),
    post_id: postId,
    user_id: userId,
    value: 1,
    created_at: nowIso(),
  };
  votes.set(vote.id, vote);

  const count = [...votes.values()].filter((v) => v.post_id === postId).length;
  // Corroboración ciudadana simple: ≥3 votos → corroborado
  if (count >= 3 && post.status === "reportado") {
    post.status = "corroborado";
    post.updated_at = nowIso();
  } else if (post.status === "reportado") {
    post.status = "en_verificacion";
    post.updated_at = nowIso();
  }

  return { vote, post: toPublic(post) };
}

export function mockIssueFollowUp(
  postId: string,
):
  | { code: string }
  | { error: "NOT_FOUND" | "FORBIDDEN_STATUS" } {
  const post = posts.get(postId);
  if (!post) return { error: "NOT_FOUND" };

  const eligible = [
    "corroborado",
    "derivado",
    "resuelto",
    "sin_respuesta",
  ] as const;
  if (!(eligible as readonly string[]).includes(post.status)) {
    return { error: "FORBIDDEN_STATUS" };
  }

  const code = generateFollowUpCode();
  followUps.set(postId, {
    id: randomUUID(),
    post_id: postId,
    code_hash: hashFollowUpCode(code),
    expires_at: followUpExpiresAt(),
    created_at: nowIso(),
  });
  return { code };
}

export function mockListMapReports(): {
  grid_lat: number;
  grid_lng: number;
  type: IncidentType;
}[] {
  return [...posts.values()]
    .filter((p) => p.publish_gate === "published")
    .map((p) => ({
      grid_lat: p.grid_lat,
      grid_lng: p.grid_lng,
      type: p.type,
    }));
}

export function mockStoreEvidence(path: string, buffer: Buffer): string {
  evidenceBlobs.set(path, buffer);
  return path;
}

/** Seed de celdas para demos / tests de mapa */
export function mockSeedMapReports(
  cell: { grid_lat: number; grid_lng: number },
  count: number,
  type: IncidentType = "robo",
): void {
  for (let i = 0; i < count; i++) {
    const id = randomUUID();
    const ts = nowIso();
    posts.set(id, {
      id,
      author_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      zone_id: zones[0]!.id,
      type,
      status: "reportado",
      title: "Reporte seed mapa sin nombres",
      body: "Descripción seed suficientemente larga para validar mapa k anonimidad.",
      grid_lat: cell.grid_lat,
      grid_lng: cell.grid_lng,
      is_establishment: false,
      publish_gate: "published",
      created_at: ts,
      updated_at: ts,
    });
  }
}

export function _resetMockStore(): void {
  posts.clear();
  privateReports.clear();
  votes.clear();
  followUps.clear();
  evidenceBlobs.clear();
}
