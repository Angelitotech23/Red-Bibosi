import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/SiteHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { LocationPicker } from "@/components/LocationPicker";

vi.mock("next/navigation", () => ({
  usePathname: () => "/inicio",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("accesibilidad básica", () => {
  it("el encabezado expone navegación, búsqueda y creación", () => {
    render(<SiteHeader />);
    expect(
      screen.getByRole("navigation", { name: /principal/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cuadra/i })).toHaveAttribute(
      "href",
      "/inicio",
    );
    expect(screen.getByRole("link", { name: /^inicio$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /nueva denuncia/i }),
    ).toHaveAttribute("href", "/publicar");
    expect(screen.getByRole("button", { name: /modo/i })).toBeInTheDocument();
  });

  it("el badge de estado es texto legible, no solo color", () => {
    render(<StatusBadge status="en_verificacion" />);
    expect(screen.getByText(/en verificación/i)).toBeInTheDocument();
  });

  it("el mapa de ubicación es operable por teclado", () => {
    const onChange = vi.fn();
    render(
      <LocationPicker
        value={{ lat: -17.78, lng: -63.18 }}
        onChange={onChange}
      />,
    );
    const map = screen.getByRole("application");
    expect(map).toHaveAttribute("tabindex", "0");
    expect(
      screen.getByText(/ubicación precisa solo se envía al servidor/i),
    ).toBeInTheDocument();
  });
});
