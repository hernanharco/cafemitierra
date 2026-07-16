// @ts-check

import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// ── Proxy target configurable ──────────────────────────────────
// En local sin Docker: usa localhost:8001
// En Docker: se setea API_TARGET=http://cafemitierra-api:8001
const API_TARGET = process.env.API_TARGET || "http://localhost:8001";
const SITE_URL = "https://cafemitierra.com";

export default defineConfig({
  // URL del sitio (necesario para sitemap y OG tags)
  site: SITE_URL,

  output: "server",

  // Seguridad — CSRF protection para formularios POST
  // En dev se desactiva por el proxy inverso, en prod Vercel maneja esto
  security: {
    checkOrigin: !!process.env.VERCEL,
  },

  // Adaptador: Vercel en producción, Node en desarrollo
  adapter: process.env.VERCEL
    ? vercel()
    : node({
        mode: "standalone",
      }),

  server: {
    host: true,
    port: 4323,
  },

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: API_TARGET,
          changeOrigin: true,
        },
      },
    },
  },
});
