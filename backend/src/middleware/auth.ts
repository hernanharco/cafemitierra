import type { Context, Next } from "hono";
import { verifyToken } from "../services/auth.ts";

// Conjunto de rutas de autenticación públicas (exactas)
const AUTH_PATHS = new Set(["/api/auth/status", "/api/auth/public-key", "/api/auth/dev-login"]);

/**
 * Middleware de autenticación para rutas protegidas
 *
 * Espera un header `Authorization: Bearer <token>`
 * donde el token es emitido por authCore (Google OAuth)
 */
export async function authMiddleware(c: Context, next: Next) {
  const method = c.req.method;
  const path = c.req.path;

  // Rutas públicas (sin autenticación)
  if (path === "/api/contact" && method === "POST") return next(); // Enviar mensaje
  if (path === "/api/reviews" && method === "POST") return next(); // Enviar reseña
  if (path === "/api/reviews/public") return next(); // Reseñas visibles
  if (AUTH_PATHS.has(path)) return next(); // Auth endpoints (solo rutas exactas)
  if (path === "/api/site" && method === "GET") return next(); // Landing page pública

  // Buscar token: primero en header Authorization, después en cookie
  let token: string | undefined;

  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    // Fallback: leer token desde la cookie (para SSR con cookies httpOnly)
    const cookieToken = c.req
      .header("Cookie")
      ?.split("; ")
      .find((r) => r.startsWith("token="))
      ?.split("=")[1];
    if (cookieToken) {
      token = cookieToken;
    }
  }

  console.log(`[auth] path=${path} token=${token ? `${token.substring(0, 20)}...` : "MISSING"}`);
  if (!token) {
    return c.json({ error: "Token no proporcionado" }, 401);
  }

  const user = await verifyToken(token);

  if (!user) {
    return c.json({ error: "Token inválido o expirado" }, 401);
  }

  // Pasar usuario al contexto
  c.set("user", user);
  await next();
}
