import { MapPageClient } from "@/components/MapPageClient";

export default function MapaPage() {
  return (
    <div>
      <div className="section-head">
        <div>
          <h1>Mapa</h1>
          <p className="muted" style={{ margin: "0.35rem 0 0" }}>
            Conteo agregado por celda y tipo. Sin marcadores individuales.
          </p>
        </div>
      </div>
      <MapPageClient />
    </div>
  );
}
