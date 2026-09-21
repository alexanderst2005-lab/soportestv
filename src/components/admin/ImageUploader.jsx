import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { UploadCloud, X, Loader2 } from 'lucide-react';

export default function ImageUploader({ images = [], onImagesChange }) {
  const [uploading, setUploading] = useState(false);

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

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
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

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#343A40', marginBottom: '8px' }}>
        Fotografías del Producto
      </label>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        {images.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E9ECEF' }}>
            <img src={url} alt={`Imagen ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
