import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getDb } from "../db/index.ts";
import { reviews } from "../db/schema.ts";

const router = new Hono().basePath("/api/reviews");

const reviewSchema = z.object({
  author: z.string().min(1, "El nombre es obligatorio"),
  rating: z.number().min(1).max(5),
  text: z.string().min(1, "El texto es obligatorio"),
  source: z.string().optional().default("web"),
  visible: z.boolean().optional().default(false),
});

const reviewUpdateSchema = reviewSchema.partial();

// ── GET /api/reviews — Todas las reseñas (admin) ────────────
router.get("/", async (c) => {
  const db = getDb();
  const all = await db.select().from(reviews).orderBy(reviews.createdAt);
  return c.json(all);
});

// ── GET /api/reviews/public — Solo visibles (landing) ──────
router.get("/public", async (c) => {
  const db = getDb();
  const visible = await db
    .select()
    .from(reviews)
    .where(eq(reviews.visible, true))
    .orderBy(reviews.createdAt);
  return c.json(visible);
});

// ── POST /api/reviews — Enviar reseña (público) ────────────
router.post("/", zValidator("json", reviewSchema), async (c) => {
  const data = c.req.valid("json");
  const db = getDb();

  const [review] = await db
    .insert(reviews)
    .values({
      author: data.author,
      rating: data.rating,
      text: data.text,
      source: data.source || "web",
      visible: false, // Siempre pendiente de aprobación
    })
    .returning();

  return c.json({ success: true, message: "Reseña recibida. Gracias!", review }, 201);
});

// ── PUT /api/reviews/:id — Actualizar reseña (admin) ────────
router.put("/:id", zValidator("json", reviewUpdateSchema), async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({ error: "ID inválido" }, 400);
  }

  const data = c.req.valid("json");
  const db = getDb();

  const [updated] = await db
    .update(reviews)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(reviews.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Reseña no encontrada" }, 404);
  }

  return c.json(updated);
});

// ── DELETE /api/reviews/:id — Eliminar reseña (admin) ───────
router.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({ error: "ID inválido" }, 400);
  }

  const db = getDb();

  const [deleted] = await db
    .delete(reviews)
    .where(eq(reviews.id, id))
    .returning({ id: reviews.id });

  if (!deleted) {
    return c.json({ error: "Reseña no encontrada" }, 404);
  }

  return c.json({ success: true });
});

export default router;
