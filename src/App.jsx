import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import {
  Tv, Wrench, Zap, Lock, ChevronRight, MessageCircle,
  Shield, Headphones, MapPin, Star, Menu, X, ArrowRight,
  Package, Settings, CheckCircle, Phone
} from 'lucide-react';
import './index.css';

const WA = '573000000000'; // ← Reemplaza con tu número real
const waLink = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
const openWA = (msg) => window.open(waLink(msg), '_blank');

const formatPrice = (n) =>
  n ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n) : '';

/* ==================== GALLERY IMAGES ==================== */
const GALLERY_IMGS = [
  'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
];

const SUPPORT_CATEGORIES = [
  { tag: 'Más vendido', title: 'Soporte Articulado', subtitle: '32" – 65" • Doble brazo', img: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80' },
  { tag: 'Económico', title: 'Soporte Fijo', subtitle: '32" – 55" • Ultra delgado', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80' },
  { tag: 'Premium', title: 'Soporte Móvil', subtitle: '32" – 70" • Con ruedas', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
  { tag: 'Popular', title: 'Soporte Inclinable', subtitle: '26" – 55" • -15°/+5°', img: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=600&q=80' },
  { tag: 'Profesional', title: 'Doble Brazo', subtitle: '40" – 80" • 360° rotación', img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80' },
  { tag: 'Especial', title: 'Tamaños Grandes', subtitle: '65" – 100" • Heavy duty', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80' },
];

/* ==================== BEFORE/AFTER SLIDER ==================== */
function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  const getPos = useCallback((clientX) => {
    const rect = ref.current.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(5, Math.min(95, p));
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setPos(getPos(x));
  }, [dragging, getPos]);

  const start = useCallback((e) => {
    setDragging(true);
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setPos(getPos(x));
  }, [getPos]);

  const stop = () => setDragging(false);

  useEffect(() => {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', stop);
    };
  }, [onMove]);

  return (
    <div
      className="ba-container"
      ref={ref}
      onMouseDown={start}
      onTouchStart={start}
    >
      <div className="ba-img ba-after" />
      <div className="ba-clip" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <div className="ba-img ba-before" />
      </div>
      <div className="ba-handle" style={{ left: `${pos}%` }}>
        <div className="ba-handle-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
      <span className="ba-label ba-label-before">ANTES</span>
      <span className="ba-label ba-label-after">DESPUÉS</span>
    </div>
  );
}

/* ==================== MAIN APP ==================== */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWaTooltip, setShowWaTooltip] = useState(false);

  /* Scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Supabase fetch with localStorage cache */
  useEffect(() => {
    async function fetchData() {
      const KEY = 'soportestv_data_v2';
      const TTL = 60 * 60 * 1000;
      const cached = localStorage.getItem(KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < TTL) {
            setCatalog(data.catalog);
            setServices(data.services);
            setLoading(false);
            return;
          }
        } catch { localStorage.removeItem(KEY); }
      }
      try {
        const [pr, sr] = await Promise.all([
          supabase.from('products').select('id,name,price,old_price,description,image_url,stock_status').order('id'),
          supabase.from('services').select('id,name,price,description,icon_name').order('id'),
        ]);
        const p = pr.data || [], s = sr.data || [];
        setCatalog(p); setServices(s);
        localStorage.setItem(KEY, JSON.stringify({ data: { catalog: p, services: s }, timestamp: Date.now() }));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const getServiceIcon = (name) => {
    const map = { Tv: <Tv size={28}/>, Wrench: <Wrench size={28}/>, Zap: <Zap size={28}/>, Lock: <Lock size={28}/>, Settings: <Settings size={28}/> };
    return map[name] || <Settings size={28}/>;
  };

  return (
    <>
      {/* ===== FLOATING WHATSAPP ===== */}
      <div className="floating-wa">
        {showWaTooltip && <div className="floating-wa-tooltip">¡Escríbenos ahora!</div>}
        <button
          className="floating-wa-btn"
          onMouseEnter={() => setShowWaTooltip(true)}
          onMouseLeave={() => setShowWaTooltip(false)}
          onClick={() => openWA('Hola, vengo de la página web y necesito información.')}
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle size={26} />
        </button>
      </div>

      {/* ===== MOBILE NAV ===== */}
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <button className="mobile-nav-close" onClick={() => setMenuOpen(false)}><X size={20}/></button>
        {['inicio','soportes','catalogo','instalacion','servicios','contacto'].map(id => (
          <button key={id} className="nav-link" onClick={() => scrollTo(id)}>
            {id.replace('catalogo','catálogo').replace('instalacion','instalación')}
          </button>
        ))}
        <button className="btn btn-wa btn-sm" onClick={() => { setMenuOpen(false); openWA('Hola, quiero cotizar.'); }}>
          <MessageCircle size={16}/> WhatsApp
        </button>
      </nav>

      {/* ===== HEADER ===== */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`} id="inicio">
        <div className="container header-inner">
          <div className="header-logo">
            <img src="/logo.jpg" alt="Emmanuel Obras Civiles" />
            <div className="header-logo-text">
              <span className="header-logo-name">Emmanuel</span>
              <span className="header-logo-sub">Obras Civiles</span>
            </div>
          </div>
          <nav className="header-nav">
            {[['inicio','Inicio'],['soportes','Soportes TV'],['catalogo','Catálogo'],['instalacion','Instalación'],['servicios','Servicios'],['contacto','Contacto']].map(([id, label]) => (
              <button key={id} className="nav-link" onClick={() => scrollTo(id)}>{label}</button>
            ))}
            <button className="btn btn-yellow btn-sm" onClick={() => openWA('Hola, quiero cotizar.')}>COTIZAR AHORA</button>
          </nav>
          <div className="mobile-header-right">
            <button className="mobile-wa-header" onClick={() => openWA('Hola, quiero información.')} aria-label="WhatsApp">
              <MessageCircle size={18}/>
            </button>
            <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Menú">
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="container">
          <div className="hero-content">
            <span className="section-label">Emmanuel Obras Civiles</span>
            <h1 className="hero-title">
              SOLUCIONES<br/>PARA TU HOGAR.<br/>
              <span>INSTALADAS POR<br/>PROFESIONALES.</span>
            </h1>
            <p className="hero-desc">Venta de soportes para TV, instalación y servicios profesionales para el hogar.</p>
            <div className="hero-buttons">
              <button className="btn btn-yellow btn-lg" onClick={() => scrollTo('catalogo')}>VER SOPORTES</button>
              <button className="btn btn-wa btn-lg" onClick={() => openWA('Hola, vengo de la página web y quiero información.')}>
                <MessageCircle size={20}/> HABLAR POR WHATSAPP
              </button>
            </div>
            <div className="hero-badges">
              {['VENTA','INSTALACIÓN','SERVICIOS A DOMICILIO'].map(b => (
                <div key={b} className="hero-badge">
                  <span className="hero-badge-dot"/>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRESENTATION ===== */}
      <section className="presentation">
        <div className="container">
          <div className="presentation-grid">
            <div>
              <span className="section-label">Quiénes somos</span>
              <h2 className="section-title">TODO LO QUE NECESITAS,<br/><span className="text-yellow">EN UN SOLO LUGAR.</span></h2>
              <p className="section-subtitle">En Emmanuel Obras Civiles ofrecemos productos, instalaciones y servicios para ayudarte a mejorar, mantener y transformar tus espacios.</p>
            </div>
            <div className="pres-blocks">
              {[
                { icon: <Package size={24}/>, title: 'Productos', desc: 'Soportes para TV y diferentes soluciones para el hogar.' },
                { icon: <Wrench size={24}/>, title: 'Instalaciones', desc: 'Montaje e instalación profesional con acabados perfectos.' },
                { icon: <CheckCircle size={24}/>, title: 'Servicios', desc: 'Soluciones y atención directamente donde las necesitas.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="pres-block">
                  <div className="pres-icon">{icon}</div>
                  <div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TV SUPPORTS ===== */}
      <section className="supports-section" id="soportes">
        <div className="container">
          <span className="section-label">Catálogo principal</span>
          <h2 className="section-title">TU TV. TU ESPACIO.<br/><span className="text-yellow">TU ESTILO.</span></h2>
          <p className="section-subtitle">Encuentra el soporte ideal para tu televisor y dale a tu espacio un acabado moderno y funcional.</p>
          <div className="supports-categories">
            {SUPPORT_CATEGORIES.map((cat) => (
              <div key={cat.title} className="category-card" onClick={() => scrollTo('catalogo')}>
                <div className="category-card-bg" style={{ backgroundImage: `url(${cat.img})` }} />
                <div className="category-card-overlay" />
                <div className="category-card-content">
                  <span className="category-card-tag">{cat.tag}</span>
                  <div className="category-card-title">{cat.title}</div>
                  <div className="category-card-subtitle">{cat.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATALOG ===== */}
      <section className="catalog-section" id="catalogo">
        <div className="container">
          <span className="section-label">Productos disponibles</span>
          <h2 className="section-title">NUESTRO <span className="text-yellow">CATÁLOGO</span></h2>
          <p className="section-subtitle">Todos los productos disponibles para entrega y montaje a domicilio.</p>
          {loading ? (
            <div className="catalog-loading">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, border: '2px solid rgba(250,204,21,0.3)', borderTop: '2px solid #FACC15', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Cargando catálogo...
              </div>
            </div>
          ) : (
            <div className="catalog-grid">
              {catalog.map(item => (
                <div key={item.id} className="product-card">
                  <div className="product-img-wrap">
                    <img src={item.image_url} alt={item.name} loading="lazy" />
                    {item.old_price && <span className="product-badge">OFERTA</span>}
                    {item.stock_status === 'out' && <span className="product-badge out">AGOTADO</span>}
                  </div>
                  <div className="product-body">
                    <div className="product-name">{item.name}</div>
                    <div className="product-specs">
                      <span className="product-spec-tag">Soporte TV</span>
                    </div>
                    <p className="product-desc-text">{item.description}</p>
                    <div className="product-pricing">
                      <span className="product-price">{formatPrice(item.price)}</span>
                      {item.old_price && <span className="product-old-price">{formatPrice(item.old_price)}</span>}
                    </div>
                    <button
                      className="product-wa-btn"
                      onClick={() => openWA(`Hola, estoy interesado en el ${item.name} (${formatPrice(item.price)}). ¿Está disponible?`)}
                    >
                      <MessageCircle size={16}/> CONSULTAR POR WHATSAPP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== INSTALLATION ===== */}
      <section className="installation-section" id="instalacion">
        <div className="installation-bg" />
        <div className="installation-overlay" />
        <div className="container">
          <div className="installation-content">
            <span className="section-label">Servicio profesional</span>
            <h2 className="section-title">NO SOLO VENDEMOS<br/>EL SOPORTE.<br/><span className="text-yellow">TAMBIÉN LO INSTALAMOS.</span></h2>
            <p className="section-subtitle">Te ayudamos a elegir la opción adecuada y realizamos la instalación para que tu TV quede firme, nivelado y con acabado perfecto.</p>
            <div className="install-steps">
              {[
                ['01','Asesoría','Te ayudamos a elegir el soporte correcto para tu TV y pared.'],
                ['02','Elección','Seleccionamos la opción adecuada según tu espacio.'],
                ['03','Instalación','Realizamos el montaje de manera segura y profesional.'],
                ['04','Ajuste Final','Verificamos que todo quede perfectamente instalado.'],
              ].map(([num, title, desc]) => (
                <div key={num} className="install-step">
                  <div className="step-num">{num}</div>
                  <div className="step-body">
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-yellow btn-lg" onClick={() => openWA('Hola, quiero cotizar la instalación de un soporte para TV.')}>
              AGENDAR INSTALACIÓN
            </button>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="services-section" id="servicios">
        <div className="container">
          <span className="section-label">Servicios del hogar</span>
          <h2 className="section-title">MÁS QUE<br/><span className="text-yellow">SOPORTES PARA TV.</span></h2>
          <p className="section-subtitle">También contamos con diferentes soluciones para las necesidades de tu hogar.</p>
          <div className="services-grid">
            {loading ? (
              <div className="catalog-loading" style={{ gridColumn: '1/-1' }}>Cargando servicios...</div>
            ) : services.length > 0 ? services.map(srv => (
              <div key={srv.id} className="service-card" onClick={() => openWA(`Hola, quiero información sobre el servicio de ${srv.name}.`)}>
                <div className="service-icon">{getServiceIcon(srv.icon_name)}</div>
                <h3>{srv.name}</h3>
                <p>{srv.description}</p>
                {srv.price && <p style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: '1.1rem' }}>{formatPrice(srv.price)}</p>}
                <button className="service-wa"><MessageCircle size={14}/> Solicitar</button>
              </div>
            )) : (
              [
                { icon: <Wrench size={28}/>, name: 'Plomería', desc: 'Servicio de plomería a domicilio.' },
                { icon: <Zap size={28}/>, name: 'Electricidad', desc: 'Servicios eléctricos para el hogar.' },
                { icon: <Lock size={28}/>, name: 'Cerrajería', desc: 'Soluciones de cerrajería.' },
                { icon: <Tv size={28}/>, name: 'Instalación TV', desc: 'Montaje profesional de soportes.' },
              ].map(s => (
                <div key={s.name} className="service-card" onClick={() => openWA(`Hola, quiero información sobre ${s.name}.`)}>
                  <div className="service-icon">{s.icon}</div>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                  <button className="service-wa"><MessageCircle size={14}/> Solicitar</button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== WHAT DO YOU NEED ===== */}
      <section className="needs-section" id="contacto">
        <div className="container">
          <span className="section-label">¿En qué te ayudamos?</span>
          <h2 className="section-title">¿QUÉ <span className="text-yellow">NECESITAS?</span></h2>
          <div className="needs-grid">
            {[
              { icon: <Package size={28}/>, title: 'Quiero Comprar', desc: 'Ver productos y soportes disponibles.', action: () => scrollTo('catalogo') },
              { icon: <Wrench size={28}/>, title: 'Quiero Instalar', desc: 'Solicitar servicio de instalación profesional.', action: () => openWA('Hola, quiero cotizar la instalación de un soporte para TV.') },
              { icon: <Phone size={28}/>, title: 'Necesito un Servicio', desc: 'Consultar servicios para el hogar a domicilio.', action: () => scrollTo('servicios') },
            ].map(({ icon, title, desc, action }) => (
              <div key={title} className="need-card" onClick={action}>
                <div className="need-icon">{icon}</div>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <div className="need-arrow"><ArrowRight size={22}/></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BEFORE / AFTER ===== */}
      <section className="ba-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-label">Resultados reales</span>
          <h2 className="section-title">EL CAMBIO ESTÁ<br/><span className="text-yellow">EN LOS DETALLES.</span></h2>
          <p className="section-subtitle" style={{ margin: '0 auto 0' }}>Desliza para comparar el antes y después de una instalación profesional.</p>
          <BeforeAfterSlider />
        </div>
      </section>

      {/* ===== GALLERY ===== */}
      <section className="gallery-section">
        <div className="container">
          <span className="section-label">Nuestro trabajo</span>
          <h2 className="section-title">GALERÍA DE <span className="text-yellow">PROYECTOS</span></h2>
          <div className="gallery-grid">
            {GALLERY_IMGS.map((src, i) => (
              <div key={i} className="gallery-item">
                <img src={src} alt={`Proyecto ${i + 1}`} loading="lazy" />
                <div className="gallery-overlay"><MessageCircle size={28}/></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST ===== */}
      <section className="trust-section">
        <div className="container">
          <span className="section-label">Por qué elegirnos</span>
          <h2 className="section-title">NUESTRO <span className="text-yellow">COMPROMISO</span></h2>
          <div className="trust-grid">
            {[
              { icon: <Headphones size={28}/>, title: 'Atención Directa', desc: 'Comunicación rápida y personalizada con el cliente.' },
              { icon: <Star size={28}/>, title: 'Asesoría', desc: 'Te ayudamos a encontrar la solución más adecuada.' },
              { icon: <Shield size={28}/>, title: 'Instalación', desc: 'Montaje profesional con acabado limpio y seguro.' },
              { icon: <MapPin size={28}/>, title: 'A Domicilio', desc: 'Soluciones directamente donde las necesitas.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="trust-card">
                <div className="trust-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COVERAGE ===== */}
      <section className="coverage-section">
        <div className="container">
          <span className="section-label">Dónde operamos</span>
          <h2 className="section-title">ZONA DE <span className="text-yellow">COBERTURA</span></h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Prestamos servicio a domicilio en toda el Área Metropolitana.</p>
          <div className="coverage-tags">
            {['Medellín', 'Bello', 'Envigado', 'Sabaneta'].map(z => (
              <span key={z} className="coverage-tag">{z}</span>
            ))}
          </div>
          <p className="coverage-note">¿No encuentras tu municipio? <button style={{ background:'none', border:'none', color:'var(--yellow)', cursor:'pointer', fontWeight:600 }} onClick={() => openWA('Hola, quiero saber si tienen cobertura en mi zona.')}>Consúltanos por WhatsApp →</button></p>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="final-cta">
        <div className="final-cta-bg" />
        <div className="final-cta-overlay" />
        <div className="container final-cta-content">
          <span className="section-label">Escríbenos hoy</span>
          <h2>¿QUÉ NECESITAS<br/><span className="text-yellow">PARA TU HOGAR?</span></h2>
          <p>Cuéntanos qué necesitas y te ayudamos a encontrar la solución.</p>
          <button className="btn btn-yellow btn-lg" onClick={() => openWA('Hola, vengo de la página web y necesito ayuda.')}>
            <MessageCircle size={22}/> HABLAR POR WHATSAPP
          </button>
          <p className="final-cta-small">PRODUCTOS · INSTALACIONES · SERVICIOS</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src="/logo.jpg" alt="Emmanuel Obras Civiles" />
              <div className="footer-brand-name">Emmanuel Obras Civiles</div>
              <div className="footer-brand-sub">Soportes TV & Servicios</div>
              <p>Empresa especializada en venta e instalación de soportes para televisor y servicios profesionales para el hogar.</p>
            </div>
            <div className="footer-col">
              <h4>Soportes TV</h4>
              <div className="footer-links">
                {['Soporte Fijo','Soporte Articulado','Soporte Inclinable','Soporte Móvil','Doble Brazo'].map(l => (
                  <button key={l} className="footer-link" onClick={() => scrollTo('catalogo')}>{l}</button>
                ))}
              </div>
            </div>
            <div className="footer-col">
              <h4>Servicios</h4>
              <div className="footer-links">
                {['Instalación TV','Plomería','Electricidad','Cerrajería'].map(l => (
                  <button key={l} className="footer-link" onClick={() => scrollTo('servicios')}>{l}</button>
                ))}
              </div>
            </div>
            <div className="footer-col">
              <h4>Contacto</h4>
              <div className="footer-links">
                <button className="footer-link" onClick={() => openWA('Hola, quiero más información.')}>WhatsApp</button>
                <button className="footer-link" onClick={() => scrollTo('contacto')}>Zona de cobertura</button>
                <button className="footer-link" onClick={() => scrollTo('instalacion')}>Agendar instalación</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copyright">© {new Date().getFullYear()} Emmanuel Obras Civiles. Todos los derechos reservados.</span>
            <button className="footer-wa-link" onClick={() => openWA('Hola, quiero contactarlos.')}>
              <MessageCircle size={16}/> Contactar por WhatsApp
            </button>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
