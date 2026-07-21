import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock de la DB ──────────────────────────────────────────
vi.mock("../db/index.ts", () => ({
  getDb: vi.fn(),
}));

// ── Helper: crear mock de Drizzle para contacto ────────────
function createContactDbMock(
  overrides: {
    selectResult?: unknown[];
    insertResult?: unknown[];
    deleteResult?: unknown[];
    updateResult?: unknown[];
  } = {},
) {
  const {
    selectResult = [],
    insertResult = [],
    deleteResult = undefined,
    updateResult = [],
  } = overrides;

  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
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
        returning: vi.fn().mockResolvedValue(deleteResult || []),
      })),
    })),
  };
}

// ── Test setup ─────────────────────────────────────────────
const appPromise = import("../app.ts");

const mockMessages = [
  {
    id: 1,
    name: "Ana García",
    email: "ana@test.com",
    phone: "612345678",
    message: "Quiero información sobre los horarios",
    read: false,
    createdAt: new Date("2026-01-01"),
  },
  {
    id: 2,
    name: "Carlos López",
    email: "carlos@test.com",
    phone: null,
    message: "Hacen envíos a domicilio?",
    read: true,
    createdAt: new Date("2026-01-02"),
  },
];

describe("Contact Routes — /api/contact", () => {
  let app: Awaited<typeof appPromise>["default"];
  const authHeader = { Authorization: "Bearer dev-token" };

  beforeEach(async () => {
    vi.clearAllMocks();
    app = (await appPromise).default;
  });

  describe("POST /api/contact (público)", () => {
    it("crea un mensaje con datos válidos", async () => {
      const { getDb } = await import("../db/index.ts");
      const newMessage = {
        id: 3,
        name: "Juan Pérez",
        email: "juan@test.com",
        phone: "698765432",
        message: "Hola, me gustaría saber si tienen café colombiano",
        read: false,
        createdAt: new Date("2026-01-03"),
      };
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createContactDbMock({ insertResult: [newMessage] }),
      );

      const res = await app.request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Juan Pérez",
          email: "juan@test.com",
          phone: "698765432",
          message: "Hola, me gustaría saber si tienen café colombiano",
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.id).toBe(3);
      expect(body.name).toBe("Juan Pérez");
    });

    it("rechaza datos inválidos (email mal formado)", async () => {
      const res = await app.request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: "email-invalido",
          message: "",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("rechaza payload vacío", async () => {
      const res = await app.request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/contact (admin, protegido)", () => {
    it("devuelve todos los mensajes ordenados", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createContactDbMock({ selectResult: mockMessages }),
      );

      const res = await app.request("/api/contact", { headers: authHeader });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveLength(2);
      expect(body[0].name).toBe("Ana García");
      expect(body[1].name).toBe("Carlos López");
    });

    it("rechaza sin token", async () => {
      const res = await app.request("/api/contact");
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/contact/:id/read (admin, protegido)", () => {
    it("marca un mensaje como leído", async () => {
      const { getDb } = await import("../db/index.ts");
      const readMessage = { ...mockMessages[0], read: true };
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createContactDbMock({ updateResult: [readMessage] }),
      );

      const res = await app.request("/api/contact/1/read", {
        method: "PUT",
        headers: authHeader,
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.read).toBe(true);
    });

    it("devuelve 404 si el mensaje no existe", async () => {
      const { getDb } = await import("../db/index.ts");
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(
        createContactDbMock({ updateResult: [] }),
      );

      const res = await app.request("/api/contact/999/read", {
        method: "PUT",
        headers: authHeader,
      });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/contact/:id (admin, protegido)", () => {
    it("elimina un mensaje existente", async () => {
      const { getDb } = await import("../db/index.ts");
      const mockDb = createContactDbMock({ deleteResult: [{ id: 1 }] });
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

      const res = await app.request("/api/contact/1", {
        method: "DELETE",
        headers: authHeader,
      });

      expect(res.status).toBe(200);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it("devuelve 404 si el mensaje no existe", async () => {
      const { getDb } = await import("../db/index.ts");
      const mockDb = createContactDbMock();
      (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

      const res = await app.request("/api/contact/999", {
        method: "DELETE",
        headers: authHeader,
      });

      expect(res.status).toBe(404);
    });
  });
});
