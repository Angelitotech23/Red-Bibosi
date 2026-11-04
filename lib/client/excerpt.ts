/** Recorta un texto de denuncia para el extracto de la tarjeta. */
export function excerpt(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max);
  const atWord = sliced.replace(/\s+\S*$/, "");
  return `${atWord || sliced}…`;
}
