import { describe, expect, it } from "vitest";
import type { IncidentType, PostStatus, PublishGate } from "@/lib/types";

const POST_STATUSES: PostStatus[] = [
  "reportado",
  "en_verificacion",
  "corroborado",
  "derivado",
  "resuelto",
  "sin_respuesta",
];

const INCIDENT_TYPES: IncidentType[] = [
  "robo",
  "acoso",
  "vandalismo",
  "consumo_via_publica",
  "convivencia_nocturna",
];

const PUBLISH_GATES: PublishGate[] = [
  "pending_evidence",
  "pending_corroboration",
  "published",
];

describe("contratos compartidos (smoke)", () => {
  it("expone los estados de post del contrato", () => {
    expect(POST_STATUSES).toHaveLength(6);
  });

  it("expone los tipos de incidente del contrato", () => {
    expect(INCIDENT_TYPES).toHaveLength(5);
  });

  it("expone los publish gates del contrato", () => {
    expect(PUBLISH_GATES).toContain("published");
  });
});
