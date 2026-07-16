import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import { businessInfo } from "../db/schema.ts";

const router = new Hono().basePath("/api/site");

// ── Secciones que se pueden editar desde el admin ─────────────
// Cada sección es una fila en business_info con key = nombre de sección
const SITE_SECTIONS = [
  "hero",
  "about",
  "services",
  "schedule",
  "contact",
  "seo",
  "features",
  "hero_images",
  "name",
  "description",
  "tagline",
  "phone",
  "address",
  "coordinates",
  "hours",
  "rating",
  "reviews_count",
  "instagram",
  "price_range",
  "google_maps_url",
  "services_title",
  "services_subtitle",
  "services_description",
];

// ── GET /api/site — Obtener todos los datos del sitio ────────
router.get("/", async (c) => {
  const db = getDb();

  try {
    const rows = await db.select().from(businessInfo);
    if (rows.length === 0) {
      return c.json({ error: "No hay datos del sitio. Ejecutá pnpm seed primero." }, 404);
    }

    // Convertir filas (key, value) a un solo objeto
    const data: Record<string, unknown> = {};
    for (const row of rows) {
      data[row.key] = row.value;
    }

    return c.json(data);
  } catch (error) {
    console.error("[site] Error leyendo datos:", error);
    return c.json({ error: "Error al leer datos del sitio" }, 500);
  }
});

// ── PUT /api/site — Actualizar datos completos ───────────────
// Recibe un objeto con las secciones a actualizar
router.put("/", async (c) => {
  const body = await c.req.json();
  const db = getDb();

  try {
    // Upsert cada sección del body en business_info
    for (const [key, value] of Object.entries(body)) {
      if (!SITE_SECTIONS.includes(key)) continue; // Ignorar secciones no válidas

      // Verificar si ya existe
      const existing = await db
        .select()
        .from(businessInfo)
        .where(eq(businessInfo.key, key))
        .limit(1);

      if (existing.length > 0) {
        // Actualizar
        await db
          .update(businessInfo)
          .set({ value: value as any, updatedAt: new Date() })
          .where(eq(businessInfo.key, key));
      } else {
        // Insertar
        await db.insert(businessInfo).values({ key, value: value as any });
      }
    }

    // Devolver todos los datos actualizados
    const rows = await db.select().from(businessInfo);
    const data: Record<string, unknown> = {};
    for (const row of rows) {
      data[row.key] = row.value;
    }
    return c.json(data);
  } catch (error) {
    console.error("[site] Error actualizando datos:", error);
    return c.json({ error: "Error al actualizar datos del sitio" }, 500);
  }
});

// ── PUT /api/site/:section — Actualizar una sección específica ─
router.put("/:section", async (c) => {
  const section = c.req.param("section");
  const body = await c.req.json();
  const db = getDb();

  if (!SITE_SECTIONS.includes(section)) {
    return c.json({ error: `Sección "${section}" no válida` }, 400);
  }

  try {
    const existing = await db
      .select()
      .from(businessInfo)
      .where(eq(businessInfo.key, section))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(businessInfo)
        .set({ value: body, updatedAt: new Date() })
        .where(eq(businessInfo.key, section));
    } else {
      await db.insert(businessInfo).values({ key: section, value: body });
    }

    // Devolver todos los datos
    const rows = await db.select().from(businessInfo);
    const data: Record<string, unknown> = {};
    for (const row of rows) {
      data[row.key] = row.value;
    }
    return c.json(data);
  } catch (error) {
    console.error("[site] Error actualizando sección:", error);
    return c.json({ error: "Error al actualizar sección" }, 500);
  }
});

export default router;
