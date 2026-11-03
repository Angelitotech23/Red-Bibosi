import { z } from "zod";

const missingMessage = (name: string, visibility: "pública" | "secreta") =>
  `Falta ${name} (${visibility}). Cópiala desde el panel de Supabase y pégala en .env.local o en las Environment Variables de Vercel.`;

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .url({
      error:
        "NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida (ejemplo: https://xxxx.supabase.co).",
    })
    .refine((value) => value.startsWith("https://"), {
      error: "NEXT_PUBLIC_SUPABASE_URL debe usar HTTPS.",
    }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .trim()
    .min(1, missingMessage("NEXT_PUBLIC_SUPABASE_ANON_KEY", "pública")),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .trim()
    .min(1, missingMessage("SUPABASE_SERVICE_ROLE_KEY", "secreta")),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function assertServiceRoleIsNotPublic() {
  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no debe exponerse con el prefijo NEXT_PUBLIC_. Quítala del cliente y déjala solo como variable de servidor.",
    );
  }
}

function formatEnvError(error: z.ZodError): string {
  const details = error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "env";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");

  return [
    "Faltan o son inválidas variables de entorno requeridas:",
    details,
    "Completa .env.local a partir de .env.example (scripts/init.sh lo copia si no existe).",
    "En producción, cárgalas en Vercel → Project Settings → Environment Variables. Nunca las subas a GitHub.",
  ].join("\n");
}

export function getPublicEnv(): PublicEnv {
  assertServiceRoleIsNotPublic();

  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }

  return parsed.data;
}

export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error(
      "getServerEnv() solo puede usarse en el servidor. No importes secretos en componentes de cliente.",
    );
  }

  assertServiceRoleIsNotPublic();

  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }

  return parsed.data;
}
