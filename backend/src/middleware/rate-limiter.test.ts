import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { rateLimiter, rateLimitStore } from "./rate-limiter.ts";

describe("Rate Limiter Middleware", () => {
  // Limpiar store entre tests para evitar contaminación
  beforeEach(() => {
    rateLimitStore.clear();
  });

  it("permite requests dentro del límite", async () => {
    const app = new Hono();
    app.use("/api/test", rateLimiter({ windowMs: 60_000, max: 5 }));
    app.get("/api/test", (c) => c.json({ ok: true }));

    const res = await app.request("/api/test");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("setea headers de rate limit", async () => {
    const app = new Hono();
    app.use("/api/test", rateLimiter({ windowMs: 60_000, max: 5 }));
    app.get("/api/test", (c) => c.json({ ok: true }));

    const res = await app.request("/api/test");

    expect(res.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("4");
    expect(res.headers.get("X-RateLimit-Reset")).toBeTruthy();
  });

  it("bloquea requests que exceden el límite", async () => {
    const app = new Hono();
    app.use("/api/test", rateLimiter({ windowMs: 60_000, max: 2 }));
    app.get("/api/test", (c) => c.json({ ok: true }));

    // Primer request: ok
    const res1 = await app.request("/api/test");
    expect(res1.status).toBe(200);

    // Segundo request: ok
    const res2 = await app.request("/api/test");
    expect(res2.status).toBe(200);

    // Tercer request: bloqueado
    const res3 = await app.request("/api/test");
    expect(res3.status).toBe(429);

    const body = await res3.json();
    expect(body.error).toContain("Demasiadas");
  });
});
