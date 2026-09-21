import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el producto "${name}"?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert('Error al eliminar producto.');
      }
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const statuses = ['disponible', 'agotado', 'oculto'];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];

    const { error } = await supabase.from('products').update({ stock_status: nextStatus }).eq('id', id);
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, stock_status: nextStatus } : p));
    }
  };

  const getStatusColor = (status) => {
    if (status === 'disponible') return { bg: '#D1FAE5', color: '#065F46' };
    if (status === 'agotado') return { bg: '#FEF3C7', color: '#92400E' };
    return { bg: '#F3F4F6', color: '#374151' };
  };

  const formatPrice = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Productos</h1>
          <p style={{ color: '#6C757D', margin: 0 }}>Gestiona el inventario de la tienda.</p>
        </div>
        <Link to="/admin/products/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0B1F3A', color: 'white', padding: '12px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
          <Plus size={18} /> AGREGAR PRODUCTO
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6C757D' }}>Cargando productos...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', borderBottom: '2px solid #E9ECEF' }}>
                  <th style={{ padding: '16px', color: '#6C757D', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Foto</th>
                  <th style={{ padding: '16px', color: '#6C757D', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Nombre</th>
                  <th style={{ padding: '16px', color: '#6C757D', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Precio</th>
                  <th style={{ padding: '16px', color: '#6C757D', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Estado</th>
                  <th style={{ padding: '16px', color: '#6C757D', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6C757D' }}>No hay productos registrados.</td></tr>
                ) : products.map(product => {
                  const sColor = getStatusColor(product.stock_status);
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid #E9ECEF' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#F8F9FA', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <ImageIcon size={20} color="#ADB5BD" />
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600, color: '#343A40' }}>
                        {product.name}
                        <div style={{ fontSize: '0.75rem', color: '#6C757D', fontWeight: 400, marginTop: '4px' }}>{product.category || 'Sin categoría'}</div>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{formatPrice(product.price)}</td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => handleStatusChange(product.id, product.stock_status)}
                          style={{ background: sColor.bg, color: sColor.color, border: 'none', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer' }}
                        >
                          {product.stock_status}
                        </button>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <Link to={`/admin/products/edit/${product.id}`} style={{ padding: '8px', borderRadius: '6px', background: '#EBF4FF', color: '#1E4D91', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Edit size={16} />
                          </Link>
                          <button onClick={() => handleDelete(product.id, product.name)} style={{ padding: '8px', borderRadius: '6px', background: '#FEE2E2', color: '#B91C1C', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
