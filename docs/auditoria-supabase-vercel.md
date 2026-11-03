# Auditoría: contradicciones Supabase ↔ Vercel — Red Bibosi

**Rol:** Arquitecto senior + auditoría de ciberseguridad  
**Alcance:** diseño y código actual del repo (lectura), vs pilares: anonimato total, acceso libre de lectura, feed + zonas SCZ.  
**Fecha:** 2026-11-03 (America/La_Paz)

---

## 1. Dictamen general

**El diseño NO está libre de contradicciones críticas.**

Hay aciertos importantes (coords exactas fuera de lo público, `reports_private` denegado por RLS, `SERVICE_ROLE` sin prefijo `NEXT_PUBLIC_`, índices por `zone_id`).  
Pero el producto declarado (**lectura libre + denuncias 100% anónimas**) **choca** con el contrato/código actual (**auth obligatoria para publicar**, **pseudónimo/author_id visibles**, **feed público solo tras estados avanzados**, **GET de listado incompleto en API**).

**Veredicto:** no desplegar a producción como “foro anónimo de acceso libre” hasta cerrar los conflictos C1–C5. El resto (C6–C10) son brechas altas/medias a planificar antes o en el primer sprint post-MVP.

---

## 2. Matriz de conflictos detectados

| ID | Severidad | Contradicción |
|----|-----------|---------------|
| **C1** | Crítica | **Anonimato total vs identidad en schema/API.** El producto exige cero datos personales y denuncias anónimas. La vista `posts_public` expone `author_id` + `author_pseudonym`; `profiles` son SELECT públicos; mocks/UI muestran pseudónimos. Un pseudónimo estable + patrón de posts **reidentifica**. |
| **C2** | Crítica | **Publicar anónimo vs `requireAuth`.** `POST /api/posts` exige sesión (`requireAuth`). RLS `posts_insert_auth` solo para rol `authenticated`. No hay flujo documentado de *Anonymous Sign-In* sin email/teléfono. Hoy “crear reporte anónimo seguro” **no está implementado** como acceso sin registro. |
| **C3** | Crítica | **Acceso libre de lectura vs API/RLS de feed.** El cliente llama `GET /api/posts`, pero `app/api/posts/route.ts` **solo define POST**. En modo `live`, un 405 no cae al fallback mock (solo 404) → feed roto o inconsistente. Además RLS/`posts_public` solo muestran `status ∈ {corroborado, derivado, resuelto}` + `publish_gate = published`: los casos `reportado` / `en_verificacion` **no son visibles** al anónimo. |
| **C4** | Alta | **Service role en el camino caliente.** `getSupabaseAdmin()` (bypasa RLS) se usa en auth (`getUser` + lectura de profile) y en creación de posts (zonas, `follow_up_codes`). Correcto que la key no sea `NEXT_PUBLIC_`, pero **cualquier bug en un route handler = acceso total a DB**. Mezclar admin + user client aumenta superficie. |
| **C5** | Alta | **Backdoor de desarrollo.** `X-Mock-User-Id` aceptado cuando Supabase no está configurado; el cliente **siempre** envía ese header (`lib/client/api.ts`). Si en Vercel faltan env vars de Supabase, la app queda en modo mock-auth exploitable. |
| **C6** | Alta | **Categorías UI vs enum DB.** Producto: Maleantes/Robos · Peligro/Alumbrado · Boliches. DB: `robo\|acoso\|vandalismo\|consumo_via_publica\|convivencia_nocturna`. No hay tabla `categories` ni mapeo oficial → filtros del feed global no coinciden con el brief. |
| **C7** | Media | **Urgencia Reddit vs modelo de votos.** UI/producto: votos para visibilidad. DB: `votes.value` solo `1` (corroborar), sin downvote ni score denormalizado. No hay índice/`vote_count` materializado para `ORDER BY` eficiente en Serverless (solo función `vote_count` en vista). |
| **C8** | Media | **Grilla ~11 m vs anonimato de ubicación.** `GRID_DECIMALS = 4` ≈ 11 m. Con pocos posts en una celda, un lector local puede inferir el lugar. El mapa aplica k≥5, pero el **detalle de post** sigue exponiendo `grid_lat/lng` individuales. |
| **C9** | Media | **IP en rate limit.** `getClientIp` usa `x-forwarded-for` en memoria (no persistido hoy). En Vercel multi-instancia el límite no es fiable; si más adelante se loguea IP en DB/Analytics “para abuso”, choca con anonimato total salvo retención mínima y base legal. |
| **C10** | Baja–Media | **CORS / orígenes.** No hay headers de seguridad en `next.config.ts`. El browser usa mismo origen → API Next (bien). Realtime/`supabase-js` en browser habla directo a Supabase: si **Allowed Origins** / Auth redirect URLs en el dashboard no incluyen el dominio Vercel, Auth/Realtime fallan o se abren de más. No es un choque de código, es **punto ciego de configuración**. |
| **C11** | Baja | **Nombres de tablas.** Brief habla de `reports`/`categories`; repo usa `posts`/`incident_type`. No es fallo de seguridad; sí de onboarding. |
| **C12** | Media | **Zonas SCZ.** Seed tiene Equipetrol, Plan 3000, Urubó acceso, etc.; faltan explícitos Radial 26, Villa 1º de Mayo, 4to Anillo. Índices `(zone_id, created_at)` OK para filtro; no hay cuello evidente **si** las queries van indexadas y paginadas (hoy falta GET listado). |

### Lo que SÍ está bien alineado

