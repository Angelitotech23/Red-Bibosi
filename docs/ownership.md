# Ownership — Cuadra

Reglas de dominio para trabajo en paralelo. **No editar archivos fuera de tu dominio** sin coordinación.

| Ruta | Agente | Responsabilidad |
|------|--------|-----------------|
| `supabase/migrations/` | **A** | Schema Postgres, enums, índices, triggers |
| `supabase/seed.sql` | **A** | Datos de demo (zonas SCZ, usuarios seed) |
| `tests/rls/` | **A** | Tests de Row Level Security |
| `app/api/` | **B** | Route handlers Next.js |
| `lib/server/` | **B** | Lógica de servidor, clientes Supabase service/SSR |
| `app/(web)/` | **C** | UI App Router (páginas, layouts) |
| `lib/client/` | **C** | Cliente Supabase browser + hooks |
| `components/` | **C** | Componentes React compartidos de UI |
| `docs/contracts.md` | **Coordinador** | Único escritor del contrato |
| `docs/ownership.md` | **Coordinador** | Este archivo |
| `lib/types.ts` | **Coordinador** | Tipos TS; A/B/C solo importan |
| `.github/workflows/ci.yml` | **Coordinador** | CI; no modificar sin avisar |

## Reglas

1. **Contrato primero.** Si necesitas un campo, endpoint o enum nuevo, propón cambio al coordinador; no merges schema/API divergente.
2. **Imports de tipos.** `import type { … } from "@/lib/types"` (o ruta relativa). Prohibido duplicar `PostStatus`, etc.
3. **Privacidad.** Agente B valida §4–§5 del contrato en handlers. Agente C no muestra coords exactas ni pide nombres propios en formularios.
4. **RLS.** Agente A alinea políticas con los roles y tablas del contrato; Agente B no bypasea RLS salvo service role justificado en server.
5. **Conflictos de merge.** Preferir archivos distintos; si hay overlap (p. ej. `package.json`), coordinador resuelve.
6. **CI.** Lint, typecheck y tests deben pasar en la rama antes de merge. No tocar `ci.yml` sin avisar al coordinador.
7. **Sin lógica cruzada.** A no implementa UI; B no escribe migraciones; C no escribe route handlers.

## Contacto de integración

- Cambios de contrato → issue / mensaje al coordinador con ID `C-XX` (ver `docs/contracts.md` §7).
- Bloqueos entre agentes → documentar en PR; no “arreglar” el dominio ajeno.
