import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommunityFeed } from "@/components/CommunityFeed";

vi.mock("next/navigation", () => ({
  usePathname: () => "/inicio",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("feed de demostración", () => {
  it("muestra aviso y casos inventados cuando la API live está vacía", async () => {
    render(<CommunityFeed />);

    expect(
      await screen.findByText(/casos de demostración/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/intento de hurto cerca de la avenida principal/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/farol de esquina apagado desde el fin de semana/i),
    ).toBeInTheDocument();
  });
});
