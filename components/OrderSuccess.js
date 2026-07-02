// Order Success Component - Post Purchase Dashboard
import Invoice from "./Invoice.js";
import EmailPreview from "./EmailPreview.js";

export default class OrderSuccess {
  constructor(app) {
    this.app = app;
    this.containerId = "main-content";
    this.activeTab = "details"; // details, invoice, emails
    this.activeEmailTab = "client"; // client, store
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const order = this.app.lastOrder;
    if (!order) {
      container.innerHTML = `
        <div class="empty-state-checkout fade-in">
          <h2 class="serif-title golden-text">Pedido no encontrado</h2>
          <p>No hay información disponible de su última compra.</p>
          <button id="btn-back-catalog-err" class="btn-primary" style="margin-top: 20px;">
            <span>Ir al Catálogo</span>
          </button>
        </div>
      `;
      this.attachEmptyEvents();
      return;
    }

    container.innerHTML = `
      <div class="success-layout fade-in">
        <!-- Banner block -->
        <div class="success-banner">
          <div class="success-icon-wrap">
            <svg class="success-checkmark" viewBox="0 0 52 52">
              <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h1 class="serif-title golden-text">¡Pedido B2B Confirmado!</h1>
          <p class="subtitle">Referencia del Suministro: <strong>#${order.orderId}</strong></p>
          
          <div class="delivery-status-card">
            <p>Se ha reservado con éxito la entrega para el: <strong>${order.delivery.dateStr}</strong></p>
            <p class="delivery-dest">Establecimiento: <strong>${order.billing.company}</strong> | Dirección: <strong>${order.delivery.address}, ${order.delivery.postal}</strong></p>
          </div>
        </div>

        <!-- Dashboard Workspace Tabs -->
        <div class="success-dashboard-tabs">
          <button class="dash-tab-btn ${this.activeTab === "details" ? "active" : ""}" data-tab="details">Seguimiento Logístico</button>
          <button class="dash-tab-btn ${this.activeTab === "invoice" ? "active" : ""}" data-tab="invoice">Factura Oficial B2B</button>
          <button class="dash-tab-btn ${this.activeTab === "emails" ? "active" : ""}" data-tab="emails">Emails Simulados</button>
        </div>

        <div class="success-tab-content">
          <!-- TAB 1: LOGISTICS TIMELINE -->
          <div class="tab-pane ${this.activeTab === "details" ? "" : "hide"}">
            <div class="logistics-pane-wrap">
              <h3 class="serif-title golden-text section-title">Cadena de Suministro en Tiempo Real</h3>
              <p>Monitoreamos el mantenimiento riguroso de la cadena de frío (-18°C) desde nuestro obrador hasta su congelador.</p>
              
              <div class="logistics-timeline">
                <div class="timeline-step completed">
                  <div class="step-bullet">1</div>
                  <div class="step-info">
                    <h4>Pedido Recibido</h4>
                    <p>Registrado en el sistema comercial Croqon B2B</p>
                    <span class="step-time">Completado hace unos instantes</span>
                  </div>
                </div>
                
                <div class="timeline-step completed">
                  <div class="step-bullet">2</div>
                  <div class="step-info">
                    <h4>Validación Financiera</h4>
                    <p>${order.payment.method === "stripe" ? "Pago aprobado via Stripe API" : "Esperando validación de transferencia"}</p>
                    <span class="step-time">${order.payment.method === "stripe" ? "Completado" : "Pendiente de recibir justificante"}</span>
                  </div>
                </div>

                <div class="timeline-step active">
                  <div class="step-bullet">3</div>
                  <div class="step-info">
                    <h4>Preparación de Carga Fría</h4>
                    <p>Picking en almacén a -18°C y paletizado hermético</p>
                    <span class="step-time">Programado</span>
                  </div>
                </div>

                <div class="timeline-step">
                  <div class="step-bullet">4</div>
                  <div class="step-info">
                    <h4>Ruta en Camión Refrigerado</h4>
                    <p>Transporte con registro de temperatura continuo en Costa del Sol</p>
                    <span class="step-time">Ruta Marbella / Málaga</span>
                  </div>
                </div>

                <div class="timeline-step">
                  <div class="step-bullet">5</div>
                  <div class="step-info">
                    <h4>Suministro en Cocina</h4>
                    <p>Entrega de cajas con albarán y control de descongelación</p>
                    <span class="step-time">Estimado para: ${order.delivery.dateStr} antes de las 14:00</span>
                  </div>
                </div>
              </div>

              <div class="new-order-block-success">
                <button id="btn-restart-catalog" class="btn-secondary">
                  <span>Hacer Otro Pedido / Volver</span>
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 2: INVOICE PRINT -->
          <div class="tab-pane ${this.activeTab === "invoice" ? "" : "hide"}">
            <div class="invoice-actions-bar">
              <p>Esta factura ha sido generada automáticamente para su contabilidad. Puede descargarla como PDF o imprimirla directamente.</p>
              <button id="btn-print-invoice" class="btn-primary">
                <span>Imprimir Factura (Print/PDF)</span>
              </button>
            </div>
            <div class="invoice-container-success">
              ${Invoice.renderHTML(order)}
            </div>
          </div>

          <!-- TAB 3: EMAIL PREVIEWS -->
          <div class="tab-pane ${this.activeTab === "emails" ? "" : "hide"}">
            <div class="email-simulator-pane">
              <div class="simulator-intro">
                <h3 class="serif-title golden-text">Buzón de Notificaciones B2B</h3>
                <p>Simulación de los correos electrónicos automatizados enviados por la plataforma comercial.</p>
                <div class="email-type-toggles">
                  <button class="email-toggle-btn ${this.activeEmailTab === "client" ? "active" : ""}" data-email-tab="client">Email para el Cliente (Chef)</button>
                  <button class="email-toggle-btn ${this.activeEmailTab === "store" ? "active" : ""}" data-email-tab="store">Email para la Central (Tienda / Logística)</button>
                </div>
              </div>

              <div class="email-viewer-pane">
                <div class="email-pane-content ${this.activeEmailTab === "client" ? "" : "hide"}">
                  ${EmailPreview.renderClientEmail(order)}
                </div>
                <div class="email-pane-content ${this.activeEmailTab === "store" ? "" : "hide"}">
                  ${EmailPreview.renderStoreEmail(order)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEmptyEvents() {
    const btn = document.getElementById("btn-back-catalog-err");
    if (btn) {
      btn.addEventListener("click", () => {
        this.app.navigate("catalog");
      });
    }
  }

  attachEvents() {
    // Tabs toggle
    const tabBtns = document.querySelectorAll(".dash-tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.activeTab = e.target.dataset.tab;
        this.render();
      });
    });

    // Email tabs toggle
    const emailToggleBtns = document.querySelectorAll(".email-toggle-btn");
    emailToggleBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.activeEmailTab = e.currentTarget.dataset.emailTab;
        // Just re-render keeping the same main tab
        this.render();
      });
    });

    // Restart catalog button
    const restartBtn = document.getElementById("btn-restart-catalog");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        this.app.navigate("catalog");
      });
    }

    // Print Invoice action
    const printBtn = document.getElementById("btn-print-invoice");
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        window.print();
      });
    }

    // Capture the mock invoice PDF download link click
    const pdfBtn = document.querySelector('a[href="#view-invoice"]');
    if (pdfBtn) {
      pdfBtn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Simulación de descarga: El PDF de la factura se guardaría en su dispositivo.");
      });
    }
  }
}
