import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { galleryImages } from '../db/schema.ts';
import { uploadImage, deleteImage } from '../services/cloudinary.ts';

const router = new Hono()
  .basePath('/api/gallery');

// ── Schema de validación ─────────────────────────────────────
const gallerySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  alt: z.string().optional(),
  featured: z.boolean().optional().default(false),
  sortOrder: z.number().optional().default(0),
});

// ── GET /api/gallery — Listar imágenes ──────────────────────
router.get('/', async (c) => {
  const db = getDb();
  const images = await db.select().from(galleryImages).orderBy(galleryImages.sortOrder);
  return c.json(images);
});

// ── POST /api/gallery/upload — Subir imagen ─────────────────
router.post('/upload', async (c) => {
  const db = getDb();
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string ?? '';
  const alt = formData.get('alt') as string ?? '';
  const featured = formData.get('featured') === 'true';
  const folder = formData.get('folder') as string || 'gallery';

  if (!file) return c.json({ error: 'Archivo no proporcionado' }, 400);

  // Subir a Cloudinary
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadImage(buffer, `cafemitierra/${folder}`);

  const [image] = await db.insert(galleryImages).values({
    title,
    alt,
    featured,
    imageUrl: result.url,
    imagePublicId: result.publicId,
  }).returning();

  return c.json(image, 201);
});

// ── DELETE /api/gallery/:id — Eliminar imagen ───────────────
router.delete('/:id', async (c) => {
  const db = getDb();
  const id = Number(c.req.param('id'));

  const [image] = await db.select().from(galleryImages).where(eq(galleryImages.id, id)).limit(1);
  if (!image) return c.json({ error: 'Imagen no encontrada' }, 404);

  // Eliminar de Cloudinary si tiene public_id
  if (image.imagePublicId) {
    await deleteImage(image.imagePublicId);
  }

  await db.delete(galleryImages).where(eq(galleryImages.id, id));
  return c.json({ success: true });
});

// ── PUT /api/gallery/:id — Actualizar metadatos ─────────────
router.put('/:id', zValidator('json', gallerySchema.partial()), async (c) => {
  const db = getDb();
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');
  const [image] = await db.update(galleryImages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(galleryImages.id, id))
    .returning();
  if (!image) return c.json({ error: 'Imagen no encontrada' }, 404);
  return c.json(image);
});

export default router;
