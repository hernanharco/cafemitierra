import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BUSINESS_JSON_PATH = resolve(__dirname, "../../../frontend/src/data/business.json");

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function readBusiness(): any {
  return JSON.parse(readFileSync(BUSINESS_JSON_PATH, "utf-8"));
}

function writeBusiness(data: any): void {
  writeFileSync(BUSINESS_JSON_PATH, JSON.stringify(data, null, 2), "utf-8");
}

const router = new Hono().basePath("/api/site");

router.get("/", (c) => {
  const data = readBusiness();
  return c.json(data);
});

router.put("/", async (c) => {
  const body = await c.req.json();
  const current = readBusiness();
  const merged = deepMerge(current, body);
  writeBusiness(merged);
  return c.json(merged);
});

router.put("/:section", async (c) => {
  const section = c.req.param("section");
  const body = await c.req.json();
  const current = readBusiness();
  current[section] = body;
  writeBusiness(current);
  return c.json(current);
});

export default router;
