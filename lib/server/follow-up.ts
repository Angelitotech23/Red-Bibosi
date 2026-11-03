import { createHash, randomBytes } from "crypto";
import type { PostStatus } from "@/lib/types";

const FOLLOW_UP_ELIGIBLE: ReadonlySet<PostStatus> = new Set([
  "corroborado",
  "derivado",
  "resuelto",
  "sin_respuesta",
]);

export function canIssueFollowUpCode(status: PostStatus): boolean {
  return FOLLOW_UP_ELIGIBLE.has(status);
}

/** Código en claro: 10 chars alfanuméricos (mostrado una sola vez). */
export function generateFollowUpCode(): string {
  return randomBytes(8).toString("base64url").slice(0, 10).toUpperCase();
}

export function hashFollowUpCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export function followUpExpiresAt(from = new Date(), days = 90): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}
