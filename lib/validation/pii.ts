/**
 * Detección heurística de nombres propios de personas y establecimientos
 * en texto libre (título, cuerpo, comentarios).
 * Rechazo → 422 PII_NOT_ALLOWED.
 */

const ESTABLISHMENT_MARKERS =
  /\b(s\.?\s*r\.?\s*l\.?|s\.?\s*a\.?|ltda\.?|eirl|farmacia|supermercado|minimarket|restaurante|hotel|motel|clínica|clinica|colegio|universidad|iglesia|templo|banco|cooperativa|empresa|negocio|tienda|bar\s+|discoteca|pub\b)\b/i;

/** Patrones tipo "Juan Pérez", "María Elena Vargas" (2–4 tokens capitalizados) */
const PERSON_NAME_PATTERN =
  /(?:^|[\s,.;:¡!¿?"'])([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{1,20}(?:\s+(?:de|del|la|los|las|y)\s+)?(?:\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{1,20}){1,3})(?=$|[\s,.;:¡!¿?"'])/g;

const HONORIFICS =
  /\b(sr\.?|sra\.?|srta\.?|don|doña|dr\.?|dra\.?|lic\.?|ing\.?)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/i;

/** Palabras de zona/calles SCZ que no deben marcarse como PII */
const ALLOWED_PLACE_WORDS = new Set(
  [
    "Santa",
    "Cruz",
    "Plan",
    "Equipetrol",
    "Urubó",
    "Urubo",
    "Warnes",
    "Montero",
    "Norte",
    "Sur",
    "Este",
    "Oeste",
    "Avenida",
    "Calle",
    "Radial",
    "Anillo",
    "Primero",
    "Segundo",
    "Tercero",
    "Cuarto",
    "Quinto",
    "Sexto",
    "Séptimo",
    "Septimo",
    "Octavo",
    "Parque",
    "Plaza",
    "Barrio",
    "UV",
    "Zona",
  ].map((w) => w.toLowerCase()),
);

export interface PiiCheckResult {
  ok: boolean;
  reason?: string;
  match?: string;
}

function isAllowedPhrase(phrase: string): boolean {
  const tokens = phrase.split(/\s+/).filter(Boolean);
  return tokens.every((t) => ALLOWED_PLACE_WORDS.has(t.toLowerCase()));
}

export function findProperNames(text: string): string | null {
  PERSON_NAME_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PERSON_NAME_PATTERN.exec(text)) !== null) {
    const phrase = match[1]?.trim();
    if (!phrase) continue;
    if (isAllowedPhrase(phrase)) continue;
    // Evitar falsos positivos de una sola palabra capitalizada al inicio de oración
    const words = phrase.split(/\s+/);
    if (words.length < 2) continue;
    return phrase;
  }
  return null;
}

export function checkFreeTextForPii(text: string): PiiCheckResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, reason: "El texto no puede estar vacío." };
  }

  if (ESTABLISHMENT_MARKERS.test(trimmed)) {
    return {
      ok: false,
      reason:
        "No indiques nombres de establecimientos o negocios. Describe el hecho sin identificar el local.",
      match: trimmed.match(ESTABLISHMENT_MARKERS)?.[0],
    };
  }

  if (HONORIFICS.test(trimmed)) {
    return {
      ok: false,
      reason:
        "No indiques nombres propios de personas. Usa descripciones genéricas (vecino, conductor, etc.).",
      match: trimmed.match(HONORIFICS)?.[0],
    };
  }

  const person = findProperNames(trimmed);
  if (person) {
    return {
      ok: false,
      reason:
        "No indiques nombres propios de personas. Describe el hecho sin identificar a nadie.",
      match: person,
    };
  }

  return { ok: true };
}

export function assertNoPii(...fields: string[]): PiiCheckResult {
  for (const field of fields) {
    const result = checkFreeTextForPii(field);
    if (!result.ok) return result;
  }
  return { ok: true };
}
