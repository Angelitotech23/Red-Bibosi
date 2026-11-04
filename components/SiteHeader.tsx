"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { HeaderSearch } from "@/components/HeaderSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { href: "/inicio", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/seguimiento", label: "Seguimiento" },
] as const;

function SearchFallback() {
  return (
    <div className="header-search">
      <label className="sr-only" htmlFor="site-search-fallback">
        Buscar denuncias
      </label>
      <input
        id="site-search-fallback"
        type="search"
        placeholder="Buscar en el feed"
        disabled
      />
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/inicio" className="brand-mark">
          Cuadra<span>.</span>
        </Link>

        <Suspense fallback={<SearchFallback />}>
          <HeaderSearch />
        </Suspense>

        <nav aria-label="Principal" className="header-nav">
          <ul className="nav-links">
            {LINKS.map((link) => {
              const current =
                pathname === link.href ||
                (link.href !== "/inicio" && pathname.startsWith(link.href));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <Link className="btn btn-accent header-cta" href="/publicar">
            Nueva denuncia
          </Link>
        </div>
      </div>
    </header>
  );
}
