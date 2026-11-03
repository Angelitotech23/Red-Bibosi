# Limpieza del repositorio

Auditoría de referencia: 2026-11-03 (America/La_Paz).

## Ejecutado (aprobación explícita)

Aprobación recibida:

`OK limpieza: cerrar PR #2; borrar ramas cursor/cuadra-base-contratos-c038, cursor/feat-web-94ca, feat/api, cursor/feat-data-0dfb`

| Acción | Resultado |
|--------|-----------|
| Cerrar [PR #2](https://github.com/Angelitotech23/Red-Bibosi/pull/2) sin merge | **Hecho** (CLOSED) |
| Borrar `origin/cursor/cuadra-base-contratos-c038` | **Hecho** |
| Borrar `origin/cursor/feat-web-94ca` | **Hecho** |
| Borrar `origin/feat/api` | **Hecho** |
| Borrar `origin/cursor/feat-data-0dfb` | **Hecho** |

`main` no se modificó. No hubo force-push ni cambios de visibilidad/nombre del repo.

## Pendiente (sigue requiriendo owner / OK)

| Ítem | Propuesta | Requiere OK |
|------|-----------|-------------|
| `LICENSE` ausente | Elegir licencia (p. ej. MIT o Apache-2.0) | **Sí** — decisión legal |
| Descripción/topics del repo | `gh repo edit` (403 con token del agente) | Reversible — owner |
| Labels nuevas | Crear desde [`docs/labels.md`](labels.md) (403 con token del agente) | Reversible — owner |

### Comandos para el owner

```bash
gh repo edit Angelitotech23/Red-Bibosi \
  --description "Plataforma de innovación cívica para Santa Cruz de la Sierra (GovRisk, GovTransparency, GovHealth, GovSecurity). Producto actual: Cuadra." \
  --add-topic santa-cruz --add-topic bolivia --add-topic civic-tech \
  --add-topic nextjs --add-topic supabase --add-topic govsecurity --add-topic transparencia
```

Labels: seguir [`docs/labels.md`](labels.md); no borrar labels existentes.
