## Qué cambia

<!-- 1–3 bullets. Decisiones, no narrativa. -->

## Track / producto

- [ ] GovSecurity — Cuadra
- [ ] GovRisk
- [ ] GovTransparency
- [ ] GovHealth
- [ ] Plataforma / DX (CI, docs, tooling)

## Dominio tocado

- [ ] `supabase/` / `tests/rls/` (datos)
- [ ] `app/api/` / `lib/server/` (API)
- [ ] `app/(web)/` / `lib/client/` / `components/` (web)
- [ ] Contratos / ownership / CI (solo coordinador)

## Checklist

- [ ] Respeta `docs/contracts.md` y `docs/ownership.md`
- [ ] No introduce secretos, `.env*` reales ni claves
- [ ] No expone lat/lng exactos ni nombres propios en respuestas/UI públicas
- [ ] `npm run lint && npm run typecheck && npm test` pasan
- [ ] Si toca schema/API: actualiza o pide cambio de contrato

## Cómo probar

<!-- Pasos concretos o “N/A — solo docs”. -->

## Riesgos / follow-ups

<!-- Bloqueos, C-XX pendientes, o “ninguno”. -->
