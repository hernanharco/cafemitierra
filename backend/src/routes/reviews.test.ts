import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock de la DB ──────────────────────────────────────────
vi.mock("../db/index.ts", () => ({
  getDb: vi.fn(),
}));

// ── Helper: mock Drizzle query chain ───────────────────────
function createDbMock(
  overrides: {
    selectResult?: unknown[];
    insertResult?: unknown[];
    updateResult?: unknown[];
    deleteResult?: unknown[];
  } = {},
) {
  const { selectResult = [], insertResult = [], updateResult = [], deleteResult = [] } = overrides;

  const db = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn().mockResolvedValue(selectResult),
        })),
        orderBy: vi.fn().mockResolvedValue(selectResult),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue(insertResult),
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
      where: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue(deleteResult),
      })),
    })),
  };

  return db;
}

// ── Test setup ─────────────────────────────────────────────
const appPromise = import("../app.ts");

const mockReviews = [
  {
    id: 1,
    author: "Ana García",
    rating: 5,
    text: "Excelente café colombiano",
    source: "web",
    visible: true,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
  },
  {
    id: 2,
    author: "Carlos López",
    rating: 4,
    text: "Muy buen ambiente",
    source: "manual",
    visible: false,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
  },
];

describe("Reviews Routes — /api/reviews", () => {
  let app: Awaited<typeof appPromise>["default"];
  const authHeader = { Authorization: "Bearer dev-token" };

  beforeEach(async () => {
    vi.clearAllMocks();
    app = (await appPromise).default;
  });

  describe("GET /api/reviews/public (público)", () => {
    it("devuelve solo las reseñas visibles", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createDbMock({ selectResult: [mockReviews[0]] }),
      );

      const res = await app.request("/api/reviews/public");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].author).toBe("Ana García");
    });

    it("devuelve array vacío si no hay reseñas visibles", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(createDbMock({ selectResult: [] }));

      const res = await app.request("/api/reviews/public");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual([]);
    });
  });

  describe("GET /api/reviews (admin — protegido)", () => {
    it("devuelve todas las reseñas (visibles y ocultas)", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createDbMock({ selectResult: mockReviews }),
      );

      const res = await app.request("/api/reviews", { headers: authHeader });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveLength(2);
    });

    it("rechaza sin token", async () => {
      const res = await app.request("/api/reviews");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/reviews (público)", () => {
    it("agrega una reseña nueva como no visible", async () => {
      const { getDb } = await import("../db/index.ts");
      const newReview = {
        id: 3,
        author: "Pedro Martínez",
        rating: 5,
        text: "El mejor café de Avilés",
        source: "web",
        visible: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createDbMock({ insertResult: [newReview] }),
      );

      const res = await app.request("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: "Pedro Martínez",
          rating: 5,
          text: "El mejor café de Avilés",
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.review.author).toBe("Pedro Martínez");
      expect(body.review.visible).toBe(false);
    });

    it("rechaza reseña sin rating", async () => {
      const res = await app.request("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: "Test", text: "Texto" }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/reviews/:id (admin)", () => {
    it("actualiza una reseña por ID", async () => {
      const { getDb } = await import("../db/index.ts");
      const updatedReview = { ...mockReviews[0], visible: false };
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createDbMock({ updateResult: [updatedReview] }),
      );

      const res = await app.request("/api/reviews/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ visible: false }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.visible).toBe(false);
    });

    it("devuelve 404 si el ID no existe", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(createDbMock({ updateResult: [] }));

      const res = await app.request("/api/reviews/999", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ visible: true }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/reviews/:id (admin)", () => {
    it("elimina una reseña por ID", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createDbMock({ deleteResult: [{ id: 1 }] }),
      );

      const res = await app.request("/api/reviews/1", {
        method: "DELETE",
        headers: authHeader,
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("devuelve 404 si el ID no existe", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(createDbMock({ deleteResult: [] }));

      const res = await app.request("/api/reviews/999", {
        method: "DELETE",
        headers: authHeader,
      });

      expect(res.status).toBe(404);
    });
  });
});
