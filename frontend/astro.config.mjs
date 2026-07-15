// @ts-check

import node from "@astrojs/node";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// ── Proxy target configurable ──────────────────────────────────
// En local sin Docker: usa localhost:8001
// En Docker: se setea API_TARGET=http://cafemitierra-api:8001
const API_TARGET = process.env.API_TARGET || "http://localhost:8001";

export default defineConfig({
  // En Astro 7, output: "static" (default) permite páginas SSR
  // con export const prerender = false
  output: "server",

  // Seguridad
  security: {
    checkOrigin: false,
  },

  // Adaptador: Vercel en producción, Node en desarrollo
  adapter: process.env.VERCEL
    ? vercel()
    : node({
        mode: "standalone",
        trustForwardedHeaders: true,
      }),

  server: {
    host: true,
    port: 4323,
  },

  integrations: [svelte()],

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
