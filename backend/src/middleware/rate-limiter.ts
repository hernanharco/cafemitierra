import type { Context, Next } from "hono";

interface RateLimiterOptions {
  windowMs: number; // Ventana de tiempo en ms (ej: 60_000 = 1 minuto)
  max: number; // Máximo de requests por ventana
}

interface Bucket {
  count: number;
  resetAt: number;
}

// Store en memoria (por IP)
// Exportado para limpiar en tests
export const rateLimitStore = new Map<string, Bucket>();

// Limpieza periódica cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore) {
    if (bucket.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 300_000);

/**
 * Rate limiter simple en memoria.
 *
 * Uso:
 *   app.use("/api/contact", rateLimiter({ windowMs: 60_000, max: 10 }));
 */
export function rateLimiter(opts: RateLimiterOptions) {
  return async (c: Context, next: Next) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown";
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();

    let bucket = rateLimitStore.get(key);

    if (!bucket || bucket.resetAt < now) {
      // Nueva ventana
      bucket = { count: 0, resetAt: now + opts.windowMs };
      rateLimitStore.set(key, bucket);
    }

    bucket.count++;

    // Setear headers informativos
    c.res.headers.set("X-RateLimit-Limit", String(opts.max));
    c.res.headers.set("X-RateLimit-Remaining", String(Math.max(0, opts.max - bucket.count)));
    c.res.headers.set("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > opts.max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      return c.json({ error: "Demasiadas solicitudes. Intentá de nuevo más tarde." }, 429, {
        "Retry-After": String(retryAfter),
      });
    }

    await next();
  };
}
