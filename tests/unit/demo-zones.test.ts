import { describe, expect, it } from "vitest";
import { alignPostsToZones } from "@/lib/client/align-demo-posts";
import { MOCK_POSTS, MOCK_ZONES } from "@/lib/client/mocks";
import type { PostPublic, Zone } from "@/lib/types";

describe("casos de demo por zona", () => {
  it("reparte al menos un caso en cada zona del seed", () => {
    for (const zone of MOCK_ZONES.zones) {
      const count = MOCK_POSTS.filter((post) => post.zone_id === zone.id).length;
      expect(count, zone.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("alinea relatos a zonas vivas si los IDs no coinciden", () => {
    const liveZones: Zone[] = MOCK_ZONES.zones.map((zone) => ({
      ...zone,
      id: `live-${zone.slug}`,
    }));
    const orphanPosts: PostPublic[] = MOCK_POSTS.slice(0, 5).map((post) => ({
      ...post,
      zone_id: "11111111-1111-4111-8111-111111111111",
    }));

    const aligned = alignPostsToZones(orphanPosts, liveZones);
    const covered = new Set(aligned.map((post) => post.zone_id));
    expect(covered.size).toBe(liveZones.length);
    for (const zone of liveZones) {
      expect(covered.has(zone.id)).toBe(true);
    }
  });
});
