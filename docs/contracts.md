# Contratos Cuadra

Documento compartido de contrato. **Solo el agente coordinador modifica este archivo.**  
Los agentes A, B y C consumen estos contratos; no redefinen tipos ni cambian esquemas sin aprobación.

Proyecto: foro ciudadano de casos de seguridad y convivencia por zona en Santa Cruz, Bolivia.  
Stack: Next.js (App Router) + Vercel · Supabase (Postgres, Auth, Storage, Realtime, RLS) · GitHub Actions.

---

## 1. Tablas

### 1.1 `zones`

Zonas geográficas de Santa Cruz (barrios / distritos de referencia).

| Columna     | Tipo         | Notas                                      |
|-------------|--------------|--------------------------------------------|
| `id`        | `uuid` PK    |                                            |
| `slug`      | `text` UNIQUE| Identificador estable (`plan_3000`, etc.)  |
| `name`      | `text`       | Nombre público                             |
| `bbox`      | `jsonb`      | Opcional: límites aproximados              |
| `created_at`| `timestamptz`| Default `now()`                            |

### 1.2 `profiles`

Perfil de usuario autenticado. Identidad pública = **pseudónimo** (nunca nombre legal).

| Columna      | Tipo         | Notas                                                |
|--------------|--------------|------------------------------------------------------|
| `id`         | `uuid` PK    | = `auth.users.id`                                    |
| `pseudonym`  | `text` UNIQUE| Visible en UI; único case-insensitive                |
| `role`       | `user_role`  | `ciudadano` \| `moderador` \| `autoridad` \| `admin` |
| `created_at` | `timestamptz`|                                                      |
| `updated_at` | `timestamptz`|                                                      |

### 1.3 `posts`

Publicaciones / reportes visibles (contenido público). Coordenadas **solo** en grilla redondeada.

| Columna      | Tipo              | Notas                                                                 |
|--------------|-------------------|-----------------------------------------------------------------------|
| `id`         | `uuid` PK         |                                                                       |
| `author_id`  | `uuid` FK → profiles | Nullable si anónimo técnico; preferir auth                         |
| `zone_id`    | `uuid` FK → zones | Obligatoria                                                           |
| `type`       | `incident_type`   | Ver §2.2                                                              |
| `status`     | `post_status`     | Ver §2.1; default `reportado`                                         |
| `title`      | `text`            | Sin nombres propios de personas/negocios (regla §4)                   |
| `body`       | `text`            | Idem                                                                  |
| `grid_lat`   | `numeric(8,4)`    | Latitud **redondeada** (p. ej. 4 decimales ≈ 11 m; política fija)     |
| `grid_lng`   | `numeric(8,4)`    | Longitud **redondeada**                                               |
| `is_establishment` | `boolean`   | Si el señalamiento apunta a un establecimiento                        |
| `publish_gate` | `publish_gate`  | `pending_evidence` \| `pending_corroboration` \| `published` (regla §5) |
| `created_at` | `timestamptz`     | Indexada desc                                                         |
| `updated_at` | `timestamptz`     |                                                                       |

Índices sugeridos: `(zone_id, created_at desc)`, `(status)`, `(type)`.

### 1.4 `reports_private`

Datos sensibles del reporte. **Nunca** se exponen en respuestas públicas ni al cliente anónimo.

| Columna         | Tipo         | Notas                                      |
|-----------------|--------------|--------------------------------------------|
| `post_id`       | `uuid` PK/FK | 1:1 con `posts`                            |
| `lat`           | `numeric`    | Coordenada **exacta**                      |
| `lng`           | `numeric`    | Coordenada **exacta**                      |
| `evidence_path` | `text`       | Path en Supabase Storage (bucket privado)  |
| `raw_notes`     | `text`       | Notas internas; no públicas                |
| `created_at`    | `timestamptz`|                                            |

Acceso: solo service role / moderadores / autoridades vía API server-side con RLS estricto.

### 1.5 `votes`

Voto único por usuario y post (corroboración ciudadana).

| Columna      | Tipo         | Notas                         |
|--------------|--------------|-------------------------------|
| `id`         | `uuid` PK    |                               |
| `post_id`    | `uuid` FK    |                               |
| `user_id`    | `uuid` FK    | → `profiles.id`               |
| `value`      | `smallint`   | `1` = corroborar (v1)         |
| `created_at` | `timestamptz`|                               |

Constraint: `UNIQUE (post_id, user_id)`.

### 1.6 `comments`

Comentarios públicos sobre un post.

| Columna      | Tipo         | Notas                                      |
|--------------|--------------|--------------------------------------------|
| `id`         | `uuid` PK    |                                            |
| `post_id`    | `uuid` FK    |                                            |
| `author_id`  | `uuid` FK    | → `profiles`                               |
| `body`       | `text`       | Sujeto a regla §4 (sin nombres propios)    |
| `created_at` | `timestamptz`|                                            |
| `deleted_at` | `timestamptz`| Soft delete                                |

### 1.7 `official_responses`

Respuestas de autoridades / instituciones.

