import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import ImageUploader from '../../components/admin/ImageUploader';
import { getThumbUrl } from '../../imageUtils.js';

export default function GalleryManager() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const cached = localStorage.getItem('admin_gallery');
    if (cached) {
      setGallery(JSON.parse(cached));
      setLoading(false);
    } else {
      setLoading(true);
    }
    const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setGallery(data);
      localStorage.setItem('admin_gallery', JSON.stringify(data));
    }
    setLoading(false);
  };

  const handleImagesChange = async (newImages) => {
    if (newImages.length > 0) {
      const inserts = newImages.map(url => ({ image_url: url }));
      const { error } = await supabase.from('gallery').insert(inserts);
      
      if (!error) {
        fetchGallery();
      } else {
        alert('Error al guardar en la galería: ' + error.message);
      }
    }
  };

  const handleDelete = async (id, url) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta imagen de la galería?')) return;
    
    // Opcional: Eliminar del bucket de Supabase
    // const filePath = url.split('/').pop();
    // await supabase.storage.from('product-images').remove([filePath]);

    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (!error) {
      setGallery(gallery.filter(item => item.id !== id));
    } else {
      alert('Error eliminando la imagen');
    }
  };

  if (loading) return <div>Cargando galería...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px' }}>Galería de Proyectos</h1>
          <p style={{ color: '#6C757D', margin: 0 }}>Sube fotos de tus instalaciones reales para mostrarlas en la página pública.</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ImageIcon size={20} color="#0B1F3A" /> Subir Nuevas Fotos
        </h2>
        
        {/* Usamos el mismo Uploader que comprime las imágenes */}
        <ImageUploader 
          images={[]} 
          onImagesChange={handleImagesChange} 
        />
        
        <div style={{ borderTop: '1px solid #E9ECEF', marginTop: '24px', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Fotos Publicadas ({gallery.length})</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
            {gallery.map(item => (
              <div key={item.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1/1', border: '1px solid #E9ECEF' }}>
                <img
                  src={getThumbUrl(item.image_url)}
                  alt="Galería"
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button 
                  onClick={() => handleDelete(item.id, item.image_url)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  title="Eliminar foto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {gallery.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#6C757D', background: '#F8F9FA', borderRadius: '8px' }}>
                Aún no has subido fotos a la galería.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
