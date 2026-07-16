#!/bin/bash
# Tunnel SSH a la DB de producción en Hetzner
# Puerto local 5437 → Hetzner 127.0.0.1:5436
#
# Uso: bash scripts/tunnel-db.sh

# Matar túneles previos
pkill -f "ssh.*-L.*5437.*hetzner-wg" 2>/dev/null

# Crear tunnel persistente con autossh si está disponible, sino ssh
if command -v autossh &>/dev/null; then
  autossh -M 0 -L 5437:127.0.0.1:5436 hetzner-wg -N -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3
else
  ssh -L 5437:127.0.0.1:5436 hetzner-wg -N -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3
fi
