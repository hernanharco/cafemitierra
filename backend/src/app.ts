import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
// Middleware
import { authMiddleware } from "./middleware/auth.ts";
import { rateLimiter } from "./middleware/rate-limiter.ts";
import { securityHeaders } from "./middleware/security-headers.ts";
import authRoutes from "./routes/auth.ts";
import contactRoutes from "./routes/contact.ts";
import galleryRoutes from "./routes/gallery.ts";
import reviewRoutes from "./routes/reviews.ts";
// Rutas
import siteRoutes from "./routes/site.ts";

const app = new Hono();

// ── Error handler global ────────────────────────────────────────
app.onError((err, c) => {
  console.error(`[error] ${err.message}`, err.stack);

  // No exponer detalles internos en producción
  const message =
    process.env.NODE_ENV === "production" ? "Error interno del servidor" : err.message;

  return c.json({ error: message }, 500);
});

// ── Not found handler ───────────────────────────────────────────
app.notFound((c) => {
  return c.json({ error: "Ruta no encontrada" }, 404);
});

// ── Middleware global ───────────────────────────────────────────
app.use("*", logger());
app.use("*", securityHeaders());

app.use(
  "*",
  cors({
    origin: JSON.parse(process.env.CORS_ORIGINS || '["http://localhost:4321"]'),
    credentials: true,
  }),
);

// ── Rate limiting en endpoints públicos ─────────────────────────
app.use("/api/contact", rateLimiter({ windowMs: 60_000, max: 10 }));
app.use("/api/reviews", rateLimiter({ windowMs: 60_000, max: 20 }));

// ── Health check (público) ──────────────────────────────────────
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Rutas públicas (sin auth) ──────────────────────────────────
app.route("/", authRoutes);

// ── Rutas protegidas (requieren token authCore) ────────────────
app.use("/api/*", authMiddleware);
app.route("/", siteRoutes);
app.route("/", galleryRoutes);
app.route("/", reviewRoutes);
app.route("/", contactRoutes);

export default app;
