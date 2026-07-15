import { describe, expect, it, vi } from "vitest";
import app from "../app.ts";

describe("Auth Routes — /api/auth", () => {
  describe("POST /api/auth/dev-login", () => {
    it("devuelve un token de desarrollo en entorno dev", async () => {
      const res = await app.request("/api/auth/dev-login", {
        method: "POST",
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("token", "dev-token");
      expect(body.user.userId).toBe("dev-user");
      expect(body.user.email).toBe("dev@cafemitierra.com");
    });

    it("devuelve 403 si no está en entorno development", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const res = await app.request("/api/auth/dev-login", {
        method: "POST",
      });

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Solo disponible en desarrollo");

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("GET /api/auth/public-key", () => {
    it("devuelve la clave pública (o vacía si no hay authCore)", async () => {
      // Mock global fetch para que falle (no hay authCore)
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Not found"));

      const res = await app.request("/api/auth/public-key");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty("public_key");
      expect(typeof body.public_key).toBe("string");

      globalThis.fetch = originalFetch;
    });
  });

  describe("GET /api/auth/status", () => {
    it("devuelve authenticated:false (ruta pública sin auth middleware)", async () => {
      // El auth middleware saltea /api/auth/*, así que siempre es false
      const res = await app.request("/api/auth/status");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.authenticated).toBe(false);
      expect(body.user).toBeNull();
    });
  });
});
