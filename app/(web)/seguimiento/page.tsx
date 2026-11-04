import { FollowUpLookup } from "@/components/FollowUpLookup";

export default function SeguimientoPage() {
  return (
    <div>
      <div className="section-head page-narrow">
        <div>
          <h1>Seguimiento</h1>
          <p className="lede">
            Consulta el estado de tu caso con el código. No necesitas iniciar
            sesión.
          </p>
        </div>
      </div>
      <FollowUpLookup />
    </div>
  );
}
