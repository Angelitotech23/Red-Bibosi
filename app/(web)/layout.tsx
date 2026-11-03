import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import "./web.css";

/** Layout del frontend público — dominio Agente C. */
export default function WebLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" className="web-main">
        {children}
      </main>
    </>
  );
}
