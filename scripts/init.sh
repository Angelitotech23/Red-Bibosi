#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.example ]]; then
  echo "No se encontró .env.example en la raíz del proyecto."
  exit 1
fi

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
  echo "Se copió .env.example → .env.local"
else
  echo ".env.local ya existe; no se sobreescribe."
fi

if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

cat <<'EOF'

Completa estas variables en .env.local (no las subas a GitHub):

  NEXT_PUBLIC_SUPABASE_URL         pública — URL del proyecto de Supabase
  NEXT_PUBLIC_SUPABASE_ANON_KEY    pública — clave anon / publishable
  SUPABASE_SERVICE_ROLE_KEY        secreta — solo servidor, sin prefijo NEXT_PUBLIC_

En Vercel, carga las mismas claves en el panel:
Project Settings → Environment Variables
(Production, Preview y Development). Nunca las escribas en el repositorio.

Luego ejecuta: npm run dev
EOF
