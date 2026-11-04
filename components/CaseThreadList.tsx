"use client";

import { CommunityFeed } from "@/components/CommunityFeed";

export function CaseThreadList({
  zoneId,
  zoneSlug,
}: {
  zoneId: string;
  zoneSlug: string;
}) {
  return (
    <CommunityFeed
      zoneId={zoneId}
      zoneSlug={zoneSlug}
      showZoneChips={false}
    />
  );
}
