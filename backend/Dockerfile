FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar monorepo (contexto = raíz del proyecto)
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json

# Instalar solo las dependencias del backend
# .npmrc para deshabilitar verificación de antigüedad de paquetes
COPY backend/.npmrc ./.npmrc
RUN pnpm install --filter backend

# Copiar código del backend
COPY backend/ ./backend/

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8001/api/health || exit 1

CMD ["pnpm", "--filter", "backend", "start"]
