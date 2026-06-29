FROM node:22-alpine AS runner

WORKDIR /app

# Deshabilitar verificación de antigüedad de paquetes para el build
ENV COREPACK_ENABLE_STRICT=0

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos de dependencias
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json

# Instalar dependencias del backend
RUN pnpm install --filter backend --config.minimumReleaseAge=0

# Copiar código del backend
COPY backend/ ./backend/

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8001/api/health || exit 1

CMD ["pnpm", "--filter", "backend", "start"]
