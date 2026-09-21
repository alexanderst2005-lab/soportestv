import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { UploadCloud, X, Loader2 } from 'lucide-react';

export default function ImageUploader({ currentImage, onImageUpload }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Basic validation
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        alert('Por favor sube una imagen válida (JPG, PNG, WEBP).');
        return;
      }

      setUploading(true);

      // Create object URL for instant preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      
      onImageUpload(data.publicUrl);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error subiendo la imagen. Intenta nuevamente.');
      setPreview(currentImage || ''); // Revert preview on error
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onImageUpload('');
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#343A40', marginBottom: '8px' }}>
        Fotografía del Producto
      </label>
      
      {preview ? (
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E9ECEF' }}>
          <img src={preview} alt="Vista previa" style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '4/3' }} />
          <button 
            type="button"
            onClick={handleRemove}
            style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
              <Loader2 size={24} className="animate-spin" color="#0B1F3A" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Subiendo...</span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px', height: '200px', borderRadius: '8px', border: '2px dashed #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#F8F9FA', cursor: 'pointer' }}>
          <UploadCloud size={32} color="#94A3B8" />
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0B1F3A', display: 'block' }}>Haz clic para subir imagen</span>
            <span style={{ fontSize: '0.75rem', color: '#6C757D' }}>JPG, PNG o WEBP</span>
          </div>
          <input 
            type="file" 
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
      )}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
