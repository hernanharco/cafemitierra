import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock de la DB ──────────────────────────────────────────
vi.mock("../db/index.ts", () => ({
  getDb: vi.fn(),
}));

// ── Test setup ─────────────────────────────────────────────
const appPromise = import("../app.ts");

const mockSiteData = [
  { id: 1, key: "name", value: "Café Mi Tierra", updatedAt: new Date() },
  { id: 2, key: "tagline", value: "El mejor café colombiano en Avilés", updatedAt: new Date() },
  {
    id: 3,
    key: "hero",
    value: { title: "Bienvenidos", subtitle: "Café colombiano" },
    updatedAt: new Date(),
  },
  {
    id: 4,
    key: "services",
    value: [
      { name: "Café tradicional", price: "2.50€" },
      { name: "Pan de bono", price: "3.00€" },
    ],
    updatedAt: new Date(),
  },
];

describe("Site Routes — /api/site (DB)", () => {
  let app: Awaited<typeof appPromise>["default"];

  beforeEach(async () => {
    vi.clearAllMocks();
    app = (await appPromise).default;
  });

  describe("GET /api/site (público)", () => {
    it("devuelve todos los datos del sitio desde la DB", async () => {
      const { getDb } = await import("../db/index.ts");
      // db.select().from(table) → Promise<rows[]>
      const mockDb = {
        select: vi.fn(() => ({
          from: vi.fn().mockResolvedValue(mockSiteData),
        })),
      };
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

      const res = await app.request("/api/site");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.name).toBe("Café Mi Tierra");
      expect(body.tagline).toBe("El mejor café colombiano en Avilés");
      expect(body.hero.title).toBe("Bienvenidos");
    });

    it("devuelve los servicios correctamente", async () => {
      const { getDb } = await import("../db/index.ts");
      const mockDb = {
        select: vi.fn(() => ({
          from: vi.fn().mockResolvedValue(mockSiteData),
        })),
      };
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

      const res = await app.request("/api/site");
      const body = await res.json();

      expect(body.services).toHaveLength(2);
      expect(body.services[0].name).toBe("Café tradicional");
    });

    it("devuelve 404 si no hay datos (DB vacía)", async () => {
      const { getDb } = await import("../db/index.ts");
      const mockDb = {
        select: vi.fn(() => ({
          from: vi.fn().mockResolvedValue([]),
        })),
      };
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

      const res = await app.request("/api/site");
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/site (protegido — requiere auth)", () => {
    it("rechaza PUT sin token de auth", async () => {
      const res = await app.request("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagline: "test" }),
      });

      expect(res.status).toBe(401);
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
