#!/bin/bash
# Script para iniciar el backend de forma persistente
# Se ejecuta con: bash scripts/start-backend.sh

cd "$(dirname "$0")/../backend" || exit 1

export CORS_ORIGINS='["http://localhost:4321","http://localhost:4323","http://localhost:4322"]'
export DATABASE_URL="postgres://cafemitierra:fhUpWVfV6YzVMMytkdkP@localhost:5435/cafemitierra"

nohup npx tsx src/index.ts &>/tmp/backend_persist.log &
echo $! > /tmp/backend_pid.txt
echo "Backend PID: $(cat /tmp/backend_pid.txt)"
