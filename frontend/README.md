# ☕ Café Mi Tierra

Sitio web profesional para **Café Mi Tierra**, un café colombiano en Avilés, Asturias.

## Stack

- **Frontend**: [Astro 7](https://astro.build) SSR + Tailwind CSS 4 + GSAP/Lenis
- **Backend**: [Hono](https://hono.dev) + [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL
- **Auth**: [authCore](https://github.com/hernanharco/authcore) (Google OAuth)
- **Images**: Cloudinary
- **Deploy**: Frontend → Vercel, Backend + DB → Hetzner VPS (Docker)

## Estructura

```
├── frontend/          # Astro SSR (landing + admin panel)
│   └── src/
│       ├── components/  # Componentes landing + admin
│       ├── layouts/     # Layouts (Base, Admin)
│       ├── pages/       # Rutas (/, /admin/*, /auth/callback)
│       └── data/        # business.json (datos del sitio)
├── backend/           # Hono API + Drizzle + PostgreSQL
│   └── src/
│       ├── routes/    # Endpoints (/api/site, /api/gallery, etc.)
│       ├── services/  # Auth, Cloudinary
│       ├── middleware/ # Auth, rate limiter, security headers
│       └── db/        # Drizzle schema + connection
├── scripts/           # Deploy pipeline
├── tests/e2e/         # Playwright E2E tests
└── openspec/          # Spec-Driven Development artifacts
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia backend + frontend en paralelo |
| `pnpm build` | Build de producción (backend + frontend) |
| `pnpm test` | Tests (backend + frontend) |
| `pnpm lint` | Linter + formatter (Biome) |
| `pnpm deploy` | Pipeline completo a producción |
| `pnpm --filter backend seed` | Migrar datos iniciales a DB |

## Desarrollo

```bash
pnpm install
pnpm dev
```

Frontend: http://localhost:4323
Backend: http://localhost:8001
Admin: http://localhost:4323/admin

## Variables de Entorno

Ver `.env.example` en `backend/` y `frontend/.env.local` para la lista completa.

---

© 2026 Café Mi Tierra — [cafemitierra.com](https://cafemitierra.com)
