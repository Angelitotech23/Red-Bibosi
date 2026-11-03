import { Suspense } from "react";
import { LoadingState } from "@/components/LoadingState";
import { PublishPageClient } from "@/components/PublishPageClient";

export default function PublicarPage() {
  return (
    <div className="page-narrow">
      <div className="section-head">
        <div>
          <h1>Publicar caso</h1>
          <p className="muted" style={{ margin: "0.35rem 0 0" }}>
            Cuenta lo ocurrido sin nombres propios. La ubicación exacta solo
            viaja al servidor.
          </p>
        </div>
      </div>
      <Suspense fallback={<LoadingState label="Cargando formulario…" />}>
        <PublishPageClient />
      </Suspense>
    </div>
  );
}
