#!/bin/bash
# Inicia el backend apuntando a la DB de producción via SSH tunnel

cd "$(dirname "$0")/../backend" || exit 1

# Tunnel SSH a la DB de Hetzner (si no existe)
if ! ss -tlnp | grep -q 5437; then
  echo "Creando tunnel SSH..."
  ssh -L 5437:127.0.0.1:5436 hetzner-wg -N -f -o ExitOnForwardFailure=yes -o ServerAliveInterval=30
  sleep 2
fi

# Variables de entorno para producción
export DATABASE_URL="postgres://cafemitierra:cafemitierra_prod_2026@localhost:5437/cafemitierra"
export CORS_ORIGINS='["http://localhost:4321","http://localhost:4323"]'

echo "Iniciando backend con DB de producción..."
npx tsx src/index.ts
