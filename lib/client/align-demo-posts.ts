import type { PostPublic, Zone } from "@/lib/types";

/**
 * Si los casos de demo no coinciden con las zonas vivas (IDs distintos),
 * reparte los relatos entre todos los chips para que ningún filtro quede vacío.
 */
export function alignPostsToZones(
  posts: PostPublic[],
  zones: Zone[],
): PostPublic[] {
  if (zones.length === 0 || posts.length === 0) return posts;

  const zoneIds = new Set(zones.map((zone) => zone.id));
  const aligned = posts.map((post, index) =>
    zoneIds.has(post.zone_id)
      ? post
      : { ...post, zone_id: zones[index % zones.length]!.id },
  );

  const covered = new Set(aligned.map((post) => post.zone_id));
  if (covered.size === zones.length) return aligned;

  const extras: PostPublic[] = [];
  for (const [index, zone] of zones.entries()) {
    if (covered.has(zone.id)) continue;
    const source = aligned[index % aligned.length]!;
    extras.push({
      ...source,
      id: `${source.id}-${zone.slug}`,
      zone_id: zone.id,
    });
  }
  return extras.length ? [...aligned, ...extras] : aligned;
}
