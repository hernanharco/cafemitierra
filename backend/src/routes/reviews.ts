import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BUSINESS_JSON = resolve(__dirname, '../../../frontend/src/data/business.json');

function readBusiness() {
  return JSON.parse(readFileSync(BUSINESS_JSON, 'utf-8'));
}

function writeBusiness(data: unknown) {
  writeFileSync(BUSINESS_JSON, JSON.stringify(data, null, 2), 'utf-8');
}

const router = new Hono()
  .basePath('/api/reviews');

const reviewSchema = z.object({
  author: z.string().min(1, 'El nombre es obligatorio'),
  rating: z.number().min(1).max(5),
  text: z.string().min(1, 'El texto es obligatorio'),
  source: z.string().optional().default('web'),
  visible: z.boolean().optional().default(false),
});

// ── GET /api/reviews — Todas las reseñas (admin) ────────────
router.get('/', async (c) => {
  const data = readBusiness();
  return c.json(data.reviews || []);
});

// ── GET /api/reviews/public — Solo visibles (landing) ──────
router.get('/public', async (c) => {
  const data = readBusiness();
  const visible = (data.reviews || []).filter((r: { visible?: boolean }) => r.visible !== false);
  return c.json(visible);
});

// ── POST /api/reviews — Enviar reseña (público) ────────────
router.post('/', zValidator('json', reviewSchema), async (c) => {
  const data = c.req.valid('json');
  const business = readBusiness();

  const reviews = business.reviews || [];
  reviews.push({
    ...data,
    source: data.source || 'web',
    visible: false, // Siempre pendiente de aprobación
  });

  business.reviews = reviews;
  writeBusiness(business);

  return c.json({ success: true, message: 'Reseña recibida. Gracias!' }, 201);
});

// ── PUT /api/reviews/:index — Actualizar reseña (admin) ────
router.put('/:index', zValidator('json', reviewSchema.partial()), async (c) => {
  const index = Number(c.req.param('index'));
  const data = c.req.valid('json');
  const business = readBusiness();

  const reviews = business.reviews || [];
  if (index < 0 || index >= reviews.length) {
    return c.json({ error: 'Reseña no encontrada' }, 404);
  }

  reviews[index] = { ...reviews[index], ...data };
  business.reviews = reviews;
  writeBusiness(business);

  return c.json(reviews[index]);
});

// ── DELETE /api/reviews/:index — Eliminar reseña (admin) ───
router.delete('/:index', async (c) => {
  const index = Number(c.req.param('index'));
  const business = readBusiness();

  const reviews = business.reviews || [];
  if (index < 0 || index >= reviews.length) {
    return c.json({ error: 'Reseña no encontrada' }, 404);
  }

  reviews.splice(index, 1);
  business.reviews = reviews;
  writeBusiness(business);

  return c.json({ success: true });
});

export default router;
