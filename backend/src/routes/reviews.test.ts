import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../app.ts";

// ── Mock del filesystem ─────────────────────────────────────
vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

const mockBusinessData = {
  name: "Café Mi Tierra",
  reviews: [
    { author: "Ana García", rating: 5, text: "Excelente café colombiano", visible: true },
    { author: "Carlos López", rating: 4, text: "Muy buen ambiente", visible: false },
  ],
};

describe("Reviews Routes — /api/reviews", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    const fs = await import("node:fs");
    (fs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(mockBusinessData));
    (fs.writeFileSync as ReturnType<typeof vi.fn>).mockClear();
  });

  describe("GET /api/reviews/public (público)", () => {
    it("devuelve solo las reseñas visibles", async () => {
      const res = await app.request("/api/reviews/public");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].author).toBe("Ana García");
    });
  });

  describe("GET /api/reviews (admin — protegido)", () => {
    const authHeader = { Authorization: "Bearer dev-token" };

    it("devuelve todas las reseñas (visibles y ocultas)", async () => {
      const res = await app.request("/api/reviews", {
        headers: authHeader,
      });

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

      // Verificar que se escribió en el archivo
      const fs = await import("node:fs");
      const writeMock = fs.writeFileSync as ReturnType<typeof vi.fn>;
      expect(writeMock).toHaveBeenCalledOnce();

      const writtenData = JSON.parse(writeMock.mock.calls[0][1]);
      expect(writtenData.reviews).toHaveLength(3);
      expect(writtenData.reviews[2].author).toBe("Pedro Martínez");
      expect(writtenData.reviews[2].visible).toBe(false);
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

  describe("DELETE /api/reviews/:index (admin)", () => {
    const authHeader = { Authorization: "Bearer dev-token" };

    it("elimina una reseña por índice", async () => {
      const res = await app.request("/api/reviews/0", {
        method: "DELETE",
        headers: authHeader,
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);

      const fs = await import("node:fs");
      const writeMock = fs.writeFileSync as ReturnType<typeof vi.fn>;
      // Tomar la última llamada a writeFileSync (se acumulan entre tests)
      const lastCall = writeMock.mock.calls.at(-1);
      const writtenData = JSON.parse(lastCall![1] as string);
      expect(writtenData.reviews).toHaveLength(1);
      expect(writtenData.reviews[0].author).toBe("Carlos López");
    });

    it("devuelve 404 si el índice no existe", async () => {
      const res = await app.request("/api/reviews/999", {
        method: "DELETE",
        headers: authHeader,
      });

      expect(res.status).toBe(404);
    });
  });
});
