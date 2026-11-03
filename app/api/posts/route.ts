import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  badRequest,
  internalError,
  piiNotAllowed,
  rateLimited,
  unauthorized,
  validationError,
} from "@/lib/server/errors";
import {
  uploadEvidence,
  validateAndStripEvidence,
} from "@/lib/server/evidence";
import { enforcePostRateLimits } from "@/lib/server/rate-limit";
import { createPost } from "@/lib/server/posts-service";
import { validateCreatePostInput } from "@/lib/validation/posts";

export const runtime = "nodejs";

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
        is_establishment:
          isEstRaw === "true" || isEstRaw === "1",
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

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const rl = enforcePostRateLimits(req, auth.id, "posts");
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
      auth.id,
      validated.data,
      evidencePath,
      auth.accessToken,
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
