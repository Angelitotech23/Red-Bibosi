"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/inicio", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/publicar", label: "Publicar" },
  { href: "/seguimiento", label: "Seguimiento" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/inicio" className="brand-mark">
          Cuadra<span>.</span>
        </Link>
        <nav aria-label="Principal">
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
      </div>
    </header>
  );
}
