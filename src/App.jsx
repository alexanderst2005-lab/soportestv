import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Wrench, 
  Settings, 
  ChevronRight, 
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { supabase } from './supabaseClient';
import './App.css';

const WHATSAPP_NUMBER = "573000000000"; // Replace con número real
const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=`;

const formatPrice = (price) => {
  if (!price) return '';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
};

// Supabase data states
function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Cache: si ya cargamos los datos en esta sesión, los usamos al instante
      const cached = sessionStorage.getItem('soportestv_data');
      if (cached) {
        const { catalog: cachedCatalog, services: cachedServices } = JSON.parse(cached);
        setCatalog(cachedCatalog);
        setServices(cachedServices);
        setLoading(false);
        return;
      }

      try {
        // 2. Fetch paralelo: descargamos productos y servicios al mismo tiempo
        const [productsResult, servicesResult] = await Promise.all([
          supabase.from('products').select('id,name,price,old_price,description,image_url,stock_status').order('id'),
          supabase.from('services').select('id,name,price,description,icon_name').order('id'),
        ]);

        if (productsResult.error) throw productsResult.error;
        if (servicesResult.error) throw servicesResult.error;

        const productsData = productsResult.data || [];
        const servicesData = servicesResult.data || [];

        setCatalog(productsData);
        setServices(servicesData);

        // 3. Guardar en sessionStorage para visitas rápidas
        sessionStorage.setItem('soportestv_data', JSON.stringify({
          catalog: productsData,
          services: servicesData,
        }));
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleWhatsApp = (message) => {
    window.open(`${WHATSAPP_BASE_URL}${encodeURIComponent(message)}`, '_blank');
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="container header-container">
          <div className="logo" onClick={() => scrollToSection('hero')} style={{cursor: 'pointer'}}>
            <img src="/logo.jpg" alt="Emmanuel Obras Civiles" className="logo-img" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x80/ff0000/ffffff?text=FALTA+PONER+TU+logo.jpg+AQUI" }} />
          </div>

          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <button className="nav-link" onClick={() => scrollToSection('soportes')}>Catálogo</button>
            <button className="nav-link" onClick={() => scrollToSection('instalacion')}>Instalación</button>
            <button className="nav-link" onClick={() => scrollToSection('otros-servicios')}>Servicios</button>
            <button className="btn btn-primary btn-sm" onClick={() => handleWhatsApp('Hola, quisiera más información.')}>
              Contacto
            </button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero" id="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              TU ESPACIO.<br/>
              <span className="text-gradient">ELEVADO A OTRO NIVEL.</span>
            </h1>
            <p className="hero-subtitle">
              Productos, instalaciones y soluciones profesionales para hacer tu hogar más funcional, moderno y práctico.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => scrollToSection('routing')}>
                EXPLORAR SOLUCIONES
              </button>
              <button className="btn btn-whatsapp" onClick={() => handleWhatsApp('Hola, vengo de la página web y quiero hacer una consulta.')}>
                <MessageCircle size={20} /> HABLAR POR WHATSAPP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ROUTING */}
      <section className="section" id="routing" style={{paddingBottom: '20px'}}>
        <div className="container">
          <h2 className="section-title">¿QUÉ NECESITAS HOY?</h2>
          <div className="routing-grid">
            <div className="route-card" onClick={() => scrollToSection('soportes')}>
              <h3>QUIERO COMPRAR</h3>
              <ChevronRight size={24} className="text-gradient" />
            </div>
            <div className="route-card" onClick={() => scrollToSection('instalacion')}>
              <h3>QUIERO INSTALAR</h3>
              <ChevronRight size={24} className="text-gradient" />
            </div>
            <div className="route-card" onClick={() => scrollToSection('otros-servicios')}>
              <h3>NECESITO UN SERVICIO</h3>
              <ChevronRight size={24} className="text-gradient" />
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG (Responsive Grid -> Mobile List) */}
      <section className="section" id="soportes">
        <div className="container">
          <span className="section-subtitle">Nuestro Catálogo</span>
          <h2 className="section-title">PRODUCTOS DESTACADOS</h2>
          
          <div className="products-grid">
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando catálogo en vivo...</p>
            ) : catalog.map(item => (
              <div className="product-card glass-card" key={item.id} onClick={() => handleWhatsApp(`Hola, me interesa comprar el ${item.name} por ${formatPrice(item.price)}.`)}>
                <div className="product-image-container">
                  <img src={item.image_url} alt={item.name} className="product-image" />
                </div>
                <div className="product-content">
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-desc">{item.description}</p>
                  <div className="product-price-row">
                    <span className="product-price">{formatPrice(item.price)}</span>
                    {item.old_price && <span className="product-old-price">{formatPrice(item.old_price)}</span>}
                  </div>
                  <button className="btn btn-outline product-btn desktop-only">COMPRAR AHORA</button>
                </div>
                <div className="product-mobile-action mobile-only">
                  <ChevronRight size={20} color="var(--accent-color)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTALLATION SERVICE */}
      <section className="section" id="instalacion">
        <div className="container installation-section">
          <div>
            <span className="section-subtitle">Servicio Premium</span>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '20px' }}>
              NO SOLO VENDEMOS EL SOPORTE. HACEMOS QUE QUEDE PERFECTO.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '32px' }}>
              Nos encargamos de todo el proceso para que no tengas que preocuparte por nada. Tu espacio lucirá increíble por solo {formatPrice(60000)}.
            </p>
            
            <div className="install-steps">
              <div className="install-step">
                <span className="step-number">01</span>
                <div className="step-content">
                  <h4>TE ASESORAMOS</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Evaluamos tu espacio y pared.</p>
                </div>
              </div>
              <div className="install-step">
                <span className="step-number">02</span>
                <div className="step-content">
                  <h4>INSTALAMOS</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Trabajo limpio y seguro.</p>
                </div>
              </div>
            </div>
            
            <button className="btn btn-primary" style={{ marginTop: '32px', width: '100%' }} onClick={() => handleWhatsApp('Hola, quiero programar una instalación de mi soporte de TV.')}>
              AGENDAR INSTALACIÓN ({formatPrice(60000)})
            </button>
          </div>
          <div className="install-image-wrapper">
            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Instalación Profesional" className="install-image" />
          </div>
        </div>
      </section>

      {/* OTHER SERVICES (Responsive Grid -> Mobile List) */}
      <section className="section" id="otros-servicios" style={{ background: 'var(--bg-darker)' }}>
        <div className="container">
          <span className="section-subtitle">Soluciones Integrales</span>
          <h2 className="section-title">Y SI TU CASA NECESITA MÁS...</h2>
          
          <div className="products-grid">
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando servicios en vivo...</p>
            ) : services.map(srv => {
              // Icon mapper
              let ServiceIcon = Settings;
              if (srv.icon_name === 'Tv') ServiceIcon = Tv;
              if (srv.icon_name === 'CheckCircle2') ServiceIcon = CheckCircle2;
              if (srv.icon_name === 'ShieldCheck') ServiceIcon = ShieldCheck;
              if (srv.icon_name === 'Wrench') ServiceIcon = Wrench;

              return (
                <div className="product-card glass-card" key={srv.id} onClick={() => handleWhatsApp(`Hola, necesito el ${srv.name}.`)}>
                  <div className="product-icon-container">
                    <ServiceIcon size={32} />
                  </div>
                  <div className="product-content">
                    <h3 className="product-name">{srv.name}</h3>
                    <p className="product-desc">{srv.description}</p>
                    <div className="product-price-row">
                      <span className="product-price">{formatPrice(srv.price)}</span>
                    </div>
                    <button className="btn btn-outline product-btn desktop-only">SOLICITAR</button>
                  </div>
                  <div className="product-mobile-action mobile-only">
                    <ChevronRight size={20} color="var(--accent-color)" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>¿QUÉ NECESITAS PARA TU HOGAR?</h2>
          <p>Cuéntanos lo que necesitas. Nosotros encontramos la solución.</p>
          <button className="btn btn-whatsapp" style={{ padding: '16px 32px' }} onClick={() => handleWhatsApp('Hola, quiero hacerles una consulta general.')}>
            <MessageCircle size={20} /> HABLAR POR WHATSAPP
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 20px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <img src="/logo.jpg" alt="Emmanuel Obras Civiles" className="logo-img" style={{ marginBottom: '16px' }} onError={(e) => { e.target.style.display = 'none' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} Emmanuel Obras Civiles. Todos los derechos reservados.
        </p>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        href="#" 
        className="floating-whatsapp"
        onClick={(e) => {
          e.preventDefault();
          handleWhatsApp('Hola, vengo de la página web y necesito ayuda.');
        }}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>
    </>
  );
}

export default App;
