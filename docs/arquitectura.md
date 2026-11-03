# Arquitectura — Red Bibosi

## Objetivo de diseño

Foro público de lectura abierta + reportes anónimos por zona en Santa Cruz, con mapa agregado y secretos fuera del git.

## Stack

| Pieza | Elección | Motivo |
|-------|----------|--------|
| Frontend | Next.js App Router + TypeScript | SSR/CSR, rutas claras, deploy Vercel |
| API | Route handlers `app/api` | Mismo deploy; control de privacidad server-side |
| DB / Auth / Storage / Realtime | Supabase | Postgres + RLS + Storage privado + canales |
| CI | GitHub Actions | lint, typecheck, tests en cada PR |
| Hosting | Vercel | Preview por rama |

## Módulos

| Módulo | Responsabilidad | Rutas / carpetas |
|--------|-----------------|------------------|
| Feed global | Listar/filtrar por categoría | `app/(web)/inicio`, `components/CaseThreadList` |
| Zonas | Filtro barrio/distrito | `app/(web)/zona/[slug]`, `zones` en DB |
| Publicar | Alta anónima + follow-up code | `app/(web)/publicar`, `POST /api/posts` |
| Votos | Visibilidad / corroboración | `POST /api/posts/:id/votes` |
| Mapa | Agregados sin pin exacto | `app/(web)/mapa`, `GET /api/map` |
| Seguimiento | Código sin exponer identidad | `app/(web)/seguimiento` |
| Privacidad | PII, grilla, evidencia | `lib/validation`, `lib/server/grid`, Storage |

## Límites de confianza

```text
Browser (sin secretos de servicio)
    → API Next (anon key / cookie; service role SOLO server)
        → Supabase RLS
            → reports_private / evidence: roles privilegiados
```

- `NEXT_PUBLIC_*` = solo URL y anon/publishable key.  
- `SUPABASE_SERVICE_ROLE_KEY` = **nunca** en el cliente ni en el README con valor.

## Despliegue limpio

1. Repo en GitHub (este).  
2. Proyecto Supabase: aplicar `supabase/migrations`, seed de zonas SCZ.  
3. Vercel: importar repo; pegar env desde `.env.example` (valores reales solo en el panel).  
4. PR → Preview; merge a `main` → Production.  
5. Cada avance: rama `feat/…`, Conventional Commit, checklist de secretos del README.

## Evolución pendiente (contrato)

Ver sección 6 del README: anonimato total en UI, mapeo de 3 categorías, modelo de votos Reddit, catálogo ampliado de zonas.
