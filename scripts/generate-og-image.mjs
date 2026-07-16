#!/usr/bin/env node

/**
 * Genera la imagen OG (Open Graph) para CafeMiTierra
 * Tamaño estándar: 1200×630px
 *
 * Uso: node scripts/generate-og-image.mjs
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "..", "frontend", "public", "og-image.jpg");

const WIDTH = 1200;
const HEIGHT = 630;

// Colores de la marca
const MAROON = "#4A312A";
const WARM_WHITE = "#FEFCF9";
const ROJO = "#B53B3B";
const AMARILLO = "#F2C84B";

// Crear SVG para el OG image con diseño más elaborado
const svgContent = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradiente de fondo -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${MAROON}" />
      <stop offset="100%" style="stop-color:#2A1A15" />
    </linearGradient>

    <!-- Gradiente para la barra decorativa -->
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${ROJO}" />
      <stop offset="50%" style="stop-color:${AMARILLO}" />
      <stop offset="100%" style="stop-color:${ROJO}" />
    </linearGradient>
  </defs>

  <!-- Fondo -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />

  <!-- Barra decorativa superior -->
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="url(#accent)" />

  <!-- Elemento decorativo - anillos de café -->
  <circle cx="150" cy="500" r="200" fill="none" stroke="${ROJO}" stroke-opacity="0.08" stroke-width="2" />
  <circle cx="180" cy="470" r="140" fill="none" stroke="${AMARILLO}" stroke-opacity="0.06" stroke-width="1.5" />
  <circle cx="1050" cy="150" r="180" fill="none" stroke="${ROJO}" stroke-opacity="0.08" stroke-width="2" />

  <!-- Líneas decorativas -->
  <line x1="100" y1="200" x2="400" y2="200" stroke="${AMARILLO}" stroke-opacity="0.3" stroke-width="1" />
  <line x1="800" y1="430" x2="1100" y2="430" stroke="${AMARILLO}" stroke-opacity="0.3" stroke-width="1" />

  <!-- Café Mi Tierra - text -->
  <text x="${WIDTH / 2}" y="260" font-family="'Playfair Display', Georgia, serif" font-size="72" font-weight="700" fill="${AMARILLO}" text-anchor="middle" letter-spacing="2">
    Café Mi Tierra
  </text>

  <!-- Subtítulo -->
  <text x="${WIDTH / 2}" y="330" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="300" fill="${WARM_WHITE}" text-anchor="middle" opacity="0.9">
    Café Colombiano · Panadería Artesanal
  </text>

  <!-- Línea separadora -->
  <line x1="450" y1="360" x2="750" y2="360" stroke="${ROJO}" stroke-opacity="0.5" stroke-width="2" />

  <!-- Ciudad -->
  <text x="${WIDTH / 2}" y="410" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="300" fill="${WARM_WHITE}" text-anchor="middle" opacity="0.6">
    Barcelona · España
  </text>

  <!-- Barra decorativa inferior -->
  <rect x="0" y="${HEIGHT - 8}" width="${WIDTH}" height="8" fill="url(#accent)" />
</svg>
`;

async function generate() {
  try {
    // Crear imagen desde SVG
    const svgBuffer = Buffer.from(svgContent);

    await sharp(svgBuffer).resize(WIDTH, HEIGHT).jpeg({ quality: 95 }).toFile(OUTPUT_PATH);

    console.log(`✅ OG image generated: ${OUTPUT_PATH}`);
    console.log(`   Dimensions: ${WIDTH}x${HEIGHT}`);
  } catch (error) {
    console.error("Error generating OG image:", error);
    process.exit(1);
  }
}

generate();
