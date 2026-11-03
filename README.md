# Red Bibosi

**Plataforma web comunitaria de denuncias ciudadanas y seguridad colaborativa** (estilo foro con votos y comentarios), orientada a **seguridad ciudadana y transparencia comunitaria** en Santa Cruz de la Sierra, Bolivia.

Nombre en producto del foro por zona: **Cuadra** (lo que corre hoy en este repo).

---

## 1. Contexto y visión

| Campo | Definición |
|-------|------------|
| **Nombre** | Red Bibosi |
| **Tipo** | Plataforma web comunitaria de denuncias y seguridad colaborativa |
| **Categoría** | Seguridad ciudadana y transparencia comunitarias |
| **Para quién** | Vecinos que necesitan alertar y enterarse a tiempo; instituciones que necesitan señales verificables |

### Problema

Faltan canales **directos**, con identidad protegida y **geolocalizados** (por barrio/zona) para alertar sobre inseguridad. La información sobre zonas peligrosas está dispersa, no estructurada o no llega a tiempo a los vecinos.

### Solución (arquitectura de producto)

#### A. Feed principal (foro central)

Discusiones categorizadas por alerta inmediata:

| Categoría de producto | Qué cubre | Cómo se modela hoy en código |
|-----------------------|-----------|------------------------------|
| **Alertas de maleantes y ladrones** | Modus operandi, vehículos sospechosos, avisos comunitarios | Tipos: `robo`, `acoso` (ver contrato) |
| **Zonas de peligro** | Poca iluminación, asaltos recurrentes, puntos ciegos | Casos por zona + **mapa agregado** (celdas, no domicilios) |
| **Locales y clubes nocturnos** | Ruido, peleas, venta irregular, incidentes en/fuera del local | `is_establishment` + tipos `convivencia_nocturna`, etc. **Gate:** evidencia o 3 reportes independientes antes de publicar |

#### B. Discusiones por zona (filtro geográfico)

- Secciones por barrio / distrito / avenida de referencia (`zones`).
- El usuario filtra denuncias de **su área** de residencia o trabajo.
- En lo **público** solo se muestran coordenadas de **grilla** (`grid_lat` / `grid_lng`). La ubicación exacta queda en `reports_private` (servidor / roles privilegiados).

Contrato técnico: [`docs/contracts.md`](docs/contracts.md) · Ownership: [`docs/ownership.md`](docs/ownership.md).

---

## 2. Validá la idea (sí / no)

Si marcás **no** en alguno, comentá en el PR: el repo se alinea a esta tabla.

| # | Afirmación | ¿OK? |
|---|------------|------|
| 1 | Red Bibosi es un **foro comunitario** de denuncias/seguridad (estilo Reddit: publicaciones, votos, comentarios), no una app de persecución en vivo. | |
| 2 | Hay **feed global** por categorías de alerta y **filtro por zona**. | |
| 3 | Categorías v1 de producto: maleantes/ladrones, zonas de peligro, locales/clubes nocturnos. | |
| 4 | Identidad pública = **pseudónimo** (no nombre legal). No se publican coords exactas. | |
| 5 | Locales/establecimientos requieren **evidencia o 3 reportes independientes** antes de publicarse. | |
| 6 | Stack fijo: **Next.js (App Router) + TypeScript en Vercel** y **Supabase** (Postgres, Auth, Storage privado, Realtime, RLS) + **GitHub Actions**. | |
| 7 | El nombre de UI del foro por zona es **Cuadra**; el repo/organización se llama **Red Bibosi**. | |

---

## 3. Stack y estructura (Fase 1 — hecha)

### Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js App Router, TypeScript, UI estilo foro (listados, votos, comentarios) |
| API | Route handlers en `app/api/` |
| Datos / Auth / Storage / Realtime | Supabase (Postgres + RLS; Storage privado para evidencia) |
| Hosting / CI | Vercel · GitHub Actions |

### Directorios

