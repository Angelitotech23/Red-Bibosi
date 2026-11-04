"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

const LINKS = [
  { href: "/inicio", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/seguimiento", label: "Seguimiento" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    const qs = params.toString();
    router.push(qs ? `/inicio?${qs}` : "/inicio");
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/inicio" className="brand-mark">
          Bibosi<span>.</span>
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

        <form
          className="header-search"
          role="search"
          aria-label="Buscar denuncias"
          onSubmit={onSearch}
        >
          <svg
            className="header-search__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <label className="sr-only" htmlFor="header-search-input">
            Buscar denuncias
          </label>
          <input
            id="header-search-input"
            className="header-search__input"
            type="search"
            placeholder="Buscar en Santa Cruz…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        <div className="header-actions">
          <Link className="btn btn-accent" href="/publicar">
            Nueva denuncia
          </Link>
        </div>
      </div>
    </header>
  );
}
