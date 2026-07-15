import { Hono } from "hono";
import { getPublicKey } from "../services/auth.ts";

const router = new Hono().basePath("/api/auth");

// ── GET /api/auth/status — Verificar estado de auth ─────────
router.get("/status", async (c) => {
  const user = c.get("user");
  return c.json({
    authenticated: !!user,
    user: user ?? null,
  });
});

// ── GET /api/auth/public-key — Exponer clave pública (para debug) ──
router.get("/public-key", async (c) => {
  const key = await getPublicKey();
  return c.json({ public_key: key });
});

// ── POST /api/auth/dev-login — Login de desarrollo (temporal) ──
router.post("/dev-login", async (c) => {
  const env = process.env.NODE_ENV || "development";
  if (env !== "development") {
    return c.json({ error: "Solo disponible en desarrollo" }, 403);
  }
  return c.json({
    token: "dev-token",
    user: { userId: "dev-user", email: "dev@cafemitierra.com" },
  });
});

export default router;
