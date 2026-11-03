import sharp from "sharp";
import { randomUUID } from "crypto";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/server/supabase";
import { mockStoreEvidence } from "@/lib/server/mocks/store";

export const EVIDENCE_BUCKET = "evidence";
export const EVIDENCE_MAX_BYTES = 5 * 1024 * 1024; // 5 MiB
export const EVIDENCE_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export interface EvidenceValidationOk {
  ok: true;
  mime: string;
  buffer: Buffer;
}

export interface EvidenceValidationErr {
  ok: false;
  message: string;
}

export async function validateAndStripEvidence(
  file: File | Blob,
): Promise<EvidenceValidationOk | EvidenceValidationErr> {
  const mime = file.type || "application/octet-stream";
  if (!EVIDENCE_ALLOWED_MIME.has(mime)) {
    return {
      ok: false,
      message: "Tipo de archivo no permitido. Usa JPEG, PNG o WebP.",
    };
  }

  const size = file.size;
  if (size <= 0 || size > EVIDENCE_MAX_BYTES) {
    return {
      ok: false,
      message: "La evidencia supera el tamaño máximo permitido (5 MB).",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const input = Buffer.from(arrayBuffer);

  try {
    // sharp re-encode elimina metadatos EXIF/GPS
    const pipeline = sharp(input).rotate();
    let output: Buffer;
    if (mime === "image/png") {
      output = await pipeline.png().toBuffer();
    } else if (mime === "image/webp") {
      output = await pipeline.webp({ quality: 85 }).toBuffer();
    } else {
      output = await pipeline.jpeg({ quality: 85 }).toBuffer();
    }

    return { ok: true, mime, buffer: output };
  } catch {
    return { ok: false, message: "No se pudo procesar la imagen." };
  }
}

export async function uploadEvidence(params: {
  postId: string;
  mime: string;
  buffer: Buffer;
}): Promise<string> {
  const ext =
    params.mime === "image/png"
      ? "png"
      : params.mime === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${params.postId}/${randomUUID()}.${ext}`;

  if (!isSupabaseConfigured()) {
    // TODO(contrato): reemplazar al integrar Storage real
    return mockStoreEvidence(path, params.buffer);
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.storage
    .from(EVIDENCE_BUCKET)
    .upload(path, params.buffer, {
      contentType: params.mime,
      upsert: false,
    });

  if (error) {
    throw new Error("EVIDENCE_UPLOAD_FAILED");
  }

  return path;
}
