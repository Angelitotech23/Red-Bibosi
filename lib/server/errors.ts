import type { ApiErrorBody, ApiErrorCode } from "@/lib/types";
import { NextResponse } from "next/server";

const GENERIC_INTERNAL =
  "Ocurrió un error interno. Intenta de nuevo más tarde.";

export function apiError(
  status: number,
  code: ApiErrorCode | string,
  message: string,
  headers?: HeadersInit,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers },
  );
}

export function unauthorized(): NextResponse<ApiErrorBody> {
  return apiError(401, "UNAUTHORIZED", "Debes iniciar sesión.");
}

export function forbidden(message = "No tienes permiso para esta acción."): NextResponse<ApiErrorBody> {
  return apiError(403, "FORBIDDEN", message);
}

export function notFound(message = "Recurso no encontrado."): NextResponse<ApiErrorBody> {
  return apiError(404, "NOT_FOUND", message);
}

export function conflict(message: string): NextResponse<ApiErrorBody> {
  return apiError(409, "CONFLICT", message);
}

export function validationError(message: string): NextResponse<ApiErrorBody> {
  return apiError(422, "VALIDATION_ERROR", message);
}

export function piiNotAllowed(message: string): NextResponse<ApiErrorBody> {
  return apiError(422, "PII_NOT_ALLOWED", message);
}

export function rateLimited(retryAfterSec: number): NextResponse<ApiErrorBody> {
  return apiError(429, "RATE_LIMITED", "Demasiadas solicitudes. Intenta más tarde.", {
    "Retry-After": String(retryAfterSec),
  });
}

export function internalError(err?: unknown): NextResponse<ApiErrorBody> {
  if (err && process.env.NODE_ENV !== "production") {
    // Solo log server-side; nunca al cliente
    console.error("[api]", err);
  } else if (err) {
    console.error("[api] internal error");
  }
  return apiError(500, "INTERNAL", GENERIC_INTERNAL);
}

export function badRequest(message: string): NextResponse<ApiErrorBody> {
  return apiError(400, "BAD_REQUEST", message);
}
