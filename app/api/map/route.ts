import { NextResponse } from "next/server";
import { internalError } from "@/lib/server/errors";
import { getMapCells } from "@/lib/server/posts-service";
import { MAP_K_THRESHOLD } from "@/lib/server/grid";

export const runtime = "nodejs";

/**
 * Mapa agregado por celda de grilla.
 * Solo celdas con k ≥ MAP_K_THRESHOLD reportes. Sin coordenadas exactas.
 * Solicitud al coordinador: endpoint no listado aún en docs/contracts.md §3.
 */
export async function GET() {
  try {
    const cells = await getMapCells();

    return NextResponse.json(
      {
        cells,
        k_threshold: MAP_K_THRESHOLD,
      },
      {
        status: 200,
        headers: {
          // CDN / edge cache — sin coords exactas, seguro cachear públicamente
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    return internalError(err);
  }
}
