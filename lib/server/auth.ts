import type { Profile, UserRole } from "@/lib/types";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/server/supabase";
import { mockGetProfileById } from "@/lib/server/mocks/store";

export interface AuthUser {
  id: string;
  profile: Profile;
}

function extractBearer(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

/**
 * Resuelve el usuario autenticado desde Bearer o cookie sb-access-token.
 * Sin Supabase configurado, acepta header de desarrollo X-Mock-User-Id.
 */
export async function requireAuth(req: Request): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    const mockId = req.headers.get("x-mock-user-id");
    if (!mockId) return null;
    const profile = mockGetProfileById(mockId);
    if (!profile) return null;
    return { id: profile.id, profile };
  }

  const token =
    extractBearer(req) ??
    // cookie simple de sesión (SSR/edge); el cliente real usará @supabase/ssr
    parseCookie(req.headers.get("cookie"), "sb-access-token");

  if (!token) return null;

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return null;

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, pseudonym, role, created_at, updated_at")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !profile) return null;

    return {
      id: data.user.id,
      profile: profile as Profile,
    };
  } catch {
    return null;
  }
}

export function hasMinRole(role: UserRole, min: UserRole): boolean {
  const order: UserRole[] = ["ciudadano", "moderador", "autoridad", "admin"];
  return order.indexOf(role) >= order.indexOf(min);
}

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
