import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Public Pages
import Landing from './pages/public/Landing';

// Admin Login
import Login from './pages/admin/Login';

// Carga perezosa (Lazy Load) para todo el panel administrativo
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsList = lazy(() => import('./pages/admin/ProductsList'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const GalleryManager = lazy(() => import('./pages/admin/GalleryManager'));

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1F3A', color: 'white' }}>Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Landing />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={!session ? <Login /> : <Navigate to="/admin/dashboard" replace />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          session ? 
          <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: '#6C757D', fontFamily: 'sans-serif' }}>Cargando módulo de administrador...</div>}>
            <AdminLayout />
          </Suspense> : 
          <Navigate to="/admin/login" replace />
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="gallery" element={<GalleryManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
