import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PublishForm } from "@/components/PublishForm";

vi.mock("@/lib/client/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/client/api")>(
    "@/lib/client/api",
  );
  return {
    ...actual,
    fetchZones: vi.fn(async () => ({
      zones: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          slug: "equipetrol",
          name: "Equipetrol",
          bbox: null,
          created_at: "2026-11-03T00:00:00.000Z",
        },
      ],
    })),
    fetchEstablishments: vi.fn(async () => ({
      establishments: [
        {
          id: "est-001",
          registry_label: "Punto registrado SCZ-A-104",
          zone_id: "11111111-1111-4111-8111-111111111111",
        },
      ],
    })),
    createPost: vi.fn(async () => ({
      post: {
        id: "p-new",
        author_id: "u-1",
        zone_id: "11111111-1111-4111-8111-111111111111",
        type: "robo",
        status: "reportado",
        title: "Prueba",
        body: "Cuerpo",
        grid_lat: -17.76,
        grid_lng: -63.18,
        is_establishment: false,
        publish_gate: "published",
        created_at: "2026-11-03T00:00:00.000Z",
        updated_at: "2026-11-03T00:00:00.000Z",
      },
      follow_up_code: "CUADRA-DEMO-TEST",
    })),
  };
});

describe("PublishForm", () => {
  it("renderiza selectores de tipo, zona y aviso de metadatos", async () => {
    render(<PublishForm />);

    expect(
      await screen.findByRole("heading", { level: 1 }).catch(() => null),
    ).toBeNull();

    expect(await screen.findByLabelText(/tipo de caso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^zona$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/eliminamos los metadatos de la imagen/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /publicar caso/i }),
    ).toBeInTheDocument();
  });

  it("exige establecimiento del registro cuando aplica", async () => {
    const user = userEvent.setup();
    render(<PublishForm />);

    await screen.findByLabelText(/tipo de caso/i);

    await user.click(
      screen.getByLabelText(/establecimiento registrado/i),
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText(/establecimiento \(registro\)/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("option", { name: /punto registrado scz-a-104/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/nombre del negocio/i)).not.toBeInTheDocument();
  });
});
