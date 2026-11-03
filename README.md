# Cuadra

Foro ciudadano de casos de seguridad y convivencia por zona en Santa Cruz, Bolivia.

## Stack

- Next.js (App Router) · Vercel
- Supabase (Postgres, Auth, Storage, Realtime, RLS)
- GitHub Actions

## Documentos de coordinación

- [`docs/contracts.md`](docs/contracts.md) — tablas, enums, API, privacidad (solo coordinador)
- [`docs/ownership.md`](docs/ownership.md) — dominio por agente (A / B / C)
- [`lib/types.ts`](lib/types.ts) — tipos TypeScript compartidos

## Agentes

| Agente | Dominio |
|--------|---------|
| A | `supabase/`, `tests/rls/` |
| B | `app/api/`, `lib/server/` |
| C | `app/(web)/`, `lib/client/`, `components/` |

## Scripts

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run dev
```
