import type { IncidentType } from "@/lib/types";

/** Categorías del feed global (producto Red Bibosi SCZ). */
export type FeedCategory =
  | "maleantes_robos"
  | "zonas_peligro_alumbrado"
  | "locales_boliches";

export const FEED_CATEGORY_LABELS: Record<FeedCategory, string> = {
  maleantes_robos: "Maleantes y robos",
  zonas_peligro_alumbrado: "Zonas de peligro y alumbrado",
  locales_boliches: "Locales y boliches nocturnos",
};

export const FEED_CATEGORY_TYPES: Record<FeedCategory, IncidentType[]> = {
  maleantes_robos: ["robo", "acoso"],
  zonas_peligro_alumbrado: ["vandalismo", "consumo_via_publica"],
  locales_boliches: ["convivencia_nocturna"],
};

export const FEED_CATEGORIES = Object.keys(
  FEED_CATEGORY_LABELS,
) as FeedCategory[];

export function typesForFeedCategory(
  category: FeedCategory | "" | undefined,
): IncidentType[] | undefined {
  if (!category) return undefined;
  return FEED_CATEGORY_TYPES[category];
}

export function feedCategoryForType(type: IncidentType): FeedCategory {
  for (const cat of FEED_CATEGORIES) {
    if (FEED_CATEGORY_TYPES[cat].includes(type)) return cat;
  }
  return "zonas_peligro_alumbrado";
}
