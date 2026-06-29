FROM node:22-alpine AS runner

WORKDIR /app

# pnpm config para entorno controlado
ENV COREPACK_ENABLE_STRICT=0
ENV npm_config_minimum_release_age=0
ENV npm_config_only_built_dependencies='[]'

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar solo lo necesario
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json
COPY backend/ ./backend/

# Instalar dependencias
RUN pnpm install --filter backend 2>&1

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8001/api/health || exit 1

CMD ["pnpm", "--filter", "backend", "start"]
