import { NextResponse } from "next/server";
import { internalError, notFound } from "@/lib/server/errors";
import { getPostPublicOrNull } from "@/lib/server/posts-service";
import { assertLiveServerConfig } from "@/lib/server/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Detalle público de un caso — sin auth, sin autor. */
export async function GET(_req: Request, ctx: Ctx) {
  try {
    assertLiveServerConfig();
    const { id } = await ctx.params;
    const post = await getPostPublicOrNull(id);
    if (!post) return notFound("Caso no encontrado.");
    return NextResponse.json(
      { post },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    return internalError(err);
  }
}
