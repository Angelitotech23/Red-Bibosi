# Red Bibosi

Plataforma comunitaria de denuncias anónimas para vecinos de Santa Cruz de la Sierra, Bolivia.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase, con despliegue en Vercel.

## Seguridad

- Las variables públicas (`NEXT_PUBLIC_*`) son las únicas que pueden llegar al navegador.
- `SUPABASE_SERVICE_ROLE_KEY` solo se usa en `src/lib/supabase/server.ts` (importa `server-only`).
- Nunca subas `.env`, `.env.local` ni valores reales al repositorio.
- En Vercel, carga las variables en el panel del proyecto, no en el código.

## Arranque local

```bash
./scripts/init.sh
```

El script copia `.env.example` a `.env.local` si aún no existe, instala dependencias y te indica qué variables completar.

Luego:

```bash
npm run dev
```

## Git, GitHub y Vercel

El repositorio remoto ya existe. En un proyecto nuevo, el flujo seguro es:

```bash
git init
git add .
git commit -m "chore: setup inicial seguro"
git status
gh repo create Angelitotech23/Red-Bibosi --source=. --public --remote=origin --push
vercel link
```

Carga las variables en Vercel → Project Settings → Environment Variables. No las escribas en Git.
