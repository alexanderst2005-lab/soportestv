/**
 * Script de optimización de imágenes estáticas.
 * Convierte hero.jpg, install-bg.jpg, after.jpg, logo.jpg a WebP.
 * Ejecutar una sola vez con: node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const images = [
  {
    input: 'hero.jpg',
    output: 'hero.webp',
    width: 1920,
    quality: 80,
  },
  {
    input: 'install-bg.jpg',
    output: 'install-bg.webp',
    width: 1920,
    quality: 78,
  },
  {
    input: 'after.jpg',
    output: 'after.webp',
    width: 1200,
    quality: 78,
  },
  {
    input: 'logo.jpg',
    output: 'logo.webp',
    width: 120,
    quality: 85,
  },
];

console.log('🔄 Optimizando imágenes estáticas...\n');

for (const img of images) {
  const inputPath = join(publicDir, img.input);
  const outputPath = join(publicDir, img.output);

  if (!existsSync(inputPath)) {
    console.warn(`⚠️  No encontrado: ${img.input} — se omite.`);
    continue;
  }

  const inputStat = (await import('fs')).statSync(inputPath);
  const inputKB = Math.round(inputStat.size / 1024);

  await sharp(inputPath)
    .resize({ width: img.width, withoutEnlargement: true })
    .webp({ quality: img.quality, effort: 6 })
    .toFile(outputPath);

  const outputStat = (await import('fs')).statSync(outputPath);
  const outputKB = Math.round(outputStat.size / 1024);
  const saving = Math.round(((inputStat.size - outputStat.size) / inputStat.size) * 100);

  console.log(`✅ ${img.input} → ${img.output}`);
  console.log(`   ${inputKB} KB → ${outputKB} KB  (${saving}% ahorro)\n`);
}

console.log('🎉 Optimización completada.');
