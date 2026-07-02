

export default class Home {
  constructor(app) {
    this.app = app;
    this.containerId = "main-content";
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="showcase-layout fade-in">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <span class="hero-tag">GAMA EXTRA PREMIUM</span>
            <h1 class="serif-title golden-text hero-title">L'Art de la Croquette</h1>
            <p class="hero-desc">Elaboración gourmet consistente diseñada para los chefs de restaurantes, hoteles y beach clubs más prestigiosos de Marbella y la Costa del Sol.</p>
            <div class="hero-ctas">
              <button class="btn-primary" id="btn-hero-pro">
                <span>Portal de Compra B2B</span>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button class="btn-secondary" id="btn-hero-scroll">
                <span>Ver la Colección</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Brand Presentation Section -->
        <section class="brand-presentation-section">
          <div class="brand-text-col">
            <span class="section-tag-gold">FILOSOFÍA DE CALIDAD</span>
            <h2 class="serif-title section-title-home">La Consistencia que Exigen los Chefs</h2>
            <p class="brand-para">En el sector de la hostelería profesional, cada plato que sale de cocina debe rozar la perfección. Nuestras croquetas combinan ingredientes selectos con una bechamel sedosa de leche entera y mantequilla pura, asegurando un rebozado crujiente y un interior cremoso que cautiva.</p>
            
            <div class="feature-bullets">
              <div class="f-bullet">
                <svg class="f-bullet-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                <div>
                  <strong>Calidad Homogénea:</strong> Mismo gramaje (30g) y sabor exacto en cada caja, eliminando mermas.
                </div>
              </div>
              <div class="f-bullet">
                <svg class="f-bullet-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18V9a6 6 0 0 1 12 0v9M3 18h18a1 1 0 0 1 1 1v2H2v-2a1 1 0 0 1 1-1zM12 3v3"/></svg>
                <div>
                  <strong>Listas para Servir:</strong> Del congelador a la freidora. Fritura óptima a 180°C en 3-4 minutos.
                </div>
              </div>
              <div class="f-bullet">
                <svg class="f-bullet-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v4M18 10h4l2 3v4a1 1 0 0 1-1 1h-3M14 18H8M14 18a2.5 2.5 0 1 1 5 0M8 18a2.5 2.5 0 1 1-5 0"/></svg>
                <div>
                  <strong>Frío Garantizado:</strong> Transporte a -18°C controlado directamente por nuestra flota refrigerada.
                </div>
              </div>
            </div>
          </div>
          
          <div class="brand-image-col">
            <img src="assets/images/art_of_croquettes.jpg" alt="Art of Croquettes Croqon" class="brand-promo-img">
            <div class="promo-badge-gold">
              <span>CALIDAD PREMIUM<br><strong>HECHO PARA CHEFS</strong></span>
            </div>
          </div>
        </section>

        <!-- Collection Showcase (No prices!) -->
        <section class="public-collection-section" id="collection-target">
          <div class="section-header-home">
            <span class="section-tag-gold">NUESTRO PORTAFOLIO</span>
            <h2 class="serif-title section-title-home text-center">Nuestra Colección Gourmet</h2>
            <p class="section-desc-home text-center">Recetas exclusivas elaboradas con ingredientes nobles seleccionados, sin aditivos artificiales.</p>
          </div>

          <div class="public-grid">
            ${this.app.getProducts().map(p => this.renderPublicProductCard(p)).join("")}
          </div>

          <div class="public-lockout-bar">
            <div class="lockout-text">
              <h3>🔒 Precios y Compras Limitadas a Profesionales</h3>
              <p>Para ver las tarifas comerciales de suministro mayorista y configurar su pedido, acceda a nuestro portal validado.</p>
            </div>
            <button class="btn-primary" id="btn-lockout-access">
              <span>Acceder como Profesional</span>
            </button>
          </div>
        </section>

        <!-- Logistics Coverage Section -->
        <section class="logistics-coverage-section">
          <div class="logistics-text-center">
            <span class="section-tag-gold">DISTRIBUCIÓN Y RUTAS</span>
            <h2 class="serif-title section-title-home">Suministro Directo Costa del Sol</h2>
            <p>Operamos nuestra propia red logística con camiones congeladores de última generación para entregar directamente en su cocina.</p>
          </div>

          <div class="logistics-grid-home">
            <div class="log-card">
              <svg class="log-ico-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <h4>Zonas de Cobertura</h4>
              <p>Málaga Centro, Torremolinos, Fuengirola, Benalmádena, Marbella, Puerto Banús, Estepona y Sotogrande.</p>
            </div>
            <div class="log-card">
              <svg class="log-ico-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <h4>Días de Entrega</h4>
              <p>Rutas programadas dos veces por semana: <strong>Martes y Viernes</strong> de 08:00 a 14:00 para optimizar su stock.</p>
            </div>
            <div class="log-card">
              <svg class="log-ico-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              <h4>Formato Hostelería</h4>
              <p>Cajas de 150 unidades (4,5 kg netos). Croquetas ultracongeladas a -18°C con envase sellado de alta resistencia.</p>
            </div>
          </div>
        </section>

        <!-- Final Supply Supply CTA -->
        <section class="final-supply-cta">
          <div class="cta-overlay-box">
            <h2 class="serif-title golden-text">¿Desea abastecer su restaurante con Croqon?</h2>
            <p>Hágase cliente profesional en 1 minuto. Ingrese su CIF comercial para activar los precios mayoristas e iniciar el pedido.</p>
            <button class="btn-primary btn-large" id="btn-final-cta">
              <span>Solicitar Acceso B2B</span>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </section>
      </div>
    `;

    this.attachEvents();
  }

  renderPublicProductCard(p) {
    return `
      <div class="public-product-card">
        <div class="pub-card-visual">
          <div class="product-crop ${p.imagePath ? "" : p.imageClass}" ${p.imagePath ? `style="background-image: url('${p.imagePath}'); background-size: cover; background-position: center;"` : ""}></div>
          <span class="pub-badge-overlay">${p.badge}</span>
        </div>
        <div class="pub-card-body">
          <span class="pub-card-flavor">${p.flavorProfile}</span>
          <h3 class="serif-title">${p.name}</h3>
          <p class="pub-card-desc">${p.description}</p>
          <div class="pub-card-specs">
            <span>Caja de ${p.units} uds</span>
            <span>30g por croqueta</span>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const scrollBtn = document.getElementById("btn-hero-scroll");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => {
        const target = document.getElementById("collection-target");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    }

    const proBtnHero = document.getElementById("btn-hero-pro");
    const proBtnLockout = document.getElementById("btn-lockout-access");
    const proBtnFinal = document.getElementById("btn-final-cta");

    const navigateToGateway = () => this.app.navigate("gateway");

    if (proBtnHero) proBtnHero.addEventListener("click", navigateToGateway);
    if (proBtnLockout) proBtnLockout.addEventListener("click", navigateToGateway);
    if (proBtnFinal) proBtnFinal.addEventListener("click", navigateToGateway);
  }
}
