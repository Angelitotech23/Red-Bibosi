import { z } from "zod";
import type { IncidentType } from "@/lib/types";
import { assertNoPii } from "@/lib/validation/pii";

export const INCIDENT_TYPES = [
  "robo",
  "acoso",
  "vandalismo",
  "consumo_via_publica",
  "convivencia_nocturna",
] as const satisfies readonly IncidentType[];

/** Bbox aproximado del área metropolitana de Santa Cruz de la Sierra */
export const SCZ_BBOX = {
  minLat: -18.15,
  maxLat: -17.6,
  minLng: -63.35,
  maxLng: -62.95,
} as const;

export const createPostSchema = z.object({
  zone_id: z.string().uuid({ message: "zone_id inválido" }),
  type: z.enum(INCIDENT_TYPES, {
    message: "type de incidente inválido",
  }),
  title: z
    .string()
    .trim()
    .min(8, "El título es demasiado corto")
    .max(120, "El título es demasiado largo"),
  body: z
    .string()
    .trim()
    .min(20, "La descripción es demasiado corta")
    .max(4000, "La descripción es demasiado larga"),
  lat: z.number().finite(),
  lng: z.number().finite(),
  is_establishment: z.boolean(),
});

export type CreatePostParsed = z.infer<typeof createPostSchema>;

export const createVoteSchema = z.object({
  value: z.literal(1),
});

export function validateCoordsInScz(lat: number, lng: number): boolean {
  return (
    lat >= SCZ_BBOX.minLat &&
    lat <= SCZ_BBOX.maxLat &&
    lng >= SCZ_BBOX.minLng &&
    lng <= SCZ_BBOX.maxLng
  );
}

export function validateCreatePostInput(raw: unknown):
  | { ok: true; data: CreatePostParsed }
  | { ok: false; code: "VALIDATION_ERROR" | "PII_NOT_ALLOWED"; message: string } {
  const parsed = createPostSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: first?.message ?? "Datos inválidos",
    };
  }

  if (!validateCoordsInScz(parsed.data.lat, parsed.data.lng)) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Las coordenadas están fuera del área de Santa Cruz.",
    };
  }

  const pii = assertNoPii(parsed.data.title, parsed.data.body);
  if (!pii.ok) {
    return {
      ok: false,
      code: "PII_NOT_ALLOWED",
      message: pii.reason ?? "Texto con datos personales no permitido.",
    };
  }

  return { ok: true, data: parsed.data };
}
