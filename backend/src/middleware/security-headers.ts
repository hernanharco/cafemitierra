import type { Context, Next } from "hono";

/**
 * Middleware de headers de seguridad HTTP.
 *
 * Agrega los headers recomendados por OWASP para prevenir
 * clickjacking, MIME sniffing, XSS, etc.
 */
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    await next();

    // Prevenir clickjacking
    c.res.headers.set("X-Frame-Options", "DENY");

    // Prevenir MIME type sniffing
    c.res.headers.set("X-Content-Type-Options", "nosniff");

    // Forzar HTTPS (HSTS) — solo en producción
    if (process.env.NODE_ENV === "production") {
      c.res.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
      );
    }

    // Referrer policy
    c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Content Security Policy (CSP) básica
    // En producción, ajustar según necesidades específicas
    if (process.env.NODE_ENV === "production") {
      c.res.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://res.cloudinary.com data:; connect-src 'self'",
      );
    }

    // X-XSS-Protection (legacy, para navegadores viejos)
    c.res.headers.set("X-XSS-Protection", "0");
  };
}
