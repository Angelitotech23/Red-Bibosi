/**
 * Modo de datos del cliente.
 * - `mock`: datos simulados (default seguro sin backend completo).
 * - `live`: llama a `/api/*`; si un endpoint aún no existe (404),
 *   cae a mock solo en lecturas documentadas como pendientes.
 */
export type ApiMode = "mock" | "live";

export function getApiMode(): ApiMode {
  const raw = process.env.NEXT_PUBLIC_API_MODE;
  if (raw === "mock") return "mock";
  if (raw === "live") return "live";
  // Con API parcial en main, preferimos live + fallback por endpoint.
  return "live";
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
