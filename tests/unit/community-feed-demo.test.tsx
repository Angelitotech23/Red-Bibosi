import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommunityFeed } from "@/components/CommunityFeed";

const search = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/inicio",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => search,
}));

afterEach(() => {
  search.delete("zona");
  cleanup();
});

describe("feed de demostración", () => {
  it("muestra aviso y casos inventados cuando la API live está vacía", async () => {
    render(<CommunityFeed />);

    expect(
      await screen.findByText(/casos de demostración/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/intento de hurto cerca de la avenida principal/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /4to anillo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /villa 1º de mayo/i })).toBeInTheDocument();
  });

  it("muestra casos propios al filtrar 4to Anillo", async () => {
    search.set("zona", "4to_anillo");
    render(<CommunityFeed />);

    expect(
      await screen.findByText(/arrebato de celular en parada del anillo/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/farol de esquina apagado desde el fin de semana/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/intento de hurto cerca de la avenida principal/i),
    ).not.toBeInTheDocument();
  });
});
