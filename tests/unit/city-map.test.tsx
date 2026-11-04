import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AggregatedMap } from "@/components/AggregatedMap";
import { CityMap } from "@/components/CityMap";

describe("mapa de la ciudad", () => {
  it("muestra celdas agregadas y aviso de privacidad", () => {
    render(
      <AggregatedMap
        cells={[
          {
            grid_lat: -17.7833,
            grid_lng: -63.1821,
            total: 3,
            by_type: { robo: 2, acoso: 1 },
          },
        ]}
      />,
    );

    expect(
      screen.getByLabelText(/santa cruz de la sierra/i),
    ).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(
      screen.getByText(/conteos por celda agregada/i),
    ).toBeInTheDocument();
    expect(screen.getByText("5+")).toBeInTheDocument();
  });

  it("en modo selección no revela coordenadas", () => {
    render(
      <CityMap
        labelledBy="pick-label"
        pick={{
          value: { lat: -17.78, lng: -63.18 },
          onChange: () => undefined,
        }}
      />,
    );

    expect(screen.getByRole("application")).toBeInTheDocument();
    expect(screen.queryByText(/-17\.78/)).not.toBeInTheDocument();
    expect(screen.queryByText(/-63\.18/)).not.toBeInTheDocument();
  });
});
