import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
// Middleware
import { authMiddleware } from "./middleware/auth.ts";
import authRoutes from "./routes/auth.ts";
import contactRoutes from "./routes/contact.ts";
import galleryRoutes from "./routes/gallery.ts";
import reviewRoutes from "./routes/reviews.ts";
// Rutas
import siteRoutes from "./routes/site.ts";

const app = new Hono();

// ── Middleware global ───────────────────────────────────────────
app.use("*", logger());

app.use(
  "*",
  cors({
    origin: JSON.parse(process.env.CORS_ORIGINS || '["http://localhost:4321"]'),
    credentials: true,
  }),
);

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
