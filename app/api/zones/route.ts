import { NextResponse } from "next/server";
import { internalError } from "@/lib/server/errors";
import { listZones } from "@/lib/server/posts-service";
import { assertLiveServerConfig } from "@/lib/server/supabase";

export const runtime = "nodejs";

/** Listado público de zonas SCZ — sin auth. */
export async function GET() {
  try {
    assertLiveServerConfig();
    const zones = await listZones();
    return NextResponse.json(
      { zones },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    return internalError(err);
  }
}
