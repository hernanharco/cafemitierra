import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '..', '.env') });

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Rutas
import siteRoutes from './routes/site.ts';
import galleryRoutes from './routes/gallery.ts';
import reviewRoutes from './routes/reviews.ts';
import contactRoutes from './routes/contact.ts';
import authRoutes from './routes/auth.ts';

// Middleware
import { authMiddleware } from './middleware/auth.ts';

const app = new Hono();

// ── Middleware global ───────────────────────────────────────────
app.use('*', logger());

app.use('*', cors({
  origin: JSON.parse(process.env.CORS_ORIGINS || '["http://localhost:4321"]'),
  credentials: true,
}));

// ── Health check (público) ──────────────────────────────────────
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Rutas públicas (sin auth) ──────────────────────────────────
app.route('/', authRoutes);

// ── Rutas protegidas (requieren token authCore) ────────────────
app.use('/api/*', authMiddleware);
app.route('/', siteRoutes);
app.route('/', galleryRoutes);
app.route('/', reviewRoutes);
app.route('/', contactRoutes);

// ── Iniciar servidor ───────────────────────────────────────────
const port = Number(process.env.PORT) || 8001;

console.log(`🌱 CafeMiTierra API — http://localhost:${port}`);
console.log(`📦 Entorno: ${process.env.NODE_ENV || 'development'}`);

serve({
  fetch: app.fetch,
  port,
});
