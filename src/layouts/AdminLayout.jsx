import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LayoutDashboard, Package, Tags, LogOut, Menu, X, Image as ImageIcon } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Productos' },
    { path: '/admin/categories', icon: <Tags size={20} />, label: 'Categorías' },
    { path: '/admin/gallery', icon: <ImageIcon size={20} />, label: 'Galería' },
  ];

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', background: '#F8F9FA', color: '#343A40', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Mobile Top Bar */}
      <div className="admin-mobile-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#0B1F3A', color: 'white' }}>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase' }}>
          PANEL ADMIN
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex' }}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={`admin-overlay ${menuOpen ? 'open' : ''}`} 
        onClick={() => setMenuOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: menuOpen ? 'block' : 'none' }} 
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`} style={{ width: '250px', background: '#0B1F3A', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100, transition: 'transform 0.3s ease' }}>
        <div className="admin-sidebar-header" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>PANEL ADMIN</h2>
          <div style={{ fontSize: '0.75rem', color: '#FACC15' }}>Emmanuel Obras Civiles</div>
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  color: active ? '#FACC15' : 'rgba(255,255,255,0.7)',
                  background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  borderLeft: active ? '4px solid #FACC15' : '4px solid transparent'
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main" style={{ padding: '30px', marginLeft: '250px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-layout {
            display: flex;
            flex-direction: column;
          }
          .admin-mobile-topbar {
            display: flex !important;
            position: sticky;
            top: 0;
            z-index: 90;
          }
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-sidebar-header {
            display: none;
          }
          .admin-main {
            margin-left: 0 !important;
            padding: 16px !important;
            width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
          }
          /* Fix tables overflow on mobile */
          table {
            display: block;
            max-width: 100%;
            overflow-x: auto;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}
