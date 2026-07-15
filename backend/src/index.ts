import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "..", ".env") });

import { serve } from "@hono/node-server";
import app from "./app.ts";

// ── Iniciar servidor ───────────────────────────────────────────
const port = Number(process.env.PORT) || 8001;

console.log(`🌱 CafeMiTierra API — http://localhost:${port}`);
console.log(`📦 Entorno: ${process.env.NODE_ENV || "development"}`);

serve({
  fetch: app.fetch,
  port,
});
