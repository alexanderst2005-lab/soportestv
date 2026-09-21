import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Tv, Wrench, Zap, Lock, ChevronRight, MessageCircle,
  Shield, Headphones, MapPin, Star, Menu, X, ArrowRight,
  Package, Settings, CheckCircle, Phone, ThumbsUp, Music
} from 'lucide-react';
import '../../index.css';

const WA = '573012089947';
const waLink = (msg) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return isMobile 
    ? `https://api.whatsapp.com/send?phone=${WA}&text=${encodeURIComponent(msg)}`
    : `https://web.whatsapp.com/send?phone=${WA}&text=${encodeURIComponent(msg)}`;
};
const openWA = (msg) => { window.location.href = waLink(msg); };

const formatPrice = (n) =>
  n ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n) : '';



/* ==================== MAIN APP ==================== */
export default function App() {
  const getInitialCatalog = () => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = localStorage.getItem('soportestv_data_v3');
      if (cached) {
        const { catalog, gallery } = JSON.parse(cached);
        return { catalog: catalog || [], gallery: gallery || [] };
      }
    } catch { return { catalog: [], gallery: [] }; }
    return { catalog: [], gallery: [] };
  };

  const initialData = getInitialCatalog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catalog, setCatalog] = useState(initialData.catalog);
  const [gallery, setGallery] = useState(initialData.gallery);
  const [loading, setLoading] = useState(initialData.catalog.length === 0);
  const [showWaTooltip, setShowWaTooltip] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  /* Scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Supabase fetch (Stale-While-Revalidate caching) */
  useEffect(() => {
    async function fetchData() {
      const KEY = 'soportestv_data_v3';
      
      // Buscar actualizaciones en silencio por debajo (tiempo real)
      try {
        const [pRes, gRes] = await Promise.all([
          supabase.from('products').select('id,name,price,old_price,description,image_url,images,stock_status').order('id'),
          supabase.from('gallery').select('*').order('created_at', { ascending: false })
        ]);
        
        const publicCatalog = (pRes.data || []).filter(item => item.stock_status !== 'oculto');
        const galleryData = gRes.data || [];
        
        // Actualizar la pantalla y guardar nuevo caché
        setCatalog(publicCatalog); 
        setGallery(galleryData);
        localStorage.setItem(KEY, JSON.stringify({ catalog: publicCatalog, gallery: galleryData }));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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
        {['inicio','catalogo','instalacion','contacto'].map(id => (
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
            {[['inicio','Inicio'],['catalogo','Catálogo'],['instalacion','Instalación'],['contacto','Contacto']].map(([id, label]) => (
              <button key={id} className="nav-link" onClick={() => scrollTo(id)}>{label}</button>
            ))}
            <button className="btn btn-yellow btn-sm" onClick={() => openWA('Hola, quiero cotizar.')}>COTIZAR AHORA</button>
          </nav>
          <div className="mobile-header-right">
            <button className="mobile-wa-header" onClick={() => openWA('Hola, quiero información.')} aria-label="WhatsApp">
              <MessageCircle size={18}/>
            </button>
            <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
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
            <p className="hero-desc">Venta de soportes para TV e instalación profesional para tu hogar.</p>
            <div className="hero-buttons">
              <button className="btn btn-yellow btn-lg" onClick={() => scrollTo('catalogo')}>VER SOPORTES</button>
              <button className="btn btn-wa btn-lg" onClick={() => openWA('Hola, vengo de la página web y quiero información.')}>
                <MessageCircle size={20}/> HABLAR POR WHATSAPP
              </button>
            </div>
            <div className="hero-badges">
              {['VENTA','INSTALACIÓN A DOMICILIO'].map(b => (
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
              <p className="section-subtitle">En Emmanuel Obras Civiles ofrecemos la mejor asesoría, venta e instalación de soportes para TV con acabados perfectos.</p>
            </div>
            <div className="pres-blocks">
              {[
                { icon: <Package size={24}/>, title: 'Productos', desc: 'Soportes para TV de la mejor calidad y para todas las medidas.' },
                { icon: <Wrench size={24}/>, title: 'Instalaciones', desc: 'Montaje e instalación profesional con seguridad garantizada.' },
                { icon: <CheckCircle size={24}/>, title: 'A Domicilio', desc: 'Llevamos el producto y realizamos el montaje en tu hogar u oficina.' },
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

      {/* ===== CATALOG ===== */}
      <section className="catalog-section" id="catalogo">
        <div className="container">
          <span className="section-label">Productos disponibles</span>
          <h2 className="section-title">NUESTRO <span className="text-yellow">CATÁLOGO</span></h2>
          <p className="section-subtitle">Todos los productos disponibles para entrega y montaje a domicilio.</p>
          {loading ? (
            <div className="catalog-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="product-card" style={{ minHeight: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div className="catalog-grid">
              {catalog.map(item => {
                const itemImages = (item.images && item.images.length > 0) ? item.images : (item.image_url ? [item.image_url] : []);
                return (
                <div key={item.id} className="product-card">
                  <div className="product-img-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', width: '100%', height: '100%', scrollbarWidth: 'none' }}>
                      {itemImages.map((imgUrl, idx) => (
                        <img 
                          key={idx} 
                          src={imgUrl} 
                          alt={`${item.name} ${idx}`} 
                          loading="lazy" 
                          onClick={() => setLightboxImg(imgUrl)}
                          className={item.stock_status === 'agotado' ? 'img-out' : ''}
                          style={{ flex: '0 0 100%', width: '100%', scrollSnapAlign: 'start', objectFit: 'contain', backgroundColor: 'rgba(255,255,255,0.02)', cursor: 'zoom-in' }} 
                        />
                      ))}
                    </div>
                    {itemImages.length > 1 && (
                      <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '4px', pointerEvents: 'none' }}>
                        {itemImages.map((_, idx) => <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }} />)}
                      </div>
                    )}
                    {item.old_price && <span className="product-badge">OFERTA</span>}
                    {item.stock_status === 'agotado' && <span className="product-badge out">AGOTADO</span>}
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
                );
              })}
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


      {/* ===== WHAT DO YOU NEED ===== */}
      <section className="needs-section" id="contacto">
        <div className="container">
          <span className="section-label">¿En qué te ayudamos?</span>
          <h2 className="section-title">¿QUÉ <span className="text-yellow">NECESITAS?</span></h2>
          <div className="needs-grid">
            {[
              { icon: <Package size={28}/>, title: 'Quiero Comprar', desc: 'Ver soportes disponibles.', action: () => scrollTo('catalogo') },
              { icon: <Wrench size={28}/>, title: 'Quiero Instalar', desc: 'Solicitar servicio de instalación profesional.', action: () => openWA('Hola, quiero cotizar la instalación de un soporte para TV.') },
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

      {/* ===== GALLERY ===== */}
      <section className="gallery-section">
        <div className="container">
          <span className="section-label">Nuestro trabajo</span>
          <h2 className="section-title">GALERÍA DE <span className="text-yellow">PROYECTOS</span></h2>
          <div className="gallery-grid">
            {gallery.map((item) => (
              <div key={item.id} className="gallery-item" onClick={() => setLightboxImg(item.image_url)} style={{ cursor: 'zoom-in' }}>
                <img src={item.image_url} alt="Instalación" loading="lazy" />
              </div>
            ))}
            {gallery.length === 0 && (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6C757D' }}>Aún no hay fotos en la galería.</p>
            )}
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
            {['Medellín', 'Bello', 'Niquia', 'Envigado', 'Sabaneta'].map(z => (
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
          <p className="final-cta-small">VENTA · ASESORÍA · INSTALACIONES A DOMICILIO</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src="/logo.jpg" alt="Emmanuel Obras Civiles" />
              <div className="footer-brand-name">Emmanuel Obras Civiles</div>
              <div className="footer-brand-sub">Expertos en Soportes TV</div>
              <p>Empresa especializada en la venta e instalación profesional de soportes para televisor.</p>
            </div>
            <div className="footer-col">
              <h4>Secciones</h4>
              <div className="footer-links">
                {['Catálogo','Instalación','Contacto'].map(l => (
                  <button key={l} className="footer-link" onClick={() => scrollTo(l.toLowerCase().replace('á','a').replace('ó','o'))}>{l}</button>
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
            <div className="footer-col">
              <h4>Redes Sociales</h4>
              <div className="footer-links">
                <a href="https://www.facebook.com/share/1LkakVUFqu/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ThumbsUp size={16}/> Facebook
                </a>
                <a href="https://www.tiktok.com/@obras_civiles_emanuel?_r=1&fbclid=IwdGRjcAUemRpwZG9mAWZkaWQWUO1a7MpzHyaDGFlsB-Wx29VTqfx0MGV4dG4DYWVtAjExAHNydGMGYXBwX2lkCjY2Mjg1NjgzNzkAAR57zv8PYUQPcHL_NFoI2SnxK1nOOR-l8_2Wa5BaP37m1VbEIaX2QVwRLCOjPA_aem_h1r7ll5kqbTPnLYsbebD8A" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Music size={16}/> TikTok
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copyright">© {new Date().getFullYear()} Emmanuel Obras Civiles. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>

      {/* ===== LIGHTBOX ===== */}
      {lightboxImg && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightboxImg(null)}
        >
          <button 
            onClick={() => setLightboxImg(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={24} />
          </button>
          <img 
            src={lightboxImg} 
            alt="Ampliación" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} 
          />
        </div>
      )}
    </>
  );
}
