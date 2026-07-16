#!/usr/bin/env node

/**
 * Genera íconos PWA para CafeMiTierra
 *
 * Uso: node scripts/generate-pwa-icons.mjs
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "frontend", "public");

const MAROON = "#4A312A";
const AMARILLO = "#F2C84B";
const WARM_WHITE = "#FEFCF9";

const SIZES = {
  "apple-touch-icon.png": 180,
  "icon-192.png": 192,
  "icon-512.png": 512,
};

// SVG con la "C" de Café Mi Tierra estilizada
/** @param {number} size */
function svgIcon(size) {
  const strokeWidth = Math.max(2, Math.round(size / 60));
  const fontSize = Math.round(size * 0.55);
  return `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${MAROON}" />
      <stop offset="100%" style="stop-color:#2A1A15" />
    </linearGradient>
  </defs>
  <!-- Fondo redondeado -->
  <rect width="512" height="512" rx="96" fill="url(#bg)" />
  <!-- Borde -->
  <rect x="${strokeWidth * 2}" y="${strokeWidth * 2}" width="${512 - strokeWidth * 4}" height="${512 - strokeWidth * 4}" rx="${96 - strokeWidth}" fill="none" stroke="${AMARILLO}" stroke-width="${strokeWidth}" />
  <!-- C de Café -->
  <text x="256" y="310" font-family="'Playfair Display', Georgia, serif" font-size="${fontSize}" font-weight="700" fill="${AMARILLO}" text-anchor="middle">C</text>
  <!-- Puntito decorativo -->
  <circle cx="380" cy="180" r="${Math.round(size / 40)}" fill="${WARM_WHITE}" opacity="0.3" />
</svg>`;
}

async function generate() {
  console.log("📱 Generando íconos PWA...\n");

  for (const [filename, size] of Object.entries(SIZES)) {
    const outputPath = join(PUBLIC_DIR, filename);
    const svg = svgIcon(size);

    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outputPath);

    console.log(`  ✅ ${filename} (${size}x${size})`);
  }

  console.log("\n✨ Íconos generados!");
}

generate().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
