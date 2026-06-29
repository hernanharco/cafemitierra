import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

// ── Galería de imágenes ────────────────────────────────────────
export const galleryImages = pgTable('gallery_images', {
  id: serial('id').primaryKey(),
  title: text('title'),
  description: text('description'),
  imageUrl: text('image_url').notNull(),        // Cloudinary URL
  imagePublicId: text('image_public_id'),        // Cloudinary public_id
  alt: text('alt'),
  sortOrder: integer('sort_order').default(0),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Reseñas / Testimonios ──────────────────────────────────────
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  author: text('author').notNull(),
  rating: integer('rating').notNull().default(5),
  text: text('text').notNull(),
  source: text('source').default('manual'),     // 'google', 'manual', etc.
  visible: boolean('visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Mensajes de contacto ───────────────────────────────────────
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Información del negocio (editable desde admin) ──────────────
export const businessInfo = pgTable('business_info', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),   // ej: 'hours', 'address', 'phone', 'instagram'
  value: jsonb('value').notNull(),        // JSON con el valor
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Tipos exportados ───────────────────────────────────────────
export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

export type BusinessInfo = typeof businessInfo.$inferSelect;
export type NewBusinessInfo = typeof businessInfo.$inferInsert;
