# Contribuir a RED Bibosi

Trabajamos en público con disciplina. Un PR limpio vale más que diez promesas.

## Antes de tocar código

1. Lee [`README.md`](README.md) (prioridades y principios).
2. Lee [`docs/contracts.md`](docs/contracts.md) y [`docs/ownership.md`](docs/ownership.md).
3. No redefines tipos: importa desde [`lib/types.ts`](lib/types.ts).
4. Si el cambio rompe o amplía el contrato, propón el cambio al coordinador **antes** de implementar.

## Ramas

| Prefijo | Uso |
|---------|-----|
| `feat/` | Nueva capacidad orientada a usuario o API |
| `fix/` | Corrección de defectos |
| `chore/` | Tooling, CI, orden del repo (sin cambio de producto) |
| `docs/` | Solo documentación |
| `cursor/` | Ramas de agentes cloud (pueden coexistir; merge vía PR) |

- Base siempre: `main`.
- Una intención por rama. No mezclar schema + UI “porque cabía”.
- Nunca `git push --force` a `main`.

## Commits

Formato: `tipo(ámbito): mensaje en imperativo`

Ejemplos:

- `feat(api): endpoint de votos con unicidad`
- `fix(web): fallback mock cuando la API no responde`
- `chore(repo): plantillas de issue y SECURITY.md`
- `docs(readme): hoja de ruta y métricas`

Ámbitos útiles: `api`, `web`, `data`, `rls`, `ci`, `repo`, `contracts`.

## Verificaciones locales (obligatorias antes del PR)

```bash
npm install
npm run lint
npm run typecheck
npm test
```

Si tocas UI sensible a privacidad, verifica manualmente que no se muestren coordenadas exactas ni nombres propios.

## Pull requests

- Usa la plantilla de `.github/pull_request_template.md`.
- CI verde en GitHub Actions.
- Describe riesgo y plan de rollback si aplica.
- No incluyas `.env*`, claves ni dumps de datos reales.

## Secretos

- Copia `.env.example` → `.env.local`.
- Nunca pegues secretos en issues, PRs ni commits.
- Si crees que un secreto se filtró: rota la clave y sigue [`SECURITY.md`](SECURITY.md).

## Ownership

Respeta el dominio del agente/área. Si necesitas cruzar frontera, coordina en el PR; no “arregles” el código de otro dominio por conveniencia.
