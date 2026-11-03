# Tests RLS — Agente A

Alineados a `docs/contracts.md` y al brief de datos/seguridad.

## En CI (`npm test`)

- `scenarios.test.ts` — cuatro escenarios obligatorios vía motor de políticas espejo:
  1. Leer `reports_private` → falla
  2. Editar post de otro usuario → falla
  3. Leer posts no publicados como anónimo → falla
  4. Votar dos veces → falla (`UNIQUE (post_id, user_id)`)
- También verifica que las migraciones declaran RLS, `round_grid`, vista pública y triggers.

## Contra Postgres real

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/rls/rls_live.sql
```

Requiere migraciones aplicadas y, para JWT/roles, un proyecto Supabase local.
El script en CI no abre una base real (sin secretos ni credenciales en el repo).
