import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../app.ts";

// ── Mock del filesystem ─────────────────────────────────────
vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

const mockBusinessData = {
  name: "Café Mi Tierra",
  tagline: "El mejor café colombiano en Avilés",
  hero: {
    title: "Bienvenidos a Café Mi Tierra",
    subtitle: "Café colombiano 100% artesanal",
  },
  about: {
    description: "Somos una familia colombiana compartiendo nuestra cultura",
  },
  services: [
    { name: "Café tradicional", price: "2.50€" },
    { name: "Pan de bono", price: "3.00€" },
  ],
  reviews: [{ author: "Ana", rating: 5, text: "Excelente café", visible: true }],
};

describe("Site Routes — /api/site", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    const fs = await import("node:fs");
    (fs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(mockBusinessData));
    (fs.writeFileSync as ReturnType<typeof vi.fn>).mockClear();
  });

  describe("GET /api/site (público)", () => {
    it("devuelve todos los datos del negocio", async () => {
      const res = await app.request("/api/site");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.name).toBe("Café Mi Tierra");
      expect(body.tagline).toBe("El mejor café colombiano en Avilés");
      expect(body.hero.title).toBe("Bienvenidos a Café Mi Tierra");
    });

    it("devuelve el array de servicios correctamente", async () => {
      const res = await app.request("/api/site");
      const body = await res.json();

      expect(body.services).toHaveLength(2);
      expect(body.services[0].name).toBe("Café tradicional");
    });
  });

  describe("PUT /api/site (protegido — requiere auth)", () => {
    const authHeader = {
      Authorization: "Bearer dev-token",
    };

    it("actualiza datos con deep merge", async () => {
      const fs = await import("node:fs");
      const writeMock = fs.writeFileSync as ReturnType<typeof vi.fn>;

      const res = await app.request("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ tagline: "Nuevo tagline" }),
      });

      expect(res.status).toBe(200);

      // Verificar que mergeó correctamente
      const body = await res.json();
      expect(body.tagline).toBe("Nuevo tagline");
      expect(body.name).toBe("Café Mi Tierra"); // Se conserva del original
      expect(body.services).toHaveLength(2); // Se conservan

      // Verificar que escribió al archivo
      expect(writeMock).toHaveBeenCalledOnce();
      const writtenData = JSON.parse(writeMock.mock.calls[0][1]);
      expect(writtenData.tagline).toBe("Nuevo tagline");
      expect(writtenData.name).toBe("Café Mi Tierra");
    });

    it("reemplaza una sección completa con PUT /:section", async () => {
      const res = await app.request("/api/site/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          title: "Nuevo Hero",
          subtitle: "Nuevo subtítulo",
        }),
      });

      expect(res.status).toBe(200);

      // La ruta devuelve todo el objeto business, no solo la sección
      const body = await res.json();
      expect(body.hero.title).toBe("Nuevo Hero");
      expect(body.hero.subtitle).toBe("Nuevo subtítulo");
      expect(body.name).toBe("Café Mi Tierra"); // Resto del objeto intacto
    });

    it("rechaza PUT sin token de auth", async () => {
      const res = await app.request("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagline: "test" }),
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("Token no proporcionado");
    });

    it("rechaza PUT con token inválido", async () => {
      const res = await app.request("/api/site", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-invalido",
        },
        body: JSON.stringify({ tagline: "test" }),
      });

      expect(res.status).toBe(401);
    });
  });
});
