/**
 * Modo de datos del cliente.
 * `mock` mientras la API (Agente B) no esté disponible en main.
 * Cambiar a `live` (o NEXT_PUBLIC_API_MODE=live) en commit aparte.
 */
export type ApiMode = "mock" | "live";

export function getApiMode(): ApiMode {
  const raw = process.env.NEXT_PUBLIC_API_MODE;
  if (raw === "live") return "live";
  return "mock";
}

export function getSupabasePublicConfig(): {
  url: string | null;
  anonKey: string | null;
} {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null,
  };
}
