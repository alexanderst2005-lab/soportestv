/**
 * imageUtils.js
 * Utilidades de optimización de imágenes para Supabase Storage.
 *
 * Supabase Storage soporta transformación de imágenes en tiempo real
 * usando el endpoint /render/image/public/ con parámetros de tamaño y calidad.
 * Esto funciona para TODAS las imágenes ya existentes en el storage,
 * sin necesidad de re-subirlas.
 *
 * Ref: https://supabase.com/docs/guides/storage/serving/image-transformations
 */

const SUPABASE_URL = 'https://qejnbyywetjbemevujsj.supabase.co';
const STORAGE_OBJECT = `${SUPABASE_URL}/storage/v1/object/public/`;
const STORAGE_RENDER = `${SUPABASE_URL}/storage/v1/render/image/public/`;

/**
 * Convierte una URL de Supabase Storage al endpoint de transformación
 * con los parámetros de ancho y calidad especificados.
 *
 * Si la URL NO es de Supabase (imagen externa), la retorna sin cambios.
 * Si la imagen ya está en la ruta /web/ o /thumb/ (nuevo sistema),
 * respeta esa ruta y solo agrega los parámetros de transformación.
 *
 * @param {string} url - URL original de la imagen
 * @param {number} width - Ancho máximo en píxeles
 * @param {number} quality - Calidad 1-100
 * @returns {string} URL con transformación aplicada
 */
export function getOptimizedUrl(url, width = 900, quality = 78) {
  if (!url) return url;

  // Solo transforma URLs de Supabase Storage
  if (!url.includes(SUPABASE_URL)) return url;

  // Si ya tiene el endpoint de render, solo actualiza los params
  if (url.includes('/render/image/public/')) {
    const base = url.split('?')[0];
    return `${base}?width=${width}&quality=${quality}&format=webp`;
  }

  // Convierte /object/public/ → /render/image/public/
  if (url.includes(STORAGE_OBJECT)) {
    const path = url.replace(STORAGE_OBJECT, '');
    // Eliminar params existentes del path
    const cleanPath = path.split('?')[0];
    return `${STORAGE_RENDER}${cleanPath}?width=${width}&quality=${quality}&format=webp`;
  }

  return url;
}

/**
 * URL optimizada para mostrar en la página pública (catálogo de productos).
 * Max 900px, calidad 78%, WebP — suficiente para desktop y móvil.
 */
export function getWebUrl(url) {
  return getOptimizedUrl(url, 900, 78);
}

/**
 * URL optimizada para miniaturas en el panel admin.
 * Max 200px, calidad 70%, WebP — ideal para thumbnails de 50-150px.
 */
export function getThumbUrl(url) {
  return getOptimizedUrl(url, 200, 70);
}

/**
 * URL optimizada para el lightbox (zoom máximo).
 * Max 1400px, calidad 85%, WebP — calidad alta para visualización ampliada.
 */
export function getLightboxUrl(url) {
  return getOptimizedUrl(url, 1400, 85);
}
