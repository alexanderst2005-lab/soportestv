import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Trash2 } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error) setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;

    const { data, error } = await supabase.from('categories').insert([{ name: newCat.trim() }]).select();
    if (!error && data) {
      setCategories([...categories, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCat('');
    } else {
      alert('Error al agregar categoría. (Puede que ya exista)');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"?`)) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert('Error al eliminar categoría.');
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Categorías</h1>
        <p style={{ color: '#6C757D', margin: 0 }}>Administra las categorías de tus productos.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Formulario Agregar */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem', color: '#0B1F3A' }}>Nueva Categoría</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="text" 
              required
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Ej. Soportes, Cables, Hogar..."
              style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: '#0B1F3A', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={18} /> AGREGAR
            </button>
          </form>
        </div>

        {/* Lista de Categorías */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#6C757D' }}>Cargando categorías...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', borderBottom: '2px solid #E9ECEF' }}>
                  <th style={{ padding: '16px', color: '#6C757D', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Nombre de Categoría</th>
                  <th style={{ padding: '16px', color: '#6C757D', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', width: '80px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan="2" style={{ padding: '30px', textAlign: 'center', color: '#6C757D' }}>No hay categorías.</td></tr>
                ) : categories.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #E9ECEF' }}>
                    <td style={{ padding: '16px', fontWeight: 600, color: '#343A40' }}>{cat.name}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button onClick={() => handleDelete(cat.id, cat.name)} style={{ padding: '8px', borderRadius: '6px', background: '#FEE2E2', color: '#B91C1C', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
