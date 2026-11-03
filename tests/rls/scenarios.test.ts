import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  canInsertVote,
  canSelectPost,
  canSelectReportsPrivate,
  canUpdatePost,
  roundGrid,
  type PostRow,
} from "./policyEngine";

const migrationsDir = path.resolve(__dirname, "../../supabase/migrations");

function allMigrationsSql(): string {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(path.join(migrationsDir, f), "utf8"))
    .join("\n");
}

describe("RLS escenarios (contrato Agente A)", () => {
  const author = "11111111-1111-4111-8111-111111111111";
  const other = "22222222-2222-4222-8222-222222222222";

  const gated: PostRow = {
    id: "p1",
    author_id: author,
    status: "reportado",
    publish_gate: "pending_evidence",
  };

  const publishedFresh: PostRow = {
    id: "p2",
    author_id: author,
    status: "reportado",
    publish_gate: "published",
  };

  const published: PostRow = {
    id: "p3",
    author_id: author,
    status: "corroborado",
    publish_gate: "published",
  };

  it("leer reports_private debe fallar (anon, ciudadano, moderador vía tabla)", () => {
    expect(canSelectReportsPrivate({ role: "anon" })).toBe(false);
    expect(
      canSelectReportsPrivate({ role: "ciudadano", userId: author }),
    ).toBe(false);
    expect(
      canSelectReportsPrivate({ role: "moderador", userId: other }),
    ).toBe(false);
    expect(canSelectReportsPrivate({ role: "admin", userId: other })).toBe(
      false,
    );
  });

  it("editar el post de otro usuario debe fallar", () => {
    expect(
      canUpdatePost({ role: "ciudadano", userId: other }, gated),
    ).toBe(false);
    expect(
      canUpdatePost({ role: "ciudadano", userId: author }, gated),
    ).toBe(true);
    expect(
      canUpdatePost({ role: "moderador", userId: other }, gated),
    ).toBe(true);
  });

  it("anon lee published (incluso reportado) y no lee gate pendiente", () => {
    expect(canSelectPost({ role: "anon" }, gated)).toBe(false);
    expect(canSelectPost({ role: "anon" }, publishedFresh)).toBe(true);
    expect(canSelectPost({ role: "anon" }, published)).toBe(true);
    expect(
      canSelectPost({ role: "ciudadano", userId: author }, gated),
    ).toBe(true);
  });

  it("votar dos veces debe fallar (unique post_id, user_id)", () => {
    const existing = [{ post_id: "p1", user_id: author }];
    const first = canInsertVote(
      { role: "ciudadano", userId: author },
      { post_id: "p1", user_id: author },
      [],
    );
    const second = canInsertVote(
      { role: "ciudadano", userId: author },
      { post_id: "p1", user_id: author },
      existing,
    );
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("UNIQUE_VIOLATION");
  });
});

describe("round_grid (espejo SQL)", () => {
  it("redondea a 4 decimales", () => {
    expect(roundGrid(-17.7734567, -63.18301234)).toEqual({
      grid_lat: -17.7735,
      grid_lng: -63.183,
    });
  });
});

describe("artefactos de migración RLS", () => {
  const sql = allMigrationsSql();

  it("habilita RLS en tablas del contrato", () => {
    for (const table of [
      "zones",
      "profiles",
      "posts",
      "reports_private",
      "votes",
      "comments",
      "official_responses",
      "follow_up_codes",
      "moderation_actions",
    ]) {
      expect(sql).toMatch(
        new RegExp(`alter table public\\.${table} enable row level security`, "i"),
      );
    }
  });

  it("define unique (post_id, user_id) en votes", () => {
    expect(sql).toMatch(/unique\s*\(\s*post_id\s*,\s*user_id\s*\)/i);
  });

  it("define round_grid y vista posts_public", () => {
    expect(sql).toMatch(/create or replace function public\.round_grid/i);
    expect(sql).toMatch(/create or replace view public\.posts_public/i);
  });

  it("niega acceso directo a reports_private", () => {
    expect(sql).toMatch(/reports_private_deny_all/i);
    expect(sql).toMatch(/get_report_private/i);
  });

  it("incluye triggers de votos y moderación", () => {
    expect(sql).toMatch(/on_vote_inserted/i);
    expect(sql).toMatch(/on_post_status_changed_by_moderator/i);
    expect(sql).toMatch(/can_corroborate/i);
  });
});