- `reports_private` con política deny-all para `anon`/`authenticated`.  
- `follow_up_codes` no listables; hash del código.  
- `SUPABASE_SERVICE_ROLE_KEY` sin `NEXT_PUBLIC_` en `.env.example` y solo en `lib/server/`.  
- Cliente browser solo URL + anon key.  
- Strip de metadatos EXIF en evidencia (`sharp`).  
- Validación PII en texto (`lib/validation/pii.ts`).  
- Vista `posts_public` con `security_invoker = true` (no bypasea RLS por defecto de vistas).

---

## 3. Acciones correctivas (antes de construir/desplegar en serio)

### P0 — Bloquean el relato de producto

1. **Definir “anónimo” de forma operativa**  
   - Opción recomendada:  
     - Lectura: `anon` sin login.  
     - Alta de reporte: Supabase **Anonymous Sign-In** (UUID opaco) **o** inserción solo vía RPC `SECURITY DEFINER` sin devolver `author_id`.  
     - Vista pública: **eliminar** `author_id` y `author_pseudonym` de `posts_public` y de `PostPublic` en API.  
   - Pseudónimo solo para moderadores/autoridades, nunca en feed ciudadano.

2. **Implementar `GET /api/posts` y `GET /api/posts/[id]`** (y `/api/zones`) sin auth, leyendo solo capa pública; paginación `limit≤50` + `cursor` sobre índice `(zone_id, created_at desc)`.

3. **Alinear RLS de lectura con el producto**  
   - Si el feed debe mostrar denuncias recién publicadas: incluir `reportado` / `en_verificacion` con `publish_gate = published` (y gate de establecimientos).  
   - Si se mantiene el filtro actual a “solo corroborados”, **cambiar el README/producto** (ya no es “ver denuncias al instante”).

4. **Cerrar el backdoor mock**  
   - Ignorar `X-Mock-User-Id` salvo `NODE_ENV=development` **y** flag explícito.  
   - En Vercel Production: fallar arranque si falta `SUPABASE_SERVICE_ROLE_KEY` cuando `API_MODE=live`.

### P1 — Seguridad y despliegue

5. **Minimizar service role**  
   - Validar JWT con cliente anon + `auth.getUser(jwt)` o `@supabase/ssr`.  
   - Inserts privilegiados (`follow_up_codes`) solo en RPC definer, no desde admin genérico en el handler.

6. **Supabase Dashboard (checklist)**  
   - Anonymous Sign-Ins ON si se elige ese modelo.  
   - Auth URL allow-list = dominios Vercel.  
   - Desactivar capturas de PII innecesarias en Auth providers.  
   - Storage bucket `evidence` privado; sin policies de lectura para `anon`.

7. **Vercel**  
   - Env como §4.  
   - No exponer Preview con service role a forks públicos sin protección.  
   - Sustituir rate limit in-memory por Upstash/Redis (C-04) antes de tráfico real.

### P2 — Producto / performance

8. Mapear 3 categorías de UI ↔ enums (o tabla `feed_category`).  
9. Decidir votos: score de urgencia vs solo corroboración; columna `vote_score` indexada si hay orden Reddit.  
10. Revisar precisión de grilla (C-01) y/o ocultar grilla en detalle hasta k≥N.  
11. Completar seed de zonas del brief (Radial 26, Villa 1º de Mayo, 4to Anillo, …).

---

## 4. Variables de entorno seguras (Vercel)

### Permitidas en el proyecto Vercel

| Variable | Ámbito Vercel | ¿Llega al browser? | Uso |
|----------|---------------|--------------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | **Sí** | Cliente + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem | **Sí** | RLS como `anon` / user JWT |
| `NEXT_PUBLIC_APP_URL` | idem | **Sí** | Links canónicos / redirects |
| `NEXT_PUBLIC_API_MODE` | opcional (`live`\|`mock`) | **Sí** | Solo si se acepta el riesgo; en prod preferir `live` fijo en código |
| `SUPABASE_SERVICE_ROLE_KEY` | Production / Preview | **NO** (sin `NEXT_PUBLIC_`) | Solo `lib/server/**` |
| `SUPABASE_URL` | opcional (alias server) | **NO** | Si se usa, no duplicar en client |

### Prohibidas / errores fatales

- Cualquier `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE*`  
- Pegar service role en README, issues, o `lib/client/**`  
- Commitear `.env.local`

### Estructura recomendada en Vercel UI

```text
Production
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon)
  NEXT_PUBLIC_APP_URL=https://red-bibosi.vercel.app
  SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role)   ← Sensitive / Encrypted

Preview
  (mismas keys de un proyecto Supabase de staging, NO prod service_role si el repo es público)
```

### Regla de oro

```text
Browser  →  solo anon key
Server (Route Handler / Server Action)  →  puede usar service role
Edge Middleware público  →  evitar service role
```

---

## 5. Resumen ejecutivo

| Pregunta del brief | Respuesta |
|--------------------|-----------|
| ¿RLS permite anónimo sin email y bloquea abuso? | **Parcial / contradictorio:** insert exige `authenticated`; profiles/pseudónimo; no hay política clara de anon sign-in. Abuso parcialmente mitigado por rate limit frágil. |
| ¿Riesgo de filtrar service role al cliente Vercel? | **Diseño actual: bajo** si se respetan env vars. **Operacional: alto** si alguien añade `NEXT_PUBLIC_` o usa admin en client por error. Uso intenso de admin en API amplifica impacto de un bug. |
| ¿Schema soporta feed global + zonas sin cuellos? | **Zonas: sí (índices).** Feed por urgencia/votos y categorías de producto: **aún no.** Falta GET listado + modelo de score/categorías. |
| ¿CORS Vercel vs Supabase? | **Sin choque en código same-origin.** Riesgo en **configuración de orígenes Auth/Realtime** del dashboard Supabase. |

**Conclusión:** arquitectura base aprovechable, pero **no coherente aún** con “anonimato total + acceso libre”. Corregir C1–C5 antes de marketing/despliegue productivo.
