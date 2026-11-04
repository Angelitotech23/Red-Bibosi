import { MapPageClient } from "@/components/MapPageClient";

export default function MapaPage() {
  return (
    <div>
      <div className="section-head">
        <div>
          <h1>Mapa</h1>
          <p className="lede">
            Santa Cruz de la Sierra, con conteo agregado por celda y tipo. Sin
            marcadores individuales ni coordenadas exactas.
          </p>
        </div>
      </div>
      <p className="demo-banner" role="status">
        Vista de demostración con casos inventados. El mapa es de la ciudad; los
        puntos son celdas agregadas, no direcciones exactas.
      </p>
      <MapPageClient />
    </div>
  );
}
