import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getDb } from "../db/index.ts";
import { contactMessages } from "../db/schema.ts";

const router = new Hono().basePath("/api/contact");

const contactSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  message: z.string().min(1, "El mensaje es obligatorio"),
});

// ── POST /api/contact — Enviar mensaje (público) ────────────
router.post("/", zValidator("json", contactSchema), async (c) => {
  const db = getDb();
  const data = c.req.valid("json");
  const [msg] = await db.insert(contactMessages).values(data).returning();
  return c.json(msg, 201);
});

// ── GET /api/contact — Listar mensajes (admin) ──────────────
router.get("/", async (c) => {
  const db = getDb();
  const messages = await db.select().from(contactMessages).orderBy(contactMessages.createdAt);
  return c.json(messages);
});

// ── PUT /api/contact/:id/read — Marcar como leído ───────────
router.put("/:id/read", async (c) => {
  const db = getDb();
  const id = Number(c.req.param("id"));
  const [msg] = await db
    .update(contactMessages)
    .set({ read: true })
    .where(eq(contactMessages.id, id))
    .returning();
  return c.json(msg);
});

// ── DELETE /api/contact/:id — Eliminar mensaje ──────────────
router.delete("/:id", async (c) => {
  const db = getDb();
  const id = Number(c.req.param("id"));
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  return c.json({ success: true });
});

export default router;
