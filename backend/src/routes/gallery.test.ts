import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock de la DB ──────────────────────────────────────────
vi.mock("../db/index.ts", () => ({
  getDb: vi.fn(),
}));

// ── Mock de Cloudinary ─────────────────────────────────────
vi.mock("../services/cloudinary.ts", () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  getOptimizedUrl: vi.fn(),
}));

// ── Helper para mockear queries de Drizzle ─────────────────
function createDbMock(
  overrides: {
    selectResult?: unknown[];
    selectOneResult?: unknown | null;
    updateResult?: unknown[];
  } = {},
) {
  const { selectResult = [], selectOneResult = null, updateResult = [] } = overrides;

  const db = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn().mockResolvedValue(selectResult),
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue(selectOneResult ? [selectOneResult] : []),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue(updateResult),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue(undefined),
    })),
  };

  return db;
}

// ── Test setup ─────────────────────────────────────────────
// Importamos app DESPUÉS de los mocks
const appPromise = import("../app.ts");

const mockImages = [
  {
    id: 1,
    title: "Café colombiano",
    description: "Una taza de café recién hecho",
    imageUrl: "https://res.cloudinary.com/test/image1.jpg",
    imagePublicId: "cafemitierra/image1",
    alt: "Café colombiano",
    sortOrder: 0,
    featured: false,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: 2,
    title: "Pan de bono",
    description: "Pan de bono recién horneado",
    imageUrl: "https://res.cloudinary.com/test/image2.jpg",
    imagePublicId: "cafemitierra/image2",
    alt: "Pan de bono",
    sortOrder: 1,
    featured: true,
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
  },
];

describe("Gallery Routes — /api/gallery", () => {
  let app: Awaited<typeof appPromise>["default"];
  const authHeader = { Authorization: "Bearer dev-token" };

  beforeEach(async () => {
    vi.clearAllMocks();
    app = (await appPromise).default;
  });

  describe("GET /api/gallery (protegido)", () => {
    it("devuelve array vacío cuando no hay imágenes", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(createDbMock({ selectResult: [] }));

      const res = await app.request("/api/gallery", { headers: authHeader });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual([]);
    });

    it("devuelve todas las imágenes", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createDbMock({ selectResult: mockImages }),
      );

      const res = await app.request("/api/gallery", { headers: authHeader });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveLength(2);
      expect(body[0].title).toBe("Café colombiano");
      expect(body[1].title).toBe("Pan de bono");
    });

    it("rechaza sin token de auth", async () => {
      const res = await app.request("/api/gallery");
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/gallery/:id (protegido)", () => {
    it("actualiza metadatos de una imagen", async () => {
      const { getDb } = await import("../db/index.ts");
      const updatedImage = { ...mockImages[0], title: "Nuevo título", alt: "Nuevo alt" };
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createDbMock({ updateResult: [updatedImage] }),
      );

      const res = await app.request("/api/gallery/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ title: "Nuevo título", alt: "Nuevo alt" }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.title).toBe("Nuevo título");
      expect(body.alt).toBe("Nuevo alt");
    });

    it("devuelve 404 si la imagen no existe", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(createDbMock({ updateResult: [] }));

      const res = await app.request("/api/gallery/999", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ title: "Nuevo" }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/gallery/:id (protegido)", () => {
    it("elimina una imagen existente y su Cloudinary", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createDbMock({ selectOneResult: mockImages[0] }),
      );

      const { deleteImage } = await import("../services/cloudinary.ts");

      const res = await app.request("/api/gallery/1", {
        method: "DELETE",
        headers: authHeader,
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(deleteImage).toHaveBeenCalledWith("cafemitierra/image1");
    });

    it("devuelve 404 si la imagen no existe", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(createDbMock({ selectOneResult: null }));

      const { deleteImage } = await import("../services/cloudinary.ts");

      const res = await app.request("/api/gallery/999", {
        method: "DELETE",
        headers: authHeader,
      });

      expect(res.status).toBe(404);
      expect(deleteImage).not.toHaveBeenCalled();
    });

    it("elimina imagen sin Cloudinary (sin publicId)", async () => {
      const { getDb } = await import("../db/index.ts");
      const imageWithoutCloudinary = { ...mockImages[0], imagePublicId: null };
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createDbMock({ selectOneResult: imageWithoutCloudinary }),
      );

      const { deleteImage } = await import("../services/cloudinary.ts");

      const res = await app.request("/api/gallery/1", {
        method: "DELETE",
        headers: authHeader,
      });

      expect(res.status).toBe(200);
      expect(deleteImage).not.toHaveBeenCalled();
    });
  });
});
