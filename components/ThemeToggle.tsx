"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function resolveTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  if (typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(resolveTheme());
    setReady(true);
  }, []);

  function toggle() {
    const next: Theme = resolveTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cuadra-theme", next);
    } catch {
      /* storage bloqueado */
    }
    setTheme(next);
  }

  const nextLabel =
    theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-label={ready ? nextLabel : "Cambiar tema"}
      title={ready ? nextLabel : "Cambiar tema"}
    >
      {theme === "dark" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M16.5 13.5A6.5 6.5 0 0 1 10.5 7c0-.4 0-.8.1-1.2A7.5 7.5 0 1 0 18.7 15c-.4.1-.8.1-1.2.1-.4 0-.7 0-1-.1Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
