import { ZoneList } from "@/components/ZoneList";

export default function InicioPage() {
  return (
    <div>
      <section className="hero-block" aria-labelledby="brand-hero">
        <h1 id="brand-hero">Cuadra</h1>
        <p>
          Foro ciudadano de seguridad y convivencia por zona en Santa Cruz.
          Elige tu barrio para ver y publicar casos.
        </p>
      </section>

      <section aria-labelledby="zonas-title">
        <div className="section-head">
          <h2 id="zonas-title">Zonas</h2>
        </div>
        <ZoneList />
      </section>
    </div>
  );
}