```text
app/(web)/          → UI Cuadra (inicio, zona, caso, publicar, mapa, seguimiento)
app/api/            → API (posts, votos, seguimiento, mapa)
components/         → Componentes de UI
lib/client/         → Cliente Supabase + API browser
lib/server/         → Lógica de servidor
lib/validation/     → Validación / PII
lib/types.ts        → Tipos compartidos (no redefinir)
supabase/           → Migraciones, seed, RLS
tests/              → Unit + RLS smoke
docs/               → Contratos, ownership, labels
.github/            → CI + plantillas issue/PR
```

### Seguridad de secretos (obligatorio)

- Variables solo en `.env` / `.env.local` (nunca en código).
- [`.gitignore`](.gitignore) ignora `.env*`, `node_modules`, builds, `.vercel`, etc.
- [`.env.example`](.env.example) documenta nombres de variables **sin valores reales**.
- Guía de reportes: [`SECURITY.md`](SECURITY.md).

---

## 4. Estado de módulos (Fase 2 — en curso)

| Módulo | Estado | Notas |
|--------|--------|-------|
| Feed / publicaciones | Parcial | Listado por zona, detalle de caso, publicar |
| Votos | Parcial | Corroboración (`value: 1`); **no** hay downvote tipo Reddit todavía |
| Comentarios | Parcial en contrato/API | Ampliar UX según prioridad |
| Categorías de denuncia | Parcial | Enums técnicos en contrato; mapear 1:1 a las 3 categorías de producto (pendiente de aprobación) |
| Filtro por zona | Hecho (base) | `zones` + páginas `/zona/[slug]` |
| Mapa agregado | Hecho (base) | Sin coords exactas |
| Seguimiento / autoridad | Hecho (base) | Código de follow-up |

Commits: `feat(web): …`, `feat(api): …`, `feat(data): …` en ramas `feat/…` → PR a `main`.

---

## 5. Checklist pre-push (Fase 3 — usar siempre)

Antes de cada `git push`:

```bash
git status
git diff --cached
# Confirmar: no hay .env, .env.local, claves, dumps ni evidence real
npm run lint && npm run typecheck && npm test
```

- [ ] Ningún secreto en el diff
- [ ] Ninguna coord exacta ni nombre propio en respuestas/UI públicas nuevas
- [ ] Rama ≠ force-push a `main`
- [ ] CI en mente: el workflow en `.github/workflows/ci.yml` corre lint, typecheck y tests

Despliegue: Vercel enlazado al repo (preview por PR; producción desde `main` cuando el owner lo active).

---

## 6. Arranque local y Git

```bash
git clone https://github.com/Angelitotech23/Red-Bibosi.git
cd Red-Bibosi
cp .env.example .env.local    # completar valores reales solo en local
npm install
npm run dev
```

Primera conexión / push seguro (si partís de cero en otra máquina):

```bash
git remote add origin https://github.com/Angelitotech23/Red-Bibosi.git
git checkout -b feat/mi-cambio
# …cambios…
git add -A
git status   # revisar que .env* NO esté staged
git commit -m "feat(web): descripción breve"
git push -u origin feat/mi-cambio
# abrir PR hacia main — no push directo a main con secretos
```

Más: [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## 7. Principios no negociables

1. **Privacidad por diseño** — sin lat/lng exactos ni nombres propios en lo público.
2. **Cero secretos en git.**
3. **Moderación por evidencia** en señalamientos a establecimientos.
4. **Transparencia de decisiones** — estados de caso visibles; contratos antes de improvisar schema/API.

---

## 8. Decisiones pendientes (idea vs código)

| Tema | Prompt de producto | Estado en repo | Acción |
|------|--------------------|----------------|--------|
| Nombre | Red Bibosi | README + repo GitHub | Alineado |
| Votos up/down | Estilo Reddit | Solo corroborar (`1`) | ¿Agregar downvote? Requiere contrato |
| 3 categorías de feed | Maleantes / Zonas peligro / Locales | 5 `incident_type` técnicos | Mapear o renombrar con OK |
| Anonimato | Canal anónimo | Pseudónimo + privados | Documentado así a propósito |
| Tracks Gov* | Un track seguridad+transparencia | README anterior listaba 4 Gov* | Este README prioriza la definición integrada; Gov* quedan como expansión futura |

---

Red Bibosi no es un muro de quejas sin reglas: es un foro comunitario donde la alerta llega a tiempo al vecino — y solo pesa cuando se puede defender.
