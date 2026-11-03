# Etiquetas sugeridas — RED Bibosi

Fuente de verdad de labels. Crear con `gh label create` si faltan; **no borrar** las existentes de GitHub.

## Tracks

| Label | Color | Descripción |
|-------|-------|-------------|
| `track:gov-risk` | `#B60205` | GovRisk — riesgos y emergencias |
| `track:gov-transparency` | `#0E8A16` | GovTransparency — transparencia departamental |
| `track:gov-health` | `#1D76DB` | GovHealth — salud departamental |
| `track:gov-security` | `#5319E7` | GovSecurity — seguridad ciudadana (Cuadra) |

## Tipo

| Label | Color | Descripción |
|-------|-------|-------------|
| `type:bug` | `#d73a4a` | Defecto |
| `type:feat` | `#a2eeef` | Capacidad nueva |
| `type:chore` | `#cfd3d7` | Orden / tooling |
| `type:docs` | `#0075ca` | Documentación |
| `type:security` | `#000000` | Seguridad / privacidad |

## Dominio técnico

| Label | Color | Descripción |
|-------|-------|-------------|
| `area:data` | `#FBCA04` | supabase, RLS, migraciones |
| `area:api` | `#F9D0C4` | app/api, lib/server |
| `area:web` | `#C2E0C6` | UI, components, lib/client |
| `area:ci` | `#BFDADC` | GitHub Actions / DX |

## Prioridad y estado

| Label | Color | Descripción |
|-------|-------|-------------|
| `priority:now` | `#B60205` | Ahora |
| `priority:next` | `#D93F0B` | Próximos 3 meses |
| `priority:later` | `#FEF2C0` | Horizonte 12 meses |
| `needs:contract` | `#E99695` | Requiere cambio de contrato C-XX |
| `needs:approval` | `#D4C5F9` | Acción irreversible pendiente de OK |

## Notas

- Las labels nativas de GitHub (`bug`, `enhancement`, `documentation`, …) se mantienen.
- Preferir `type:*` + `track:*` + `area:*` en issues nuevos.
