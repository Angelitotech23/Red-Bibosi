/**
 * Rate limit in-memory por IP y por usuario.
 * TODO(contrato): C-04 — sustituir por store compartido (p. ej. Upstash) en multi-instancia.
 */

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec: number;
  remaining: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitConfig {
  /** Máximo de solicitudes en la ventana */
  limit: number;
  /** Ventana en segundos */
  windowSec: number;
}

/** Defaults provisionales mientras C-04 está PENDING_APPROVAL */
export const RATE_LIMITS = {
  posts: { limit: 10, windowSec: 3600 } satisfies RateLimitConfig,
  votes: { limit: 60, windowSec: 3600 } satisfies RateLimitConfig,
  followUp: { limit: 5, windowSec: 3600 } satisfies RateLimitConfig,
  comments: { limit: 30, windowSec: 3600 } satisfies RateLimitConfig,
  ipGlobalPost: { limit: 40, windowSec: 3600 } satisfies RateLimitConfig,
} as const;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
  nowMs = Date.now(),
): RateLimitResult {
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= nowMs) {
    buckets.set(key, {
      count: 1,
      resetAt: nowMs + config.windowSec * 1000,
    });
    return {
      ok: true,
      retryAfterSec: config.windowSec,
      remaining: config.limit - 1,
    };
  }

  if (existing.count >= config.limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((existing.resetAt - nowMs) / 1000),
    );
    return { ok: false, retryAfterSec, remaining: 0 };
  }

  existing.count += 1;
  return {
    ok: true,
    retryAfterSec: Math.max(
      1,
      Math.ceil((existing.resetAt - nowMs) / 1000),
    ),
    remaining: config.limit - existing.count,
  };
}

/**
 * Aplica límite por IP y, si hay userId, también por usuario.
 * Falla si cualquiera de los dos está excedido.
 */
export function enforcePostRateLimits(
  req: Request,
  userId: string | null,
  kind: keyof typeof RATE_LIMITS,
): RateLimitResult {
  const ip = getClientIp(req);
  const config = RATE_LIMITS[kind];

  const ipResult = checkRateLimit(
    `ip:${kind}:${ip}`,
    RATE_LIMITS.ipGlobalPost,
  );
  if (!ipResult.ok) return ipResult;

  if (userId) {
    const userResult = checkRateLimit(`user:${kind}:${userId}`, config);
    if (!userResult.ok) return userResult;
    return userResult;
  }

  return ipResult;
}

/** Solo para tests */
export function _resetRateLimitBuckets(): void {
  buckets.clear();
}
