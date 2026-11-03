# Limpieza pendiente (requiere aprobación)

**No ejecutar** borrado de ramas, cierre de PRs, ni reescritura de historial hasta OK explícito.

Auditoría de referencia: 2026-11-03 (America/La_Paz).

## PRs

| PR | Estado | Propuesta | Motivo |
|----|--------|-----------|--------|
| [#2](https://github.com/Angelitotech23/Red-Bibosi/pull/2) `feat(data): esquema, RLS…` | OPEN | **Cerrar** (sin merge) tras confirmar | El schema/RLS ya está en `main` (`76a1963` y siguientes). La rama `cursor/feat-data-0dfb` parece rezagada respecto a lo mergeado por otras vías. |

## Ramas remotas candidatas a borrar

| Rama | Tip | Propuesta | Motivo |
|------|-----|-----------|--------|
| `cursor/cuadra-base-contratos-c038` | `0116bbd` | Borrar | PR #1 ya mergeado; tip ancestral de `main`. |
| `cursor/feat-web-94ca` | `f9a0d23` | Borrar | Mismo commit que `main`; rama de entrega ya integrada. |
| `feat/api` | `af4240d` | Borrar | Commits de API ya presentes en historial de `main`. |
| `cursor/feat-data-0dfb` | `d93f60c` | Borrar **después** de cerrar PR #2 | Asociada al PR abierto; no borrar mientras el PR viva. |

## Acciones NO propuestas aquí

- Force-push a cualquier rama
- Borrar tags/releases (no hay)
- Cambiar visibilidad del repo
- Renombrar el repositorio
- Eliminar archivos de producto en `app/`, `lib/`, `supabase/`

## Otros pendientes de gobierno

| Ítem | Propuesta | Requiere OK |
|------|-----------|-------------|
| `LICENSE` ausente | Elegir licencia (p. ej. MIT o Apache-2.0) y añadir archivo | **Sí** — decisión legal |
| Descripción/topics del repo | El token del agente recibió **403** al ejecutar `gh repo edit`. El owner debe correr el comando abajo. | Reversible |
| Labels nuevas | Mismo **403** con `gh label create`. Crear desde `docs/labels.md` con el owner. | Reversible |

### Comandos para el owner (descripción, topics, labels)

```bash
gh repo edit Angelitotech23/Red-Bibosi \
  --description "Plataforma de innovación cívica para Santa Cruz de la Sierra (GovRisk, GovTransparency, GovHealth, GovSecurity). Producto actual: Cuadra." \
  --add-topic santa-cruz --add-topic bolivia --add-topic civic-tech \
  --add-topic nextjs --add-topic supabase --add-topic govsecurity --add-topic transparencia
```

Labels: seguir la tabla de [`docs/labels.md`](labels.md) (`gh label create …`); no borrar labels existentes.

## Cómo aprobar

Responde en el PR o en issue con: `OK limpieza: cerrar PR #2; borrar ramas X, Y, Z` (lista explícita). Sin esa frase, no se ejecuta.
