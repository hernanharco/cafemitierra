#!/usr/bin/env tsx
/**
 * Seed script — Migra datos iniciales a la base de datos
 *
 * 1. Migra reseñas existentes de business.json a la tabla `reviews`
 * 2. Migra datos del sitio a la tabla `business_info`
 *
 * Uso: pnpm --filter backend seed
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../src/db/index.ts";
import { businessInfo, reviews as reviewsTable } from "../src/db/schema.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUSINESS_JSON_PATH = resolve(__dirname, "../../frontend/src/data/business.json");

// Secciones del sitio que se migran a business_info
const SITE_SECTIONS = [
  "name", "description", "tagline", "phone",
  "address", "coordinates", "hours", "features",
  "services_title", "services_subtitle", "services_description",
  "services", "hero_images", "contact", "seo",
  "rating", "reviews_count", "instagram", "price_range",
  "google_maps_url",
];

async function seedSiteData(db: ReturnType<typeof getDb>) {
  console.log("📖 Leyendo business.json...");
  let business: Record<string, unknown>;
  try {
    const raw = readFileSync(BUSINESS_JSON_PATH, "utf-8");
    business = JSON.parse(raw);
  } catch (error) {
    console.error("❌ No se pudo leer business.json:", error);
    process.exit(1);
  }

  console.log("🏗️  Migrando datos del sitio a business_info...");

  let migrated = 0;
  for (const section of SITE_SECTIONS) {
    if (!(section in business)) {
      console.log(`  ⏭️  "${section}" no está en business.json, se omite`);
      continue;
    }

    const value = business[section];
    if (value === undefined || value === null) continue;

    // Verificar si ya existe en la DB
    const existing = await db
      .select()
      .from(businessInfo)
      .where(eq(businessInfo.key, section))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ℹ️  "${section}" ya existe en la DB, se omite`);
      continue;
    }

    await db.insert(businessInfo).values({ key: section, value: value as any });
    console.log(`  ✅ "${section}" migrado`);
    migrated++;
  }

  console.log(`\n📊 ${migrated} secciones migradas a business_info`);
}

async function seedReviews(db: ReturnType<typeof getDb>) {
  let business: Record<string, unknown>;
  try {
    const raw = readFileSync(BUSINESS_JSON_PATH, "utf-8");
    business = JSON.parse(raw);
  } catch (error) {
    console.error("❌ No se pudo leer business.json:", error);
    return;
  }

  const existingReviews = business.reviews as Array<{
    author?: string;
    rating?: number;
    text?: string;
    source?: string;
    visible?: boolean;
  }>;

  if (!existingReviews || existingReviews.length === 0) {
    console.log("📭 No hay reseñas para migrar");
    return;
  }

  console.log(`📝 ${existingReviews.length} reseñas encontradas en business.json`);

  // Verificar si ya hay reseñas en la DB
  const existingInDb = await db.select().from(reviewsTable);
  if (existingInDb.length > 0) {
    console.log(`ℹ️  La DB ya tiene ${existingInDb.length} reseñas, se omite migración`);
    return;
  }

  for (const review of existingReviews) {
    if (!review.author || !review.text) {
      console.warn(`⚠️  Reseña inválida omitida: ${JSON.stringify(review)}`);
      continue;
    }

    await db.insert(reviewsTable).values({
      author: review.author,
      rating: Math.round(review.rating ?? 5),
      text: review.text,
      source: review.source || "manual",
      visible: review.visible ?? true,
    });
  }

  console.log(`✅ ${existingReviews.length} reseñas migradas a la DB`);
}

import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Seed — CafeMiTierra\n");

  const db = getDb();

  await seedSiteData(db);
  console.log("");
  await seedReviews(db);

  console.log("\n✨ Seed completado!");
}

main().catch((error) => {
  console.error("💥 Error en seed:", error);
  process.exit(1);
});
