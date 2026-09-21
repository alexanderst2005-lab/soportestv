import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Save } from 'lucide-react';
import ImageUploader from '../../components/admin/ImageUploader';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    old_price: '',
    description: '',
    category: '',
    stock_status: 'disponible',
    images: []
  });

  useEffect(() => {
    async function loadData() {
      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('name').order('name');
      if (cats) setCategories(cats.map(c => c.name));

      // Fetch product if editing
      if (isEditing) {
        const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
        if (product) {
          setFormData({
            name: product.name || '',
            price: product.price || '',
            old_price: product.old_price || '',
            description: product.description || '',
            category: product.category || '',
            stock_status: product.stock_status || 'disponible',
            images: product.images || (product.image_url ? [product.image_url] : [])
          });
        }
      }
    }
    loadData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      ...formData,
      price: parseInt(formData.price) || 0,
      old_price: formData.old_price ? parseInt(formData.old_price) : null,
      image_url: formData.images.length > 0 ? formData.images[0] : ''
    };

    // Optimistic Save (Fire and Forget)
    if (isEditing) {
      supabase.from('products').update(productData).eq('id', id).then();
    } else {
      supabase.from('products').insert([productData]).then();
    }

    // Instantly redirect with optimistic state
    navigate('/admin/products', { state: { optimisticProduct: productData, isEditing, id } });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'white', color: '#0B1F3A', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
        </div>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Col 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Nombre del Producto *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} style={inputStyle} placeholder="Ej. Soporte Articulado P4" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Precio ($) *</label>
                <input type="number" name="price" required value={formData.price} onChange={handleChange} style={inputStyle} placeholder="Ej. 120000" />
              </div>
              <div>
                <label style={labelStyle}>Precio Anterior ($)</label>
                <input type="number" name="old_price" value={formData.old_price} onChange={handleChange} style={inputStyle} placeholder="Opcional" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Categoría</label>
              <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                <option value="">Selecciona una categoría</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Estado *</label>
              <select name="stock_status" required value={formData.stock_status} onChange={handleChange} style={inputStyle}>
                <option value="disponible">DISPONIBLE</option>
                <option value="agotado">AGOTADO</option>
                <option value="oculto">OCULTO (No mostrar en la página)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Descripción corta</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleChange} style={{...inputStyle, resize: 'vertical'}} placeholder="Resumen o características principales..." />
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <ImageUploader images={formData.images} onImagesChange={handleImagesChange} />
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #E9ECEF', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link to="/admin/products" style={{ padding: '12px 24px', borderRadius: '8px', background: '#F8F9FA', color: '#343A40', textDecoration: 'none', fontWeight: 600 }}>Cancelar</Link>
            <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', background: '#FACC15', color: '#0B1F3A', border: 'none', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              <Save size={18} /> {loading ? 'GUARDANDO...' : 'GUARDAR PRODUCTO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#343A40', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' };
