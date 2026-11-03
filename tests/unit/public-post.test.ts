import { describe, expect, it } from "vitest";
import { isPubliclyListed, toPostPublic } from "@/lib/server/public-post";
import {
  feedCategoryForType,
  typesForFeedCategory,
} from "@/lib/client/feed-categories";

describe("toPostPublic", () => {
  it("no expone author_id aunque venga en el row", () => {
    const pub = toPostPublic({
      id: "p1",
      zone_id: "z1",
      type: "robo",
      status: "reportado",
      title: "t",
      body: "b suficientemente largo",
      grid_lat: -17.77,
      grid_lng: -63.18,
      is_establishment: false,
      publish_gate: "published",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      vote_count: 2,
    });
    expect(pub).not.toHaveProperty("author_id");
    expect(pub).not.toHaveProperty("author_pseudonym");
    expect(pub.vote_count).toBe(2);
  });
});

describe("isPubliclyListed", () => {
  it("exige publish_gate published", () => {
    expect(
      isPubliclyListed({ publish_gate: "pending_evidence", status: "reportado" }),
    ).toBe(false);
    expect(
      isPubliclyListed({ publish_gate: "published", status: "reportado" }),
    ).toBe(true);
  });
});

describe("feed categories", () => {
  it("mapea tipos a las 3 categorías de producto", () => {
    expect(feedCategoryForType("robo")).toBe("maleantes_robos");
    expect(feedCategoryForType("vandalismo")).toBe("zonas_peligro_alumbrado");
    expect(feedCategoryForType("convivencia_nocturna")).toBe(
      "locales_boliches",
    );
    expect(typesForFeedCategory("maleantes_robos")).toEqual(["robo", "acoso"]);
  });
});
