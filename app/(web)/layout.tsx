import type { ReactNode } from "react";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import "./web.css";

/** Layout del frontend público — dominio Agente C. */
export default function WebLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Suspense
        fallback={
          <header className="site-header">
            <div className="site-header__inner">
              <span className="brand-mark">
                Bibosi<span>.</span>
              </span>
            </div>
          </header>
        }
      >
        <SiteHeader />
      </Suspense>
      <main id="contenido" className="web-main">
        {children}
      </main>
    </>
  );
}
