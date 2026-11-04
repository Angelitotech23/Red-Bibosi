import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReportCard } from "@/components/ReportCard";
import type { PostPublic } from "@/lib/types";

vi.mock("@/lib/client/api", () => ({
  ApiClientError: class extends Error {},
  createVote: vi.fn(),
}));

const post: PostPublic = {
  id: "p-1001",
  zone_id: "11111111-1111-4111-8111-111111111111",
  type: "robo",
  status: "en_verificacion",
  title: "Intento de hurto cerca de la avenida principal",
  body: "Dos personas en motocicleta intentaron quitar un bolso a una vecina.",
  grid_lat: -17.7632,
  grid_lng: -63.1821,
  is_establishment: false,
  publish_gate: "published",
  created_at: "2026-11-02T23:10:00.000Z",
  updated_at: "2026-11-03T01:00:00.000Z",
  vote_count: 4,
};

describe("ReportCard", () => {
  it("muestra título, categoría, distrito y extracto", () => {
    render(
      <ReportCard post={post} zoneName="Equipetrol" zoneSlug="equipetrol" />,
    );

    const title = screen.getByRole("heading", {
      name: /intento de hurto cerca de la avenida principal/i,
    });
    expect(title.querySelector("a")).toHaveAttribute("href", "/caso/p-1001");
    expect(screen.getByText(/maleantes y robos/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /equipetrol/i })).toHaveAttribute(
      "href",
      "/zona/equipetrol",
    );
    expect(screen.getByText(/motocicleta/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /corroborar denuncia/i }),
    ).toBeInTheDocument();
  });
});
