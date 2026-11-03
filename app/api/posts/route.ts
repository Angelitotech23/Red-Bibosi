import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { optionalAuth } from "@/lib/server/auth";
import {
  badRequest,
  internalError,
  piiNotAllowed,
  rateLimited,
  validationError,
} from "@/lib/server/errors";
import {
  uploadEvidence,
  validateAndStripEvidence,
} from "@/lib/server/evidence";
import { enforcePostRateLimits } from "@/lib/server/rate-limit";
import { createPost, listPostsPublic } from "@/lib/server/posts-service";
import { assertLiveServerConfig } from "@/lib/server/supabase";
import { validateCreatePostInput } from "@/lib/validation/posts";
import type { IncidentType, PostStatus } from "@/lib/types";

export const runtime = "nodejs";

/** Lectura pública del feed — sin auth (auditoría C3). */
export async function GET(req: Request) {
  try {
    assertLiveServerConfig();
    const url = new URL(req.url);
    const zone_id = url.searchParams.get("zone_id") ?? undefined;
    const type = (url.searchParams.get("type") as IncidentType | null) ?? undefined;
    const status =
      (url.searchParams.get("status") as PostStatus | null) ?? undefined;
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const limitRaw = url.searchParams.get("limit");
    const limit = limitRaw ? Number(limitRaw) : undefined;

    if (limitRaw && (!Number.isFinite(limit) || (limit ?? 0) < 1)) {
      return badRequest("limit inválido");
    }

    const result = await listPostsPublic({
      zone_id,
      type,
      status,
      cursor,
      limit,
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    return internalError(err);
  }
}

async function parseBody(req: Request): Promise<
  | { ok: true; json: Record<string, unknown>; evidence: File | null }
  | { ok: false; response: NextResponse }
> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const evidenceEntry = form.get("evidence");
    const evidence =
      evidenceEntry instanceof File && evidenceEntry.size > 0
        ? evidenceEntry
        : null;

    const latRaw = form.get("lat");
    const lngRaw = form.get("lng");
    const isEstRaw = form.get("is_establishment");

    return {
      ok: true,
      evidence,
      json: {
        zone_id: String(form.get("zone_id") ?? ""),
        type: String(form.get("type") ?? ""),
        title: String(form.get("title") ?? ""),
        body: String(form.get("body") ?? ""),
        lat: latRaw != null ? Number(latRaw) : NaN,
        lng: lngRaw != null ? Number(lngRaw) : NaN,
        is_establishment: isEstRaw === "true" || isEstRaw === "1",
      },
    };
  }

  try {
    const json = (await req.json()) as Record<string, unknown>;
    return { ok: true, json, evidence: null };
  } catch {
    return { ok: false, response: badRequest("Cuerpo JSON inválido.") };
  }
}

/**
 * Alta de reporte. Auth opcional:
 * - Con sesión → create_post_with_private (author interno, no público)
 * - Sin sesión → create_post_anonymous vía service role + rate limit IP
 */
export async function POST(req: Request) {
  try {
    assertLiveServerConfig();
    const auth = await optionalAuth(req);

    const rl = enforcePostRateLimits(
      req,
      auth?.id ?? "anon",
      "posts",
    );
    if (!rl.ok) return rateLimited(rl.retryAfterSec);

    const parsed = await parseBody(req);
    if (!parsed.ok) return parsed.response;

    const validated = validateCreatePostInput(parsed.json);
    if (!validated.ok) {
      if (validated.code === "PII_NOT_ALLOWED") {
        return piiNotAllowed(validated.message);
      }
      return validationError(validated.message);
    }

    let evidencePath: string | null = null;
    if (parsed.evidence) {
      const ev = await validateAndStripEvidence(parsed.evidence);
      if (!ev.ok) return validationError(ev.message);
      const tempId = randomUUID();
      evidencePath = await uploadEvidence({
        postId: tempId,
        mime: ev.mime,
        buffer: ev.buffer,
      });
    }

    const result = await createPost(
      auth?.id ?? null,
      validated.data,
      evidencePath,
      auth?.accessToken ?? null,
    );
    if ("error" in result) {
      if (result.error === "ZONE_NOT_FOUND") {
        return validationError("Zona inválida.");
      }
      return internalError();
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return internalError(err);
  }
}
