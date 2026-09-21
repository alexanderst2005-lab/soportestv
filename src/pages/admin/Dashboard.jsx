import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Package, Tag, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    outOfStockProducts: 0,
    hiddenProducts: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('stock_status', { count: 'exact' }),
          supabase.from('categories').select('*', { count: 'exact', head: true })
        ]);

        const products = prodRes.data || [];
        
        setStats({
          totalProducts: products.length,
          availableProducts: products.filter(p => p.stock_status === 'disponible').length,
          outOfStockProducts: products.filter(p => p.stock_status === 'agotado').length,
          hiddenProducts: products.filter(p => p.stock_status === 'oculto').length,
          totalCategories: catRes.count || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div>Cargando estadísticas...</div>;

  const statCards = [
    { title: 'Total Productos', value: stats.totalProducts, icon: <Package size={24} />, color: '#4A90D9', bg: 'rgba(74, 144, 217, 0.1)' },
    { title: 'Disponibles', value: stats.availableProducts, icon: <CheckCircle size={24} />, color: '#25D366', bg: 'rgba(37, 211, 102, 0.1)' },
    { title: 'Agotados', value: stats.outOfStockProducts, icon: <AlertTriangle size={24} />, color: '#FACC15', bg: 'rgba(250, 204, 21, 0.1)' },
    { title: 'Ocultos', value: stats.hiddenProducts, icon: <Activity size={24} />, color: '#6C757D', bg: 'rgba(108, 117, 125, 0.1)' },
    { title: 'Categorías', value: stats.totalCategories, icon: <Tag size={24} />, color: '#1E4D91', bg: 'rgba(30, 77, 145, 0.1)' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: '#6C757D', marginBottom: '30px' }}>Resumen general de tu tienda y productos.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {statCards.map((card, i) => (
          <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#6C757D', fontWeight: 600, textTransform: 'uppercase' }}>{card.title}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0B1F3A', lineHeight: 1.2 }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
