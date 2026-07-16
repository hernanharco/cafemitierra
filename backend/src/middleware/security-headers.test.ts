import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { securityHeaders } from "./security-headers.ts";

describe("Security Headers Middleware", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "development";
  });

  it("agrega X-Frame-Options: DENY", async () => {
    const app = new Hono();
    app.use("*", securityHeaders());
    app.get("/", (c) => c.json({ ok: true }));

    const res = await app.request("/");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("agrega X-Content-Type-Options: nosniff", async () => {
    const app = new Hono();
    app.use("*", securityHeaders());
    app.get("/", (c) => c.json({ ok: true }));

    const res = await app.request("/");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("agrega Referrer-Policy", async () => {
    const app = new Hono();
    app.use("*", securityHeaders());
    app.get("/", (c) => c.json({ ok: true }));

    const res = await app.request("/");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("NO agrega HSTS ni CSP en development", async () => {
    const app = new Hono();
    app.use("*", securityHeaders());
    app.get("/", (c) => c.json({ ok: true }));

    const res = await app.request("/");
    expect(res.headers.get("Strict-Transport-Security")).toBeNull();
    expect(res.headers.get("Content-Security-Policy")).toBeNull();
  });

  it("agrega HSTS y CSP en producción", async () => {
    process.env.NODE_ENV = "production";

    const app = new Hono();
    app.use("*", securityHeaders());
    app.get("/", (c) => c.json({ ok: true }));

    const res = await app.request("/");
    expect(res.headers.get("Strict-Transport-Security")).toContain("max-age=63072000");
    expect(res.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
  });
});
