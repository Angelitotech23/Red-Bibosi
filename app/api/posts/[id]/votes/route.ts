import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  badRequest,
  conflict,
  internalError,
  notFound,
  rateLimited,
  unauthorized,
  validationError,
} from "@/lib/server/errors";
import { enforcePostRateLimits } from "@/lib/server/rate-limit";
import { castVote } from "@/lib/server/posts-service";
import { createVoteSchema } from "@/lib/validation/posts";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const rl = enforcePostRateLimits(req, auth.id, "votes");
    if (!rl.ok) return rateLimited(rl.retryAfterSec);

    const { id } = await context.params;
    if (!id) return badRequest("id requerido.");

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Cuerpo JSON inválido.");
    }

    const parsed = createVoteSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("El voto debe ser { \"value\": 1 }.");
    }

    const result = await castVote(id, auth.id);
    if ("error" in result) {
      if (result.error === "NOT_FOUND") return notFound("Caso no encontrado.");
      if (result.error === "CONFLICT") {
        return conflict("Ya registraste un voto en este caso.");
      }
      return internalError();
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return internalError(err);
  }
}
