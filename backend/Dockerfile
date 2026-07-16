FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos de dependencias primero (cache de Docker)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json

# Instalar dependencias (sin scripts, reconstruir esbuild después)
RUN pnpm install --filter backend --no-frozen-lockfile --ignore-scripts

# Reconstruir esbuild (necesario para tsx en Alpine)
RUN pnpm rebuild esbuild

# Copiar código del backend
COPY backend/ ./backend/

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8001/api/health || exit 1

CMD ["pnpm", "--filter", "backend", "start"]