| Columna        | Tipo         | Notas                                   |
|----------------|--------------|-----------------------------------------|
| `id`           | `uuid` PK    |                                         |
| `post_id`      | `uuid` FK    |                                         |
| `author_id`    | `uuid` FK    | `role` ∈ {`autoridad`, `admin`}         |
| `body`         | `text`       | Público; sin coords exactas (§4)        |
| `status_after` | `post_status`| Estado al que transiciona el post       |
| `created_at`   | `timestamptz`|                                         |

### 1.8 `follow_up_codes`

Códigos de seguimiento para el denunciante (sin exponer identidad).

| Columna      | Tipo         | Notas                                         |
|--------------|--------------|-----------------------------------------------|
| `id`         | `uuid` PK    |                                               |
| `post_id`    | `uuid` FK    |                                               |
| `code_hash`  | `text`       | Hash del código mostrado una sola vez         |
| `expires_at` | `timestamptz`|                                               |
| `created_at` | `timestamptz`|                                               |

El código en claro **nunca** se almacena ni se lista en APIs públicas.

### 1.9 `moderation_actions`

Auditoría de acciones de moderación.

| Columna       | Tipo         | Notas                                              |
|---------------|--------------|----------------------------------------------------|
| `id`          | `uuid` PK    |                                                    |
| `post_id`     | `uuid` FK    | Nullable si acción sobre comentario/usuario        |
| `target_type` | `text`       | `post` \| `comment` \| `user`                      |
| `target_id`   | `uuid`       |                                                    |
| `actor_id`    | `uuid` FK    | Moderador / admin                                  |
| `action`      | `mod_action` | `hide` \| `restore` \| `escalate` \| `reject_gate` \| `approve_gate` |
| `reason`      | `text`       |                                                    |
| `created_at`  | `timestamptz`|                                                    |

---

## 2. Enumeraciones

### 2.1 `post_status`

| Valor             | Significado                                      |
|-------------------|--------------------------------------------------|
| `reportado`       | Recién creado / publicado bajo gate              |
| `en_verificacion` | En revisión ciudadana o moderación               |
| `corroborado`     | Suficientes votos / evidencia comunitaria        |
| `derivado`        | Escalado a autoridad                             |
| `resuelto`        | Cierre positivo / atención confirmada            |
| `sin_respuesta`   | Sin atención en ventana de tiempo definida       |

### 2.2 `incident_type`

| Valor                   | Significado                    |
|-------------------------|--------------------------------|
| `robo`                  | Robo / hurto                   |
| `acoso`                 | Acoso en vía pública           |
| `vandalismo`            | Daño a propiedad / espacio     |
| `consumo_via_publica`   | Consumo problemático en vía    |
| `convivencia_nocturna`  | Ruido / convivencia nocturna   |

### 2.3 Otros enums

- `user_role`: `ciudadano` | `moderador` | `autoridad` | `admin`
- `publish_gate`: `pending_evidence` | `pending_corroboration` | `published`
- `mod_action`: `hide` | `restore` | `escalate` | `reject_gate` | `approve_gate`

---

## 3. Endpoints de API

Base: `/api`. Autenticación: sesión Supabase (cookie / Bearer).  
Todas las respuestas **públicas** cumplen §4 (sin `lat`/`lng` exactos ni nombres propios).

### Convención de error

```json
{ "error": { "code": "STRING_CODE", "message": "humano-legible" } }
```

