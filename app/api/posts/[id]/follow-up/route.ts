import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  badRequest,
  forbidden,
  internalError,
  notFound,
  rateLimited,
  unauthorized,
} from "@/lib/server/errors";
import { enforcePostRateLimits } from "@/lib/server/rate-limit";
import { issueFollowUpCode } from "@/lib/server/posts-service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Emite un código de seguimiento si el post está en `corroborado` o posterior.
 * Solicitud al coordinador: endpoint no listado aún en docs/contracts.md §3
 * (el contrato solo documenta follow_up_code en POST /api/posts y lookup).
 */
export async function POST(req: Request, context: RouteContext) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const rl = enforcePostRateLimits(req, auth.id, "followUp");
    if (!rl.ok) return rateLimited(rl.retryAfterSec);

    const { id } = await context.params;
    if (!id) return badRequest("id requerido.");

    const result = await issueFollowUpCode(id);
    if ("error" in result) {
      if (result.error === "NOT_FOUND") return notFound("Caso no encontrado.");
      if (result.error === "FORBIDDEN_STATUS") {
        return forbidden(
          "El código de seguimiento solo está disponible cuando el caso está corroborado o en un estado posterior.",
        );
      }
      return internalError();
    }

    return NextResponse.json(
      { follow_up_code: result.follow_up_code },
      { status: 201 },
    );
  } catch (err) {
    return internalError(err);
  }
}
