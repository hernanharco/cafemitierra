FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar dependencias primero
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json

# Instalar dependencias permitiendo todos los builds
RUN pnpm install --filter backend --no-frozen-lockfile --ignore-scripts 2>&1

# Ejecutar builds necesarios
RUN pnpm rebuild esbuild 2>&1 || true

# Copiar código del backend y datos del frontend
COPY backend/ ./backend/
COPY frontend/src/data/ ./frontend/src/data/

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8001/api/health || exit 1

CMD ["pnpm", "--filter", "backend", "start"]
