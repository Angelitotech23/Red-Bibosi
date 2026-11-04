# Red Bibosi — registro de ciclos de revisión de diseño

## Sistema de diseño (tokens)

Definidos en `app/(web)/web.css` como variables CSS (`--color-*`, `--space-*`, `--text-*`, `--duration-*`, `--ease-*`). Modo oscuro vía `prefers-color-scheme` y `[data-theme="dark"]`.

| Grupo | Tokens clave |
|-------|----------------|
| Color | `--color-brand`, `--color-accent` (único acento de acción), `--color-ink` / muted / subtle, superficies, peligro/ok |
| Categoría | `--cat-robos`, `--cat-peligro`, `--cat-locales` (solo indicador) |
| Tipo | Fraunces (display) + Outfit (cuerpo); pesos 400/500/600/700 |
| Espacio | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 |
| Radios | 8 / 12 / pill |
| Sombras | `--shadow-sm`, `--shadow-md` (ligeras) |
| Motion | `--ease-out` `cubic-bezier(0.2,0,0,1)`, `--ease-in` `cubic-bezier(0.4,0,1,1)`, 150 / 180 / 200 ms |

---

## Ciclo 1 — Hallazgos / Correcciones / Pendiente

**Hallazgos:** feed sin jerarquía Reddit; filtros en `<select>`; voto solo decorativo; header sin búsqueda ni CTA claro; sin skeletons; tokens incompletos y sin dark mode.

**Correcciones:** tokens completos; `CommunityFeed` + `ReportCard` + `FilterChips` + `VoteControl`; header con búsqueda y «Nueva denuncia»; skeletons; motion CSS; dark mode.

**Pendiente:** capturas 360/768/1440 y crítica visual.

---

## Ciclo 2 — Hallazgos / Correcciones / Pendiente

**Hallazgos:** CTA «Nueva denuncia» duplicado (header + hero); etiquetas de categoría encima del título (rompe jerarquía título > categoría); labels de chips ocupan espacio en 360; nav ausente en móvil; muted cerca del límite AA.

**Correcciones:** hero sin CTA de publicación (queda «Ver denuncias» + «Mapa»); título primero en tarjeta; labels de chips sr-only en móvil; nav compacta bajo header; contraste de muted/subtle subido.

**Pendiente:** re-captura post-fix y checklist a11y.

---

## Ciclo 3 — Hallazgos / Correcciones / Pendiente

**Hallazgos:** tras correcciones, jerarquía y CTA únicos correctos; voto abajo en móvil / izquierda en ≥768; chips con scroll horizontal sin barra; sin overflow de página.

**Correcciones:** ajustes menores de padding del hero y orden del header flex.

**Pendiente:** menú de distritos más denso en SCZ real (datos); búsqueda server-side cuando el feed crezca.

---

## Animaciones implementadas

| Animación | Propósito | Duración / curva |
|-----------|-----------|------------------|
| `rise-in` en tarjetas (stagger ≤6 × 50 ms) | Orientar entrada del feed | 400 ms, ease-out |
| `vote-pop` en botón | Confirmar voto | 180 ms, ease-out |
| `count-up` / `count-down` | Feedback del contador | 180 ms, ease-out |
| `feed-stage.is-filtering` | Transición de filtro sin salto | 200 ms, opacity + translateY |
| hover tarjeta / botón | Elevación / color | 150 ms |
| `confirm-card` | Destacar denuncia nueva | 550 ms, ease-out |
| `skeleton-shine` | Carga sin spinner | 1.2 s loop |
| `prefers-reduced-motion` | Accesibilidad | animaciones ~instantáneas |

Solo se animan `transform` y `opacity`.

---

## Checklist final de accesibilidad

- [x] Contraste texto normal ≥ AA (ink / muted / subtle sobre superficie)
- [x] `:focus-visible` 3 px en controles interactivos
- [x] Objetivos táctiles ≥ 44×44 (chips, botones, voto)
- [x] `prefers-reduced-motion` respetado
- [x] Skip link + landmarks (`header` / `main` / `nav` / `search`)
- [x] Badges con texto, no solo color
- [x] Orden de lectura: marca → nav → búsqueda → CTA → feed
