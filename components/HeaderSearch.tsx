"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    if (pathname === "/inicio") {
      const next = new URLSearchParams(params.toString());
      if (query) next.set("q", query);
      else next.delete("q");
      const qs = next.toString();
      router.replace(qs ? `/inicio?${qs}` : "/inicio", { scroll: false });
      return;
    }
    router.push(query ? `/inicio?q=${encodeURIComponent(query)}` : "/inicio");
  }

  return (
    <form className="header-search" role="search" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="site-search">
        Buscar denuncias
      </label>
      <input
        id="site-search"
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar en el feed"
        autoComplete="off"
      />
    </form>
  );
}
