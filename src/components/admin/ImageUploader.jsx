import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { getThumbUrl } from '../../imageUtils.js';

export default function ImageUploader({ images = [], onImagesChange }) {
  const [uploading, setUploading] = useState(false);

  /**
   * Genera una versión optimizada de la imagen usando Canvas.
   * @param {File} file - Archivo de imagen original
   * @param {number} maxWidth - Ancho máximo en px
   * @param {number} quality - Calidad 0-1
   * @param {string} suffix - Sufijo para el nombre del archivo ('web' o 'thumb')
   * @returns {Promise<File>} - Archivo WebP optimizado
   */
  const generateOptimizedImage = (file, maxWidth, quality, suffix) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar si supera el ancho máximo (respetando proporción)
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Intentar WebP primero (soporte universal en browsers modernos)
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const uniqueId = `${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(
                  new File([blob], `${uniqueId}_${suffix}.webp`, {
                    type: 'image/webp',
                    lastModified: Date.now(),
                  })
                );
              } else {
                // Fallback a JPEG si WebP no está disponible
                canvas.toBlob(
                  (jpegBlob) => {
                    resolve(
                      new File([jpegBlob], `${uniqueId}_${suffix}.jpg`, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                      })
                    );
                  },
                  'image/jpeg',
                  quality
                );
              }
            },
            'image/webp',
            quality
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      setUploading(true);
      const newUrls = [];

      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
          alert(`El archivo ${file.name} no es una imagen válida (JPG, PNG, WEBP).`);
          continue;
        }

        // Generar versión WEB (max 900px, calidad 78%) — para la página pública
        const webFile = await generateOptimizedImage(file, 900, 0.78, 'web');

        // Generar versión THUMB (max 200px, calidad 70%) — para miniaturas en el admin
        const thumbFile = await generateOptimizedImage(file, 200, 0.70, 'thumb');

        // Subir versión web
        const { error: webError } = await supabase.storage
          .from('product-images')
          .upload(`web/${webFile.name}`, webFile, { upsert: false });

        if (webError) throw webError;

        // Subir versión thumb
        await supabase.storage
          .from('product-images')
          .upload(`thumb/${thumbFile.name}`, thumbFile, { upsert: false });
        // No bloqueamos si falla el thumb — la web sigue funcionando

        // Obtener URL pública de la versión web (la que se guarda en DB)
        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(`web/${webFile.name}`);

        newUrls.push(data.publicUrl);
      }

      onImagesChange([...images, ...newUrls]);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error subiendo las imágenes. Intenta nuevamente.');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset input
    }
  };

  const handleRemove = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  /**
   * getThumbUrl ahora viene del módulo central imageUtils.js
   * que usa la API de transformación de Supabase para todas las imágenes.
   */

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#343A40', marginBottom: '8px' }}>
        Fotografías del Producto
      </label>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        {images.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E9ECEF' }}>
            <img
              src={getThumbUrl(url)}
              alt={`Imagen ${i}`}
              loading="lazy"
              decoding="async"
              width={120}
              height={120}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button 
              type="button"
              onClick={() => handleRemove(i)}
              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '8px', border: '2px dashed #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#F8F9FA', cursor: 'pointer' }}>
          <UploadCloud size={24} color="#94A3B8" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0B1F3A', textAlign: 'center' }}>Agregar<br/>Imagen</span>
          <input 
            type="file" 
            multiple
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileChange}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          />
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
              <Loader2 size={24} className="animate-spin" color="#0B1F3A" />
            </div>
          )}
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#6C757D', margin: 0 }}>Puedes seleccionar varias imágenes al mismo tiempo.</p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