Códigos HTTP usados: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`.

---

### `GET /api/zones`

- **Auth:** pública  
- **Entrada:** —  
- **Salida `200`:** `{ "zones": Zone[] }`  
- **Errores:** `500`

### `GET /api/posts`

- **Auth:** pública  
- **Entrada (query):** `zone_id?`, `type?`, `status?`, `cursor?`, `limit?` (max 50)  
- **Salida `200`:** `{ "posts": PostPublic[], "next_cursor": string | null }`  
- **Errores:** `400` (query inválida), `500`  
- **Notas:** Solo posts con `publish_gate = published`. Incluye `grid_lat`/`grid_lng`, **nunca** coords exactas.

### `GET /api/posts/:id`

- **Auth:** pública  
- **Salida `200`:** `{ "post": PostPublic }`  
- **Errores:** `404`, `500`

### `POST /api/posts`

- **Auth:** requerida (`ciudadano+`)  
- **Entrada:**  
  ```ts
  {
    zone_id: string
    type: IncidentType
    title: string
    body: string
    lat: number          // exacta; solo se guarda en reports_private
    lng: number
    is_establishment: boolean
    evidence?: File | null  // multipart o URL prefirmada previa
  }
  ```
- **Salida `201`:** `{ "post": PostPublic, "follow_up_code": string }`  
  (`follow_up_code` solo en esta respuesta; no se puede reconsultar en claro)  
- **Errores:**  
  - `401` no autenticado  
  - `400` / `422` validación (texto con PII detectada, zona inválida, coords fuera de bbox)  
  - `403` gate de establecimiento (§5)  
  - `429` rate limit  
  - `500`

### `POST /api/posts/:id/votes`

- **Auth:** requerida  
- **Entrada:** `{ "value": 1 }`  
- **Salida `201`:** `{ "vote": Vote, "post": PostPublic }` (post puede haber pasado a `corroborado`)  
- **Errores:** `401`, `404`, `409` (ya votó), `422`, `500`

### `GET /api/posts/:id/comments`

- **Auth:** pública  
- **Salida `200`:** `{ "comments": CommentPublic[] }`  
- **Errores:** `404`, `500`

### `POST /api/posts/:id/comments`

- **Auth:** requerida  
- **Entrada:** `{ "body": string }`  
- **Salida `201`:** `{ "comment": CommentPublic }`  
- **Errores:** `401`, `404`, `422` (PII / vacío), `429`, `500`

### `POST /api/posts/:id/official-responses`

- **Auth:** `autoridad` | `admin`  
- **Entrada:** `{ "body": string, "status_after": PostStatus }`  
- **Salida `201`:** `{ "response": OfficialResponsePublic, "post": PostPublic }`  
- **Errores:** `401`, `403`, `404`, `422`, `500`

### `POST /api/follow-up/lookup`

- **Auth:** pública (posee el código)  
- **Entrada:** `{ "code": string }`  
- **Salida `200`:** `{ "post": PostPublic }`  
- **Errores:** `400`, `404` (código inválido/expirado), `429`, `500`  
- **Notas:** No revela datos de `reports_private`.

### `POST /api/moderation/actions`

- **Auth:** `moderador` | `admin`  
- **Entrada:**  
  ```ts
  {
    target_type: "post" | "comment" | "user"
    target_id: string
    action: ModAction
    reason: string
    post_id?: string
  }
  ```
- **Salida `201`:** `{ "action": ModerationAction }`  
- **Errores:** `401`, `403`, `404`, `422`, `500`

### `GET /api/me`

- **Auth:** requerida  
- **Salida `200`:** `{ "profile": ProfilePublic }`  
- **Errores:** `401`, `500`

### `PATCH /api/me`

- **Auth:** requerida  
- **Entrada:** `{ "pseudonym"?: string }`  
- **Salida `200`:** `{ "profile": ProfilePublic }`  
- **Errores:** `401`, `409` (pseudónimo tomado), `422`, `500`

### Storage (no REST app, contrato)

- Bucket privado `evidence`: upload solo vía URL firmada emitida por `POST /api/posts` (o endpoint auxiliar futuro `POST /api/evidence/upload-url`).  
- Lectura: solo roles privilegiados vía server.

---

## 4. Regla de privacidad (obligatoria)

1. **Ninguna respuesta pública** incluye `lat` / `lng` exactos. Solo `grid_lat` / `grid_lng`.
2. **Ninguna respuesta pública** incluye nombres propios de personas o negocios en campos de texto libre (`title`, `body`, comentarios, respuestas oficiales).
3. `reports_private` y `evidence_path` solo vía server con RLS + rol adecuado.
4. Pseudónimos sí son públicos; identidad legal / email nunca en payloads de foro.
5. Validación server-side (y opcionalmente client hint) debe rechazar o redactar PII obvia (`422` con `code: "PII_NOT_ALLOWED"`).

---

## 5. Regla de establecimientos

Un señalamiento con `is_establishment = true` **no se publica** (`publish_gate != published`) hasta cumplir **al menos una** de:

1. Evidencia adjunta válida (`evidence_path` presente y no rechazada por moderación), **o**
2. **3 reportes independientes** (distintos `author_id`) que apunten al mismo establecimiento en la misma zona / celda de grilla y tipo, dentro de una ventana temporal (default 30 días; parametrizable).

Hasta entonces: `publish_gate` = `pending_evidence` o `pending_corroboration`; el post no aparece en listados públicos.  
Moderadores pueden `approve_gate` / `reject_gate` con registro en `moderation_actions`.

---

## 6. Tipos TypeScript

Fuente única: [`lib/types.ts`](../lib/types.ts).  
Agentes A, B y C **importan** desde ahí; no duplican interfaces ni enums.

---

## 7. Contratos pendientes de aprobación

Ver lista al final del resumen del coordinador; ítems marcados `PENDING_APPROVAL` en issues de seguimiento:

| ID | Tema | Estado |
|----|------|--------|
| C-01 | Precisión exacta de redondeo de grilla (4 vs 3 decimales) | PENDING_APPROVAL |
| C-02 | Ventana temporal de corroboración de establecimientos (default 30d) | PENDING_APPROVAL |
| C-03 | Definición operativa de “mismo establecimiento” (celda + zona + tipo vs hash de lugar) | PENDING_APPROVAL |
| C-04 | Rate limits numéricos por endpoint | PENDING_APPROVAL |
| C-05 | Política de soft-delete vs hard-delete de comentarios | PENDING_APPROVAL |
| C-06 | Emisión de `follow_up_code` también para posts gated no publicados | PENDING_APPROVAL |
| C-07 | Schema Realtime (canales por `zone_id`) | PENDING_APPROVAL |
| C-08 | Nombres de buckets Storage y retención de evidencia | PENDING_APPROVAL |

---

*Última actualización: coordinador · base hackathon Cuadra.*
