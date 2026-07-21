// Admin Back Office Dashboard - B2B Order, Product, and Client Management
export default class AdminDashboard {
  constructor(app) {
    this.app = app;
    this.containerId = "main-content";
    this.authenticated = false;
    this.activeTab = "overview"; // overview, orders, products, clients
    
    // Selection caches
    this.selectedOrderId = null;
    this.selectedProductId = null;
    this.selectedClientCif = null;
  }

  getOrders() {
    try {
      const stored = localStorage.getItem("croqon_b2b_orders");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load orders", e);
      return [];
    }
  }

  saveOrders(orders) {
    try {
      localStorage.setItem("croqon_b2b_orders", JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders", e);
    }
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Toggle main container styling
    const mainContainer = document.getElementById("main-container");
    if (mainContainer) {
      mainContainer.classList.add("gateway-view-active"); // Force dark background fit
    }

    if (!this.authenticated) {
      this.renderPasscodeGate(container);
      return;
    }

    this.renderDashboard(container);
  }

  renderPasscodeGate(container) {
    container.innerHTML = `
      <div class="gateway-container fade-in">
        <div class="gateway-card">
          <button id="btn-admin-back-home" class="btn-gateway-back">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>Volver a la Vitrina</span>
          </button>
          
          <div class="gateway-brand">
            <img src="assets/images/clean_logo.png" alt="Croqon" class="gateway-logo">
            <h2 class="serif-title golden-text">Administración B2B</h2>
            <p class="subtitle">Acceso restringido para el personal de ventas y logística</p>
          </div>

          <form id="admin-login-form" class="gateway-form">
            <div class="form-group">
              <label for="admin-passcode">Código de Seguridad B2B *</label>
              <input type="password" id="admin-passcode" required placeholder="Ingrese contraseña de acceso">
              <small class="form-hint">Tip de prueba: Ingrese la palabra <strong>admin</strong></small>
            </div>
            
            <div id="admin-login-error" class="hide" style="color: var(--color-error); font-size: 13px; margin-bottom: 15px; text-align: center; font-weight: 500;">
              ❌ Código de acceso incorrecto. Inténtelo de nuevo.
            </div>

            <button type="submit" class="btn-primary btn-block">
              <span>Iniciar Sesión Admin</span>
            </button>
          </form>
        </div>
      </div>
    `;

    this.attachGateEvents();
  }

  renderDashboard(container) {
    container.innerHTML = `
      <div class="admin-dashboard-layout fade-in">
        <!-- Admin Header -->
        <header class="admin-header-bar">
          <div class="admin-header-title">
            <h1 class="serif-title golden-text">Back Office de Ventas</h1>
            <p class="subtitle">Gestión de facturación, tarifas y fichas de clientes B2B</p>
          </div>
          <div class="admin-header-ctas">
            <button id="btn-admin-logout" class="btn-secondary">
              <span>Cerrar Panel</span>
            </button>
          </div>
        </header>

        <!-- Admin Tab Buttons -->
        <div class="admin-tab-header-row">
          <button class="admin-tab-btn ${this.activeTab === "overview" ? "active" : ""}" data-admin-tab="overview">📊 Panel de Control</button>
          <button class="admin-tab-btn ${this.activeTab === "orders" ? "active" : ""}" data-admin-tab="orders">📦 Pedidos Recibidos</button>
          <button class="admin-tab-btn ${this.activeTab === "products" ? "active" : ""}" data-admin-tab="products">🥘 Catálogo de Productos</button>
          <button class="admin-tab-btn ${this.activeTab === "clients" ? "active" : ""}" data-admin-tab="clients">👥 Fichas de Clientes</button>
        </div>

        <!-- Render Tab Content -->
        ${this.renderTabContent()}
      </div>
    `;

    this.attachDashboardEvents();
  }

  renderTabContent() {
    if (this.activeTab === "overview") {
      return this.renderOverviewTab();
    } else if (this.activeTab === "orders") {
      return this.renderOrdersTab();
    } else if (this.activeTab === "products") {
      return this.renderProductsTab();
    } else if (this.activeTab === "clients") {
      return this.renderClientsTab();
    }
    return "";
  }

  /* ====================================================
     TAB 0: WIDGETS OVERVIEW (Panel de Control)
     ==================================================== */
  renderOverviewTab() {
    const orders = this.getOrders();
    const metrics = this.calculateMetrics(orders);
    
    // Detailed analysis
    const flavorSales = this.calculateFlavorSales(orders);
    const routeSales = this.calculateRouteSales(orders);
    const recentActivity = this.getRecentActivity(orders);
    const paymentSplit = this.calculatePaymentSplit(orders);

    return `
      <!-- Metrics cards -->
      <section class="admin-metrics-grid">
        <div class="admin-metric-card">
          <span class="m-label">Ingresos del Mes (TTC)</span>
          <span class="m-value golden-text">${metrics.revenueTTC.toFixed(2)} €</span>
          <span class="m-sub">Facturación comercial acumulada</span>
        </div>
        <div class="admin-metric-card">
          <span class="m-label">Pedidos Completados</span>
          <span class="m-value">${metrics.ordersCount}</span>
          <span class="m-sub">Suministros HORECA registrados</span>
        </div>
        <div class="admin-metric-card">
          <span class="m-label">Ticket Medio (B2B)</span>
          <span class="m-value">${metrics.ordersCount > 0 ? (metrics.revenueTTC / metrics.ordersCount).toFixed(2) : "0.00"} €</span>
          <span class="m-sub">Valor de compra promedio por chef</span>
        </div>
        <div class="admin-metric-card">
          <span class="m-label">Total Cajas Vendidas</span>
          <span class="m-value">${metrics.totalBoxes}</span>
          <span class="m-sub">Volumen de producción o Obrador</span>
        </div>
      </section>

      <!-- Analytics Layout -->
      <div class="admin-analytics-grid">
        <!-- Best Selling Flavors -->
        <div class="analytics-widget-card">
          <div class="widget-header">
            <h3>🥘 Sabor Más Vendido (Top Sabores)</h3>
          </div>
          <div class="widget-content">
            ${flavorSales.length === 0 ? `
              <p style="font-size: 13px; color: var(--color-text-muted); text-align: center; padding: 40px 0;">No hay suficientes datos de venta para generar el ranking.</p>
            ` : flavorSales.map((f, i) => `
              <div class="sales-bar-item">
                <div class="bar-label-row">
                  <span class="bar-name"><strong>${i+1}.</strong> Croquetas de ${f.name}</span>
                  <span class="bar-val">${f.qty} cajas</span>
                </div>
                <div class="bar-outer">
                  <div class="bar-inner" style="width: ${metrics.totalBoxes > 0 ? (f.qty / metrics.totalBoxes * 100) : 0}%"></div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Route Distribution & Payment Split -->
        <div class="analytics-widget-card">
          <div class="widget-header">
            <h3>🚚 Distribución Logística por Destinos</h3>
          </div>
          <div class="widget-content">
            <div class="route-distribution-list">
              ${Object.keys(routeSales).length === 0 ? `
                <p style="font-size: 13px; color: var(--color-text-muted); text-align: center; padding: 15px 0;">Esperando datos de reparto.</p>
              ` : Object.entries(routeSales).map(([city, data]) => `
                <div class="route-item">
                  <span class="route-name"><strong>Ruta ${city}</strong> (${data.orders} envíos)</span>
                  <span class="route-val">${data.boxes} cajas</span>
                </div>
              `).join("")}
            </div>

            <div class="widget-header" style="margin-top: 30px; padding-bottom: 8px;">
              <h3>💳 Liquidación y Cobros</h3>
            </div>
            <div class="route-distribution-list">
              <div class="route-item">
                <span>Cobrado Directo (Stripe Card API)</span>
                <span class="route-val" style="color: #2ecc71;">${paymentSplit.stripe.toFixed(2)} € (${paymentSplit.stripeCount} pedidos)</span>
              </div>
              <div class="route-item">
                <span>Por Validar (Transferencias Santander)</span>
                <span class="route-val" style="color: #f1c40f;">${paymentSplit.transfer.toFixed(2)} € (${paymentSplit.transferCount} pedidos)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Inventory Status Widget (Spans 2 columns) -->
        <div class="analytics-widget-card" style="grid-column: span 2;">
          <div class="widget-header" style="border-bottom: 1px solid var(--color-border-dark); padding-bottom: 12px; margin-bottom: 20px;">
            <h3 style="font-family: var(--font-sans); font-weight: 700; color: var(--color-gold);">📊 Estado de Inventario (Obrador B2B)</h3>
          </div>
          <div class="widget-content">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px;">
              ${this.app.getProducts().map(p => {
                const stockVal = p.stock !== undefined ? p.stock : 100;
                let barColor = "#2ecc71"; // Green
                let textColor = "#2ecc71";
                let statusLabel = "Disponible";
                
                if (stockVal === 0) {
                  barColor = "#e74c3c"; // Red
                  textColor = "#e74c3c";
                  statusLabel = "Agotado";
                } else if (stockVal <= 5) {
                  barColor = "#e67e22"; // Orange
                  textColor = "#e67e22";
                  statusLabel = "Stock Bajo";
                }

                // Max bar logic (assume 120 is full/max stock to visualize percentages)
                const percent = Math.min(100, (stockVal / 120) * 100);

                return `
                  <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 4px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; height: 36px;">
                      <span style="font-weight: bold; font-size: 13px; color: var(--color-text-light); line-height: 1.2;">${p.name}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-top: 5px;">
                      <span style="color: ${textColor}; font-weight: bold; font-size: 14px;">${stockVal} cajas</span>
                      <span style="font-size: 11px; text-transform: uppercase; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px; color: #888; border: 1px solid rgba(255,255,255,0.05);">${statusLabel}</span>
                    </div>
                    <div class="bar-outer" style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; margin-top: 5px; width: 100%;">
                      <div style="height: 100%; width: ${percent}%; background-color: ${barColor}; border-radius: 3px; transition: width 0.3s ease;"></div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>

        <!-- Recent Activity Feed -->
        <div class="analytics-widget-card" style="grid-column: span 2;">
          <div class="widget-header">
            <h3>🔔 Últimas Operaciones en Tiempo Real</h3>
          </div>
          <div class="widget-content">
            <div class="recent-activity-list">
              ${recentActivity.length === 0 ? `
                <p style="font-size: 13px; color: var(--color-text-muted); text-align: center; padding: 20px 0;">Esperando transacciones de venta...</p>
              ` : recentActivity.map(a => `
                <div class="activity-item">
                  <div class="activity-dot ${a.isPaid ? "paid" : "pending"}"></div>
                  <div class="activity-info">
                    <span>Pedido #${a.orderId} colocado por <strong>${a.company}</strong> (${a.contact})</span>
                    <span class="activity-meta">Suministro para ${a.date} | Valor: <strong>${a.total.toFixed(2)} € TTC</strong> | Método: ${a.method === "stripe" ? "Visa/Mastercard" : "Transferencia Bancaria"}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Database Actions -->
      <div style="margin-top: 30px; display: flex; gap: 15px; align-items: center; justify-content: flex-end;">
        <span style="font-size: 11px; color: var(--color-text-muted);">Acciones Rápidas:</span>
        <button id="btn-admin-overview-simulate" class="btn-secondary btn-small">
          <span>⚡ Cargar Simulación de Ventas (Demo)</span>
        </button>
      </div>
    `;
  }

  /* ====================================================
     TAB 1: ORDERS FULFILLMENT
     ==================================================== */
  renderOrdersTab() {
    const orders = this.getOrders();
    const metrics = this.calculateMetrics(orders);
    const selectedOrder = orders.find(o => o.orderId === this.selectedOrderId) || null;

    return `
      <!-- Metrics cards -->
      <section class="admin-metrics-grid">
        <div class="admin-metric-card">
          <span class="m-label">Facturación Bruta (TTC)</span>
          <span class="m-value golden-text">${metrics.revenueTTC.toFixed(2)} €</span>
          <span class="m-sub">${metrics.ordersCount} pedidos registrados</span>
        </div>
        <div class="admin-metric-card">
          <span class="m-label">Carga en Obrador</span>
          <span class="m-value">${metrics.totalBoxes}</span>
          <span class="m-sub">Cajas de 150 uds a preparar</span>
        </div>
        <div class="admin-metric-card">
          <span class="m-label">Transferencias Pendientes</span>
          <span class="m-value ${metrics.pendingTransfers > 0 ? "orange-highlight" : ""}">${metrics.pendingTransfers}</span>
          <span class="m-sub">A la espera de validación bancaria</span>
        </div>
        <div class="admin-metric-card">
          <span class="m-label">Clientes Activos</span>
          <span class="m-value">${metrics.activeClientsCount}</span>
          <span class="m-sub">Establecimientos registrados</span>
        </div>
      </section>

      <!-- Split Panel: Left List, Right Detail -->
      <div class="admin-grid">
        <!-- Orders Table List (Left) -->
        <div class="admin-list-card">
          <div class="card-header-admin">
            <h3>Historial de Pedidos Logísticos</h3>
            <div class="card-header-actions">
              <button id="btn-admin-add-order" class="btn-text" style="color: var(--color-gold-light); font-weight: bold;">➕ Crear Pedido</button>
              <button id="btn-admin-generate-demo" class="btn-text" title="Generar Pedidos de Prueba">⚡ Simular Pedidos</button>
              <button id="btn-admin-clear-all" class="btn-text text-danger" title="Borrar Historial">🗑️ Limpiar Todo</button>
            </div>
          </div>

          <div class="admin-table-wrapper">
            ${orders.length === 0 ? `
              <div class="admin-empty-state">
                <p>No se ha registrado ningún pedido en la base de datos.</p>
                <p class="hint">Los nuevos pedidos completados por los clientes aparecerán aquí automáticamente.</p>
              </div>
            ` : `
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Ref. Pedido</th>
                    <th>Establecimiento</th>
                    <th>Suministro</th>
                    <th>Importe TTC</th>
                    <th>Cobro</th>
                    <th>Logística</th>
                  </tr>
                </thead>
                <tbody>
                  ${orders.map(o => `
                    <tr class="admin-order-row ${o.orderId === this.selectedOrderId ? "selected" : ""}" data-id="${o.orderId}">
                      <td><strong>#${o.orderId.split("-")[1] || o.orderId}</strong></td>
                      <td>
                        <div class="admin-client-cell">
                          <span class="client-name">${o.billing.company}</span>
                          <span class="client-cif">${o.billing.cif}</span>
                        </div>
                      </td>
                      <td><span class="delivery-date-cell">${o.delivery.dateStr.split(" (")[0]}</span></td>
                      <td class="text-right"><strong>${o.total.toFixed(2)} €</strong></td>
                      <td>
                        <span class="status-badge ${o.payment.method === "stripe" || o.payment.status === "paid" ? "paid" : "pending"}">
                          ${o.payment.method === "stripe" || o.payment.status === "paid" ? "Cobrado" : "Pendiente"}
                        </span>
                      </td>
                      <td>
                        <span class="logistics-badge ${o.logisticsStatus || "pending"}">
                          ${this.getLogisticsStatusLabel(o.logisticsStatus)}
                        </span>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `}
          </div>
        </div>

        <!-- Order Details Card (Right) -->
        <div class="admin-detail-card" id="admin-detail-panel">
          ${this.selectedOrderId === "new_manual" ? this.renderManualOrderForm() : this.renderOrderDetailPanel(selectedOrder)}
        </div>
      </div>
    `;
  }

  renderOrderDetailPanel(order) {
    if (!order) {
      return `
        <div class="admin-empty-detail">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" class="gold-ico-svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p>Seleccione un pedido de la lista para ver sus detalles de facturación, ruta y preparar el reparto logístico.</p>
        </div>
      `;
    }

    const isPaid = order.payment.method === "stripe" || order.payment.status === "paid";
    const currentLogisticsStatus = order.logisticsStatus || "pending";

    return `
      <div class="admin-order-detail-wrap fade-in">
        <div class="detail-header">
          <h3>Detalle Pedido #${order.orderId}</h3>
          <span class="detail-time">${order.date}</span>
        </div>

        <div class="detail-section-box">
          <h4>Establecimiento y Contacto</h4>
          <p><strong>Compañía:</strong> ${order.billing.company}</p>
          <p><strong>CIF / NIF:</strong> ${order.billing.cif}</p>
          <p><strong>Chef/Comprador:</strong> ${order.user.contact}</p>
          <p><strong>Teléfono:</strong> ${order.user.phone} | <strong>Email:</strong> ${order.user.email}</p>
        </div>

        <div class="detail-section-box">
          <h4>Dirección de Reparto</h4>
          <p><strong>Ruta:</strong> Málaga - Marbella (Costa del Sol)</p>
          <p><strong>Dirección:</strong> ${order.delivery.address}, ${order.delivery.postal} (${order.delivery.city.toUpperCase()})</p>
          <p><strong>Entrega programada:</strong> <strong>${order.delivery.dateStr}</strong></p>
        </div>

        <div class="detail-section-box">
          <h4>Mercancía a Cargar (Hoja de Carga)</h4>
          <table class="detail-items-table">
            <thead>
              <tr>
                <th>Sabor</th>
                <th class="text-center">Cajas</th>
                <th class="text-right">Total HT</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>Croquetas de ${item.name} <small>(150 uds)</small></td>
                  <td class="text-center"><strong>${item.quantity}</strong></td>
                  <td class="text-right">${(item.price * item.quantity).toFixed(2)} €</td>
                </tr>
              `).join("")}
              <tr class="detail-totals-tr">
                <td>Base Imponible (HT)</td>
                <td colspan="2" class="text-right">${order.subtotal.toFixed(2)} €</td>
              </tr>
              <tr>
                <td>IVA (10%)</td>
                <td colspan="2" class="text-right">${order.vat.toFixed(2)} €</td>
              </tr>
              <tr class="detail-grandtotal-tr">
                <td>Total Neto (TTC)</td>
                <td colspan="2" class="text-right golden-text"><strong>${order.total.toFixed(2)} €</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Order actions -->
        <div class="detail-actions-box">
          <h4>Gestión Administrativa y Financiera</h4>
          <div class="action-btn-row">
            ${!isPaid ? `
              <button class="btn-primary btn-block btn-small" id="btn-admin-approve-payment" data-id="${order.orderId}">
                <span>✓ Validar Transferencia Recibida</span>
              </button>
            ` : `
              <div class="info-success-box">
                ✅ Transacción validada y cobrada con éxito.
              </div>
            `}
          </div>
        </div>

        <div class="detail-actions-box">
          <h4>Fases de Logística de Frío (-18°C)</h4>
          <div class="logistics-update-controls">
            <select id="logistics-status-selector" data-id="${order.orderId}">
              <option value="pending" ${currentLogisticsStatus === "pending" ? "selected" : ""}>Pendiente de Preparación</option>
              <option value="picking" ${currentLogisticsStatus === "picking" ? "selected" : ""}>En Cámara de Frío (Picking)</option>
              <option value="transit" ${currentLogisticsStatus === "transit" ? "selected" : ""}>En Tránsito (Camión Refrigerado)</option>
              <option value="delivered" ${currentLogisticsStatus === "delivered" ? "selected" : ""}>Entregado en Destino</option>
            </select>
            <button class="btn-secondary btn-small" id="btn-admin-update-logistics" data-id="${order.orderId}">
              <span>Actualizar Estado</span>
            </button>
          </div>
        </div>

        <div class="detail-actions-footer-row" style="display: flex; gap: 10px;">
          <button class="btn-secondary btn-small" id="btn-admin-print-slip" data-id="${order.orderId}">
            <span>🖨️ Albarán</span>
          </button>
          <button class="btn-primary btn-small" id="btn-admin-print-invoice" data-id="${order.orderId}">
            <span>📄 Factura B2B</span>
          </button>
          <button class="btn-text text-danger btn-small" id="btn-admin-delete-order" data-id="${order.orderId}" style="margin-left: auto;">
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    `;
  }

  getNextDeliveryDays() {
    const days = [];
    const date = new Date();
    const isEn = this.app.lang === "en";
    
    for (let i = 1; i <= 14; i++) {
      const nextDate = new Date();
      nextDate.setDate(date.getDate() + i);
      const dayOfWeek = nextDate.getDay();
      
      if (dayOfWeek === 2) {
        days.push({
          iso: nextDate.toISOString().split("T")[0],
          formatted: isEn 
            ? `Tuesday, ${nextDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`
            : `Martes, ${nextDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
        });
      } else if (dayOfWeek === 5) {
        days.push({
          iso: nextDate.toISOString().split("T")[0],
          formatted: isEn 
            ? `Friday, ${nextDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`
            : `Viernes, ${nextDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
        });
      }

      if (days.length === 2) break;
    }

    return days;
  }

  renderManualOrderForm() {
    const clients = this.app.getClients();
    const products = this.app.getProducts();
    const nextDays = this.getNextDeliveryDays();

    return `
      <div class="admin-order-detail-wrap fade-in" style="max-height: 80vh; overflow-y: auto; padding-right: 8px;">
        <div class="detail-header" style="margin-bottom: 20px;">
          <h3>Crear Pedido B2B Manual</h3>
          <span class="detail-time">Nueva Operación Logística</span>
        </div>

        <form id="admin-manual-order-form" class="gateway-form" style="padding: 0; background: transparent; border: none; box-shadow: none;">
          <div class="form-group">
            <label for="manual-client-select" style="color: var(--color-gold-light); font-weight: bold;">Establecimiento Registrado *</label>
            <select id="manual-client-select" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: var(--color-text-light); width: 100%; padding: 10px; border-radius: 4px;">
              <option value="">-- Cliente Personalizado / Nuevo --</option>
              ${clients.map(c => `<option value="${c.cif}">${c.name} (${c.cif})</option>`).join("")}
            </select>
          </div>

          <!-- Client details fields -->
          <div id="manual-client-fields" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 15px;">
            <div class="form-group">
              <label for="manual-company-name">Nombre / Razón Social Comercial *</label>
              <input type="text" id="manual-company-name" required placeholder="Ej: Gastrobar La Marea Marbella S.L.">
            </div>
            <div class="form-row" style="display: flex; gap: 15px;">
              <div class="form-group" style="flex: 1;">
                <label for="manual-cif">CIF / NIF *</label>
                <input type="text" id="manual-cif" required placeholder="Ej: B93848201">
              </div>
              <div class="form-group" style="flex: 1;">
                <label for="manual-contact">Chef / Responsable Compras *</label>
                <input type="text" id="manual-contact" required placeholder="Ej: Chef Carlos Martínez">
              </div>
            </div>
            <div class="form-row" style="display: flex; gap: 15px;">
              <div class="form-group" style="flex: 1;">
                <label for="manual-phone">Teléfono de Cocina *</label>
                <input type="tel" id="manual-phone" required placeholder="Ej: +34 654 987 321">
              </div>
              <div class="form-group" style="flex: 2;">
                <label for="manual-email">Email Notificaciones B2B *</label>
                <input type="email" id="manual-email" required placeholder="Ej: compras@lamareamarbella.com">
              </div>
            </div>
          </div>

          <!-- Logistics fields -->
          <div style="margin-top: 20px; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 15px; display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label for="manual-address">Dirección de Reparto (Establecimiento) *</label>
              <input type="text" id="manual-address" required placeholder="Ej: Avenida Bulevar Príncipe Alfonso de Hohenlohe, S/N">
            </div>
            <div class="form-row" style="display: flex; gap: 15px;">
              <div class="form-group" style="flex: 2;">
                <label for="manual-city">Ciudad (Málaga / Costa del Sol) *</label>
                <select id="manual-city" required style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: var(--color-text-light); width: 100%; padding: 10px; border-radius: 4px;">
                  <option value="marbella">Marbella</option>
                  <option value="malaga">Málaga Centro</option>
                  <option value="estepona">Estepona</option>
                  <option value="fuengirola">Fuengirola</option>
                  <option value="torremolinos">Torremolinos</option>
                  <option value="benalmadena">Benalmádena</option>
                </select>
              </div>
              <div class="form-group" style="flex: 1;">
                <label for="manual-postal">Código Postal *</label>
                <input type="text" id="manual-postal" required placeholder="29602" pattern="^[0-9]{5}$">
              </div>
            </div>

            <div class="form-row" style="display: flex; gap: 15px;">
              <div class="form-group" style="flex: 2;">
                <label for="manual-delivery-date">Fecha de Reparto Programada *</label>
                <select id="manual-delivery-date" required style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: var(--color-text-light); width: 100%; padding: 10px; border-radius: 4px;">
                  <option value="${nextDays[0].iso}">${nextDays[0].formatted} (Logística Martes)</option>
                  <option value="${nextDays[1].iso}">${nextDays[1].formatted} (Logística Viernes)</option>
                </select>
              </div>
              <div class="form-group" style="flex: 1;">
                <label for="manual-payment-method">Forma de Pago B2B *</label>
                <select id="manual-payment-method" required style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: var(--color-text-light); width: 100%; padding: 10px; border-radius: 4px;">
                  <option value="transfer">Transferencia</option>
                  <option value="stripe">Tarjeta (Stripe)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Product quantities section -->
          <div class="detail-section-box" style="margin-top: 20px;">
            <h4 style="margin-bottom: 12px; color: var(--color-gold-light);">Unidades en Pedido (Cajas de 150 uds / 70 uds)</h4>
            <div class="manual-products-list" style="display: flex; flex-direction: column; gap: 12px;">
              ${products.map(p => {
                const name = this.app.lang === "en" && p.name_en ? p.name_en : p.name;
                return `
                  <div class="manual-prod-row" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 8px;">
                    <div style="flex: 1; padding-right: 15px;">
                      <strong style="font-size: 13px; color: var(--color-text-light);">${name}</strong><br>
                      <small style="color: var(--color-text-muted); font-size: 11px;">Caja de ${p.units} uds | ${p.price.toFixed(2)} €/caja HT</small>
                    </div>
                    <div style="width: 80px;">
                      <input type="number" class="manual-qty-input" data-prod-id="${p.id}" value="0" min="0" max="99" style="text-align: center; font-weight: bold; width: 100%; padding: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: var(--color-text-light); border-radius: 4px;">
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <div style="margin-top: 25px; display: flex; gap: 15px;">
            <button type="submit" class="btn-primary" style="flex: 1;">
              <span>Crear y Sincronizar Pedido</span>
            </button>
            <button type="button" class="btn-secondary" id="btn-admin-cancel-manual-order" style="flex: 1;">
              <span>Cancelar</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /* ====================================================
     TAB 2: PRODUCTS EDITOR
     ==================================================== */
  renderProductsTab() {
    const products = this.app.getProducts();
    const selectedProduct = products.find(p => p.id === this.selectedProductId) || null;

    return `
      <div class="admin-grid">
        <!-- Products Table (Left) -->
        <div class="admin-list-card">
          <div class="card-header-admin">
            <h3>Fichas de Croquetas</h3>
            <div class="card-header-actions">
              <button id="btn-admin-add-product" class="btn-text">⚡ Añadir Croqueta</button>
              <button id="btn-admin-restore-products" class="btn-text text-danger">🔄 Restaurar por Defectos</button>
            </div>
          </div>

          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Sabor / Variedad</th>
                  <th>Precio Caja HT</th>
                  <th>Formato</th>
                  <th>Stock</th>
                  <th>Categoría</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => {
                  const stockVal = p.stock !== undefined ? p.stock : 100;
                  let stockStyle = "color: #2ecc71; font-weight: bold;"; // Green for sufficient stock
                  let stockText = `${stockVal} cajas`;
                  if (stockVal === 0) {
                    stockStyle = "color: #e74c3c; font-weight: bold; background: rgba(231, 76, 60, 0.1); padding: 2px 6px; border-radius: 3px;";
                    stockText = "Agotado";
                  } else if (stockVal <= 5) {
                    stockStyle = "color: #e67e22; font-weight: bold; background: rgba(230, 126, 34, 0.1); padding: 2px 6px; border-radius: 3px;";
                    stockText = `${stockVal} (Bajo)`;
                  }
                  return `
                    <tr class="admin-product-row ${p.id === this.selectedProductId ? "selected" : ""}" data-prod-id="${p.id}">
                      <td><strong>${p.name}</strong><br><small style="color: #888;">${p.badge || "Gourmet"}</small></td>
                      <td><strong>${p.price.toFixed(2)} €</strong></td>
                      <td>${p.units} uds / ${p.weight}g</td>
                      <td><span style="${stockStyle}">${stockText}</span></td>
                      <td><span class="status-badge" style="background: rgba(197, 168, 128, 0.1); color: #c5a880;">${p.flavorProfile.split(" / ")[0]}</span></td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Product Editing Panel (Right) -->
        <div class="admin-detail-card">
          ${this.renderProductEditPanel(selectedProduct)}
        </div>
      </div>
    `;
  }

  renderProductEditPanel(product) {
    if (!product && this.selectedProductId !== "new") {
      return `
        <div class="admin-empty-detail">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" class="gold-ico-svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          <p>Seleccione un sabor de croqueta de la lista para editar sus precios comerciales o añadir un nuevo producto.</p>
        </div>
      `;
    }

    const isNew = this.selectedProductId === "new";
    const p = product || {
      id: "nueva-croqueta-" + Math.floor(Math.random() * 1000),
      name: "",
      description: "",
      price: 80.00,
      units: 150,
      weight: 30,
      badge: "Edición Limitada",
      flavorProfile: "Gourmet / Exclusivo",
      ingredients: "Leche entera, mantequilla, harina de trigo, pan rallado, huevo, sal.",
      allergens: ["Gluten", "Lácteos", "Huevo"]
    };

    return `
      <div class="admin-order-detail-wrap fade-in">
        <div class="detail-header">
          <h3>${isNew ? "Añadir Nueva Croqueta B2B" : `Editar Ficha - ${p.name}`}</h3>
        </div>

        <form id="admin-product-edit-form" class="gateway-form" style="padding: 0;">
          <input type="hidden" id="edit-prod-id" value="${p.id}">
          
          <div class="form-group">
            <label for="edit-prod-name">Nombre Comercial del Sabor *</label>
            <input type="text" id="edit-prod-name" required value="${p.name}" placeholder="Ej: Jamón Ibérico de Bellota">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-prod-price">Precio Caja HT (€) *</label>
              <input type="number" step="0.01" id="edit-prod-price" required value="${p.price.toFixed(2)}">
            </div>
            <div class="form-group">
              <label for="edit-prod-badge">Etiqueta Informativa (Badge)</label>
              <input type="text" id="edit-prod-badge" value="${p.badge || ""}" placeholder="Ej: Sabor Intenso">
            </div>
          </div>

          <div class="form-row" style="display: flex; gap: 15px;">
            <div class="form-group" style="flex: 1;">
              <label for="edit-prod-units">Unidades por Caja *</label>
              <input type="number" id="edit-prod-units" required value="${p.units}">
            </div>
            <div class="form-group" style="flex: 1;">
              <label for="edit-prod-weight">Peso por Croqueta (g) *</label>
              <input type="number" id="edit-prod-weight" required value="${p.weight}">
            </div>
            <div class="form-group" style="flex: 1;">
              <label for="edit-prod-stock">Stock Disponible (Cajas) *</label>
              <input type="number" id="edit-prod-stock" required value="${p.stock !== undefined ? p.stock : 100}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-prod-image-source">Imagen del Producto *</label>
              <select id="edit-prod-image-source" required>
                <option value="default" ${!p.imagePath ? "selected" : ""}>Recorte de Grid por defecto (collections_grid.jpg)</option>
                <option value="assets/images/product_sheet_serrano.jpg" ${p.imagePath === "assets/images/product_sheet_serrano.jpg" ? "selected" : ""}>Imagen Jamón Serrano (product_sheet_serrano.jpg)</option>
                <option value="assets/images/art_of_croquettes.jpg" ${p.imagePath === "assets/images/art_of_croquettes.jpg" ? "selected" : ""}>El Arte de la Croqueta (art_of_croquettes.jpg)</option>
                <option value="assets/images/box_packaging.jpg" ${p.imagePath === "assets/images/box_packaging.jpg" ? "selected" : ""}>Caja de Packaging Croqon (box_packaging.jpg)</option>
                <option value="custom" ${p.imagePath && !["assets/images/product_sheet_serrano.jpg", "assets/images/art_of_croquettes.jpg", "assets/images/box_packaging.jpg"].includes(p.imagePath) ? "selected" : ""}>Ruta personalizada / URL externa</option>
              </select>
            </div>
            <div class="form-group ${p.imagePath && !["assets/images/product_sheet_serrano.jpg", "assets/images/art_of_croquettes.jpg", "assets/images/box_packaging.jpg"].includes(p.imagePath) ? "" : "hide"}" id="edit-prod-image-custom-wrap">
              <label for="edit-prod-image-custom">Ruta de Imagen / URL Externa *</label>
              <input type="text" id="edit-prod-image-custom" value="${p.imagePath || ""}" placeholder="Ej: assets/images/nueva.png">
            </div>
          </div>

          <div class="form-group">
            <label for="edit-prod-desc">Descripción Comercial *</label>
            <textarea id="edit-prod-desc" required rows="3" placeholder="Descripción breve para la vitrina">${p.description || ""}</textarea>
          </div>

          <div class="form-group">
            <label for="edit-prod-profile">Perfil de Sabor (Categoría) *</label>
            <input type="text" id="edit-prod-profile" required value="${p.flavorProfile}" placeholder="Ej: Ibérico / Premium">
          </div>

          <div class="form-group">
            <label for="edit-prod-ingredients">Ingredientes Nobles</label>
            <textarea id="edit-prod-ingredients" rows="3" placeholder="Listado de ingredientes principales">${p.ingredients || ""}</textarea>
          </div>

          <div style="margin-top: 25px; display: flex; gap: 15px;">
            <button type="submit" class="btn-primary" style="flex: 1;">
              <span>Guardar Ficha Sabor</span>
            </button>
            ${!isNew ? `
              <button type="button" class="btn-secondary text-danger" id="btn-admin-delete-product" data-prod-id="${p.id}">
                <span>Eliminar Sabor</span>
              </button>
            ` : ""}
          </div>
        </form>
      </div>
    `;
  }

  /* ====================================================
     TAB 3: CLIENT RECORDS & PASSCODES
     ==================================================== */
  renderClientsTab() {
    const clients = this.app.getClients();
    const selectedClient = clients.find(c => c.cif === this.selectedClientCif) || null;

    return `
      <div class="admin-grid">
        <!-- Clients List (Left) -->
        <div class="admin-list-card">
          <div class="card-header-admin">
            <h3>Establecimientos Registrados</h3>
            <div class="card-header-actions" style="display: flex; align-items: center;">
              <button id="btn-admin-add-client" class="btn-text" style="color: var(--color-gold-light); font-weight: bold; margin-right: 15px;">➕ Crear Cliente</button>
              <span style="color: var(--color-gold); font-size: 13px; font-weight: bold;">Total: ${clients.length}</span>
            </div>
          </div>

          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Razón Social</th>
                  <th>CIF / NIF</th>
                  <th>Contacto Chef</th>
                  <th>Código PIN</th>
                </tr>
              </thead>
              <tbody>
                ${clients.map(c => `
                  <tr class="admin-client-row ${c.cif === this.selectedClientCif ? "selected" : ""}" data-cif="${c.cif}">
                    <td><strong>${c.name}</strong><br><small style="color: #888; text-transform: uppercase;">${c.sector}</small></td>
                    <td><strong>${c.cif}</strong></td>
                    <td>${c.contact}</td>
                    <td>
                      <span style="font-family: monospace; background: #111; color: var(--color-gold); padding: 4px 8px; border-radius: 3px; font-weight: bold; border: 1px dashed rgba(197, 168, 128, 0.4);">
                        ${c.pin}
                      </span>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Client Profile Details & PIN Reset (Right) -->
        <div class="admin-detail-card">
          ${this.selectedClientCif === "new" ? this.renderClientCreateForm() : this.renderClientEditPanel(selectedClient)}
        </div>
      </div>
    `;
  }

  renderClientEditPanel(client) {
    if (!client) {
      return `
        <div class="admin-empty-detail">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" class="gold-ico-svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <p>Seleccione un establecimiento de la lista para gestionar su ficha de cliente, actualizar datos o regenerar su PIN de acceso rápido.</p>
        </div>
      `;
    }

    return `
      <div class="admin-order-detail-wrap fade-in">
        <div class="detail-header">
          <h3>Ficha de Establecimiento B2B</h3>
          <span class="detail-time">CIF: ${client.cif}</span>
        </div>

        <!-- Regenerar PIN Alert Card (Visual focus) -->
        <div style="background-color: rgba(197, 168, 128, 0.04); border: 1px solid var(--color-border-dark); padding: 20px; border-radius: 4px; text-align: center; margin-bottom: 10px;">
          <span style="font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); display: block; margin-bottom: 8px; font-weight: bold;">PIN DE ACCESO ACTUAL</span>
          <div style="font-family: monospace; font-size: 32px; font-weight: bold; color: var(--color-gold); letter-spacing: 4px; background-color: #111; padding: 10px; border-radius: 4px; display: inline-block; border: 1px solid var(--color-border-dark);">
            ${client.pin}
          </div>
          <p style="font-size: 12px; color: var(--color-text-muted); margin: 12px 0 15px;">Si el cliente ha olvidado sus datos de acceso pro, genere un nuevo PIN aleatorio aquí.</p>
          <button type="button" class="btn-primary btn-small" id="btn-admin-regenerate-client-pin" data-cif="${client.cif}">
            <span>🔄 Regenerar Código de Acceso (PIN)</span>
          </button>
        </div>

        <form id="admin-client-edit-form" class="gateway-form" style="padding: 0;">
          <input type="hidden" id="edit-client-cif" value="${client.cif}">
          
          <div class="form-group">
            <label for="edit-client-name">Razón Social del Suministro *</label>
            <input type="text" id="edit-client-name" required value="${client.name}">
          </div>

          <div class="form-row">
            <div class="form-group flex-2">
              <label for="edit-client-contact">Chef / Gestor de Compras *</label>
              <input type="text" id="edit-client-contact" required value="${client.contact}">
            </div>
            <div class="form-group">
              <label for="edit-client-sector">Sector</label>
              <select id="edit-client-sector">
                <option value="restaurante" ${client.sector === "restaurante" ? "selected" : ""}>Gastrobar / Rest.</option>
                <option value="hotel" ${client.sector === "hotel" ? "selected" : ""}>Hotel / Catering</option>
                <option value="beach-club" ${client.sector === "beach-club" ? "selected" : ""}>Beach Club</option>
                <option value="distribuidor" ${client.sector === "distribuidor" ? "selected" : ""}>Distribuidor</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-client-phone">Teléfono Móvil / Fijo *</label>
              <input type="tel" id="edit-client-phone" required value="${client.phone}">
            </div>
            <div class="form-group flex-2">
              <label for="edit-client-email">Email de Facturación *</label>
              <input type="email" id="edit-client-email" required value="${client.email}">
            </div>
          </div>

          <div style="margin-top: 25px; display: flex; gap: 15px;">
            <button type="submit" class="btn-primary" style="flex: 1;">
              <span>Actualizar Ficha Cliente</span>
            </button>
            <button type="button" class="btn-secondary text-danger" id="btn-admin-delete-client" data-cif="${client.cif}">
              <span>Dar de Baja Cliente</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  renderClientCreateForm() {
    // Generate a random 4-digit PIN for access
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();

    return `
      <div class="admin-order-detail-wrap fade-in">
        <div class="detail-header" style="margin-bottom: 20px;">
          <h3>Registrar Establecimiento B2B</h3>
          <span class="detail-time">Crear Perfil del Cliente</span>
        </div>

        <form id="admin-manual-client-form" class="gateway-form" style="padding: 0; background: transparent; border: none; box-shadow: none;">
          <div class="form-group">
            <label for="reg-company-name">Nombre / Razón Social Comercial *</label>
            <input type="text" id="reg-company-name" required placeholder="Ej: Ocean Beach Club Marbella S.L.">
          </div>
          <div class="form-row" style="display: flex; gap: 15px;">
            <div class="form-group" style="flex: 1;">
              <label for="reg-cif">CIF / NIF / SIRET *</label>
              <input type="text" id="reg-cif" required placeholder="Ej: B29302919">
            </div>
            <div class="form-group" style="flex: 1;">
              <label for="reg-contact">Chef / Responsable Compras *</label>
              <input type="text" id="reg-contact" required placeholder="Ej: Chef Antonio Ruiz">
            </div>
          </div>
          <div class="form-row" style="display: flex; gap: 15px;">
            <div class="form-group" style="flex: 1;">
              <label for="reg-phone">Teléfono de Cocina *</label>
              <input type="tel" id="reg-phone" required placeholder="Ej: +34 670 987 654">
            </div>
            <div class="form-group" style="flex: 2;">
              <label for="reg-email">Email Comercial *</label>
              <input type="email" id="reg-email" required placeholder="Ej: compras@oceanbeachmarbella.com">
            </div>
          </div>

          <div class="form-row" style="display: flex; gap: 15px;">
            <div class="form-group" style="flex: 1;">
              <label for="reg-sector">Sector Profesional *</label>
              <select id="reg-sector" required style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: var(--color-text-light); width: 100%; padding: 10px; border-radius: 4px;">
                <option value="restaurant">Restaurante / Gastrobar</option>
                <option value="hotel">Hotel / Catering</option>
                <option value="beach-club">Beach Club / Chiringuito</option>
                <option value="distributor">Distribuidor Gourmet</option>
              </select>
            </div>
            <div class="form-group" style="flex: 1;">
              <label for="reg-pin">Código PIN de Acceso *</label>
              <input type="text" id="reg-pin" required value="${randomPin}" maxlength="4" style="font-family: monospace; font-weight: bold; text-align: center; color: var(--color-gold); background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 10px;">
            </div>
          </div>

          <div style="margin-top: 25px; display: flex; gap: 15px;">
            <button type="submit" class="btn-primary" style="flex: 1;">
              <span>Registrar y Activar Cliente</span>
            </button>
            <button type="button" class="btn-secondary" id="btn-admin-cancel-client-creation" style="flex: 1;">
              <span>Cancelar</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /* ====================================================
     ANALYTICS HELPER CALCULATIONS
     ==================================================== */
  calculateFlavorSales(orders) {
    const counts = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.quantity;
      });
    });

    return Object.entries(counts)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);
  }

  calculateRouteSales(orders) {
    const routes = {};
    orders.forEach(o => {
      const city = o.delivery.city;
      if (!routes[city]) {
        routes[city] = { orders: 0, boxes: 0 };
      }
      routes[city].orders += 1;
      routes[city].boxes += o.items.reduce((sum, item) => sum + item.quantity, 0);
    });
    return routes;
  }

  getRecentActivity(orders) {
    // Return last 4 orders placed
    return orders
      .slice(-4)
      .reverse()
      .map(o => ({
        orderId: o.orderId,
        company: o.billing.company,
        contact: o.user.contact,
        date: o.delivery.dateStr.split(" (")[0],
        total: o.total,
        method: o.payment.method,
        isPaid: o.payment.method === "stripe" || o.payment.status === "paid"
      }));
  }

  calculatePaymentSplit(orders) {
    const split = { stripe: 0, stripeCount: 0, transfer: 0, transferCount: 0 };
    orders.forEach(o => {
      const isPaid = o.payment.method === "stripe" || o.payment.status === "paid";
      if (isPaid) {
        split.stripe += o.total;
        split.stripeCount += 1;
      } else {
        split.transfer += o.total;
        split.transferCount += 1;
      }
    });
    return split;
  }

  getLogisticsStatusLabel(status) {
    switch (status) {
      case "picking": return "Cámara Frío";
      case "transit": return "En Ruta";
      case "delivered": return "Entregado";
      case "pending":
      default:
        return "Pendiente";
    }
  }

  calculateMetrics(orders) {
    const metrics = {
      revenueTTC: 0,
      totalBoxes: 0,
      pendingTransfers: 0,
      ordersCount: orders.length,
      activeClientsCount: 0
    };

    const clientsSet = new Set();

    orders.forEach(o => {
      metrics.revenueTTC += o.total;
      metrics.totalBoxes += o.items.reduce((sum, item) => sum + item.quantity, 0);
      
      const isPaid = o.payment.method === "stripe" || o.payment.status === "paid";
      if (!isPaid) {
        metrics.pendingTransfers += 1;
      }

      if (o.billing.company) {
        clientsSet.add(o.billing.company);
      }
    });

    metrics.activeClientsCount = clientsSet.size;

    return metrics;
  }

  attachGateEvents() {
    const gateForm = document.getElementById("admin-login-form");
    const errorMsg = document.getElementById("admin-login-error");
    const backBtn = document.getElementById("btn-admin-back-home");

    if (gateForm) {
      gateForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const code = document.getElementById("admin-passcode").value;
        if (code === "admin") {
          this.authenticated = true;
          if (errorMsg) errorMsg.classList.add("hide");
          this.render();
        } else {
          if (errorMsg) errorMsg.classList.remove("hide");
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.app.navigate("home");
      });
    }
  }

  attachDashboardEvents() {
    const logoutBtn = document.getElementById("btn-admin-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.authenticated = false;
        this.selectedOrderId = null;
        
        // Remove class forced on main-container
        const mainContainer = document.getElementById("main-container");
        if (mainContainer) {
          mainContainer.classList.remove("gateway-view-active");
        }

        this.app.navigate("home");
      });
    }

    // Tab buttons event listeners
    document.querySelectorAll(".admin-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.activeTab = e.target.dataset.adminTab;
        this.render();
      });
    });

    /* ====================================
       TAB EVENTS: OVERVIEW (Panel de Control)
       ==================================== */
    if (this.activeTab === "overview") {
      const simulateBtn = document.getElementById("btn-admin-overview-simulate");
      if (simulateBtn) {
        simulateBtn.addEventListener("click", () => {
          this.generateDemoOrders();
          alert("Base de datos simulada con éxito. Datos comerciales cargados en el Panel.");
          this.render();
        });
      }
    }

    /* ====================================
       TAB EVENTS: ORDERS
       ==================================== */
    if (this.activeTab === "orders") {
      // Order row click
      document.querySelectorAll(".admin-order-row").forEach(row => {
        row.addEventListener("click", (e) => {
          this.selectedOrderId = e.currentTarget.dataset.id;
          this.render();
        });
      });

      // Clear all orders
      const clearBtn = document.getElementById("btn-admin-clear-all");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          if (confirm("¿Está seguro de que desea eliminar todos los pedidos de la base de datos?")) {
            this.saveOrders([]);
            this.selectedOrderId = null;
            this.render();
          }
        });
      }

      // Generate demo orders
      const generateBtn = document.getElementById("btn-admin-generate-demo");
      if (generateBtn) {
        generateBtn.addEventListener("click", () => {
          this.generateDemoOrders();
          this.render();
        });
      }

      // Payment validation button
      const approvePaymentBtn = document.getElementById("btn-admin-approve-payment");
      if (approvePaymentBtn) {
        approvePaymentBtn.addEventListener("click", (e) => {
          const orderId = e.currentTarget.dataset.id;
          const orders = this.getOrders();
          const order = orders.find(o => o.orderId === orderId);
          if (order) {
            order.payment.status = "paid";
            this.saveOrders(orders);
            this.render();
          }
        });
      }

      // Logistics status update button
      const updateLogisticsBtn = document.getElementById("btn-admin-update-logistics");
      if (updateLogisticsBtn) {
        updateLogisticsBtn.addEventListener("click", (e) => {
          const orderId = e.currentTarget.dataset.id;
          const select = document.getElementById("logistics-status-selector");
          if (select) {
            const status = select.value;
            const orders = this.getOrders();
            const order = orders.find(o => o.orderId === orderId);
            if (order) {
              order.logisticsStatus = status;
              this.saveOrders(orders);
              alert(`Estado logístico actualizado a: ${this.getLogisticsStatusLabel(status)}`);
              this.render();
            }
          }
        });
      }

      // Delete order
      const deleteOrderBtn = document.getElementById("btn-admin-delete-order");
      if (deleteOrderBtn) {
        deleteOrderBtn.addEventListener("click", (e) => {
          const orderId = e.currentTarget.dataset.id;
          if (confirm(`¿Eliminar el pedido #${orderId} de forma permanente?`)) {
            let orders = this.getOrders();
            orders = orders.filter(o => o.orderId !== orderId);
            this.saveOrders(orders);
            this.selectedOrderId = null;
            this.render();
          }
        });
      }

      // Add manual order button click listener
      const addOrderBtn = document.getElementById("btn-admin-add-order");
      if (addOrderBtn) {
        addOrderBtn.addEventListener("click", () => {
          this.selectedOrderId = "new_manual";
          this.render();
        });
      }

      // Cancel manual order button click listener
      const cancelManualOrderBtn = document.getElementById("btn-admin-cancel-manual-order");
      if (cancelManualOrderBtn) {
        cancelManualOrderBtn.addEventListener("click", () => {
          this.selectedOrderId = null;
          this.render();
        });
      }

      // Client dropdown auto-fill logic
      const clientSelect = document.getElementById("manual-client-select");
      if (clientSelect) {
        clientSelect.addEventListener("change", (e) => {
          const cifVal = e.target.value;
          const compInput = document.getElementById("manual-company-name");
          const cifInput = document.getElementById("manual-cif");
          const contactInput = document.getElementById("manual-contact");
          const phoneInput = document.getElementById("manual-phone");
          const emailInput = document.getElementById("manual-email");
          const addressInput = document.getElementById("manual-address");
          const cityInput = document.getElementById("manual-city");
          const postalInput = document.getElementById("manual-postal");

          if (!cifVal) {
            // Clear fields for custom
            if (compInput) compInput.value = "";
            if (cifInput) cifInput.value = "";
            if (contactInput) contactInput.value = "";
            if (phoneInput) phoneInput.value = "";
            if (emailInput) emailInput.value = "";
            if (addressInput) addressInput.value = "";
            if (postalInput) postalInput.value = "";
          } else {
            const clients = this.app.getClients();
            const client = clients.find(c => c.cif === cifVal);
            if (client) {
              if (compInput) compInput.value = client.name;
              if (cifInput) cifInput.value = client.cif;
              if (contactInput) contactInput.value = client.contact;
              if (phoneInput) phoneInput.value = client.phone;
              if (emailInput) emailInput.value = client.email;
              
              // Smart defaults for address if it's the demo client
              if (client.cif === "B93848201") {
                if (addressInput) addressInput.value = "Avenida Bulevar Príncipe Alfonso de Hohenlohe, S/N";
                if (cityInput) cityInput.value = "marbella";
                if (postalInput) postalInput.value = "29602";
              } else {
                if (addressInput) addressInput.value = "";
                if (postalInput) postalInput.value = "";
              }
            }
          }
        });
      }

      // Manual order form submit handler
      const manualOrderForm = document.getElementById("admin-manual-order-form");
      if (manualOrderForm) {
        manualOrderForm.addEventListener("submit", (e) => {
          e.preventDefault();

          const companyName = document.getElementById("manual-company-name").value;
          const cif = document.getElementById("manual-cif").value;
          const contact = document.getElementById("manual-contact").value;
          const phone = document.getElementById("manual-phone").value;
          const email = document.getElementById("manual-email").value;

          const address = document.getElementById("manual-address").value;
          const city = document.getElementById("manual-city").value;
          const postal = document.getElementById("manual-postal").value;

          const deliveryDateSelect = document.getElementById("manual-delivery-date");
          const deliveryDateStr = deliveryDateSelect.options[deliveryDateSelect.selectedIndex].text;
          const deliveryDateIso = deliveryDateSelect.value;

          const paymentMethod = document.getElementById("manual-payment-method").value;

          // Gather quantities
          const orderItems = [];
          let totalBoxes = 0;
          const products = this.app.getProducts();
          let stockError = null;

          document.querySelectorAll(".manual-qty-input").forEach(input => {
            const prodId = input.dataset.prodId;
            const quantity = parseInt(input.value) || 0;
            if (quantity > 0) {
              const prod = products.find(p => p.id === prodId);
              if (prod) {
                const maxStock = prod.stock !== undefined ? prod.stock : 100;
                if (quantity > maxStock) {
                  stockError = `No hay suficiente stock para: ${prod.name}. Stock disponible: ${maxStock} cajas.`;
                }
                orderItems.push({
                  id: prod.id,
                  name: prod.name,
                  name_en: prod.name_en || prod.name,
                  price: prod.price,
                  units: prod.units,
                  quantity: quantity
                });
                totalBoxes += quantity;
              }
            }
          });

          // Stock level validation check
          if (stockError) {
            alert(stockError);
            return;
          }

          // Validation
          if (totalBoxes < 2) {
            alert(this.app.lang === "en" 
              ? "Minimum order volume is 2 boxes. Please adjust quantities." 
              : "El volumen mínimo de pedido profesional es de 2 cajas. Ajuste las cantidades.");
            return;
          }

          // Calculate subtotal, vat, total
          let subtotal = 0;
          orderItems.forEach(item => {
            subtotal += item.price * item.quantity;
          });
          const vat = subtotal * 0.10;
          const total = subtotal + vat;

          // Generate order ID
          const orderId = "CRQ-" + Math.floor(100000 + Math.random() * 90000);

          const orderObj = {
            orderId: orderId,
            date: new Date().toLocaleDateString(this.app.lang === "en" ? "en-US" : "es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
            user: {
              name: companyName,
              cif: cif,
              contact: contact,
              phone: phone,
              email: email,
              sector: "restaurant"
            },
            delivery: {
              address: address,
              city: city,
              postal: postal,
              dateStr: deliveryDateStr,
            },
            billing: {
              company: companyName,
              address: address,
              cif: cif
            },
            payment: {
              method: paymentMethod,
              status: paymentMethod === "stripe" ? "paid" : "pending",
              cardHolder: paymentMethod === "stripe" ? "Gestión Admin" : null
            },
            items: orderItems,
            subtotal: subtotal,
            vat: vat,
            total: total,
            logisticsStatus: "pending"
          };

          const orders = this.getOrders();
          orders.push(orderObj);
          this.saveOrders(orders);

          // Deduct stock for ordered items
          orderItems.forEach(orderItem => {
            const prod = products.find(p => p.id === orderItem.id);
            if (prod) {
              prod.stock = Math.max(0, (prod.stock !== undefined ? prod.stock : 100) - orderItem.quantity);
            }
          });
          this.app.saveProducts(products); // Syncs to server immediately!

          this.selectedOrderId = orderId;
          alert(this.app.lang === "en" 
            ? "Manual B2B order successfully created and synced!" 
            : "¡Pedido B2B manual creado y sincronizado con éxito!");
          this.render();
        });
      }

      // Print invoice button listener
      const printInvoiceBtn = document.getElementById("btn-admin-print-invoice");
      if (printInvoiceBtn) {
        printInvoiceBtn.addEventListener("click", (e) => {
          const orderId = e.currentTarget.dataset.id;
          const orders = this.getOrders();
          const order = orders.find(o => o.orderId === orderId);
          if (order) {
            import("./Invoice.js").then(module => {
              const InvoiceClass = module.default;
              const printWindow = window.open("", "_blank");
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Factura B2B - #${order.orderId}</title>
                    <link rel="stylesheet" href="index.css">
                    <style>
                      body { background: white !important; color: #111111 !important; padding: 20px; font-family: 'Inter', sans-serif; }
                      .invoice-sheet { box-shadow: none !important; border: none !important; margin: 0 auto; max-width: 800px; display: block !important; }
                      @media print {
                        body { padding: 0 !important; }
                      }
                    </style>
                  </head>
                  <body onload="window.print()">
                    ${InvoiceClass.renderHTML(order, this.app.lang || "es")}
                  </body>
                </html>
              `);
              printWindow.document.close();
            }).catch(err => {
              console.error("Failed to dynamically load Invoice component for printing", err);
              alert("Error al cargar la factura para impresión.");
            });
          }
        });
      }
    }

    /* ====================================
       TAB EVENTS: PRODUCTS
       ==================================== */
    if (this.activeTab === "products") {
      // Product row click
      document.querySelectorAll(".admin-product-row").forEach(row => {
        row.addEventListener("click", (e) => {
          this.selectedProductId = e.currentTarget.dataset.prodId;
          this.render();
        });
      });

      // Add Product button
      const addProdBtn = document.getElementById("btn-admin-add-product");
      if (addProdBtn) {
        addProdBtn.addEventListener("click", () => {
          this.selectedProductId = "new";
          this.render();
        });
      }

      // Restore Defaults
      const restoreProdsBtn = document.getElementById("btn-admin-restore-products");
      if (restoreProdsBtn) {
        restoreProdsBtn.addEventListener("click", () => {
          if (confirm("¿Desea restaurar el catálogo por defecto y borrar los sabores personalizados?")) {
            localStorage.removeItem("croqon_b2b_products");
            this.app.getProducts(); // Will reseed default list
            this.selectedProductId = null;
            this.render();
          }
        });
      }

      // Image source select change listener
      const imageSourceSelect = document.getElementById("edit-prod-image-source");
      const customImageWrap = document.getElementById("edit-prod-image-custom-wrap");
      const customImageInput = document.getElementById("edit-prod-image-custom");

      if (imageSourceSelect && customImageWrap && customImageInput) {
        imageSourceSelect.addEventListener("change", (e) => {
          if (e.target.value === "custom") {
            customImageWrap.classList.remove("hide");
            customImageInput.required = true;
          } else {
            customImageWrap.classList.add("hide");
            customImageInput.required = false;
          }
        });
      }

      // Edit Form Submit
      const prodForm = document.getElementById("admin-product-edit-form");
      if (prodForm) {
        prodForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const prodId = document.getElementById("edit-prod-id").value;
          const products = this.app.getProducts();
          const existingProduct = products.find(p => p.id === prodId) || {};
          
          const imgSourceSelect = document.getElementById("edit-prod-image-source").value;
          let imagePath = null;
          if (imgSourceSelect === "custom") {
            imagePath = document.getElementById("edit-prod-image-custom").value.trim() || null;
          } else if (imgSourceSelect !== "default") {
            imagePath = imgSourceSelect;
          }

          const newProduct = {
            id: prodId,
            name: document.getElementById("edit-prod-name").value,
            description: document.getElementById("edit-prod-desc").value,
            price: parseFloat(document.getElementById("edit-prod-price").value),
            units: parseInt(document.getElementById("edit-prod-units").value),
            weight: parseInt(document.getElementById("edit-prod-weight").value),
            badge: document.getElementById("edit-prod-badge").value,
            flavorProfile: document.getElementById("edit-prod-profile").value,
            ingredients: document.getElementById("edit-prod-ingredients").value,
            allergens: existingProduct.allergens || ["Gluten", "Lácteos", "Huevo"],
            imageType: imagePath ? "file" : "grid",
            imageClass: existingProduct.imageClass || "img-jamon-iberico",
            imagePath: imagePath,
            stock: parseInt(document.getElementById("edit-prod-stock").value) || 0
          };

          const existingIndex = products.findIndex(p => p.id === prodId);
          if (existingIndex > -1) {
            products[existingIndex] = newProduct;
          } else {
            products.push(newProduct);
          }

          this.app.saveProducts(products);
          this.selectedProductId = prodId;
          alert("Ficha de croqueta guardada con éxito en el catálogo.");
          this.render();
        });
      }

      // Delete Product
      const deleteProdBtn = document.getElementById("btn-admin-delete-product");
      if (deleteProdBtn) {
        deleteProdBtn.addEventListener("click", (e) => {
          const prodId = e.currentTarget.dataset.prodId;
          if (confirm("¿Está seguro de que desea eliminar permanentemente este sabor del catálogo comercial?")) {
            let products = this.app.getProducts();
            products = products.filter(p => p.id !== prodId);
            this.app.saveProducts(products);
            this.selectedProductId = null;
            this.render();
          }
        });
      }
    }

    /* ====================================
       TAB EVENTS: CLIENT RECORDS
       ==================================== */
    if (this.activeTab === "clients") {
      // Client row click
      document.querySelectorAll(".admin-client-row").forEach(row => {
        row.addEventListener("click", (e) => {
          this.selectedClientCif = e.currentTarget.dataset.cif;
          this.render();
        });
      });

      // Regenerate Client Access Code (PIN)
      const regenPinBtn = document.getElementById("btn-admin-regenerate-client-pin");
      if (regenPinBtn) {
        regenPinBtn.addEventListener("click", (e) => {
          const cif = e.currentTarget.dataset.cif;
          const clients = this.app.getClients();
          const client = clients.find(c => c.cif === cif);
          if (client) {
            // Generate a random 4-digit PIN
            const newPin = Math.floor(1000 + Math.random() * 9000).toString();
            client.pin = newPin;
            this.app.saveClients(clients);
            alert(`¡Código PIN regenerado con éxito!\n\nNuevo PIN para ${client.name}:\n👉 ${newPin}`);
            this.render();
          }
        });
      }

      // Edit Client Form Submit
      const clientForm = document.getElementById("admin-client-edit-form");
      if (clientForm) {
        clientForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const cif = document.getElementById("edit-client-cif").value;
          const clients = this.app.getClients();
          const client = clients.find(c => c.cif === cif);

          if (client) {
            client.name = document.getElementById("edit-client-name").value;
            client.contact = document.getElementById("edit-client-contact").value;
            client.sector = document.getElementById("edit-client-sector").value;
            client.phone = document.getElementById("edit-client-phone").value;
            client.email = document.getElementById("edit-client-email").value;

            this.app.saveClients(clients);
            alert("Ficha de cliente comercial actualizada con éxito.");
            this.render();
          }
        });
      }

      // Delete/Baja Client Profile
      const deleteClientBtn = document.getElementById("btn-admin-delete-client");
      if (deleteClientBtn) {
        deleteClientBtn.addEventListener("click", (e) => {
          const cif = e.currentTarget.dataset.cif;
          if (confirm(`¿Dar de baja y eliminar permanentemente la ficha del cliente con CIF ${cif}?`)) {
            let clients = this.app.getClients();
            clients = clients.filter(c => c.cif !== cif);
            this.app.saveClients(clients);
            this.selectedClientCif = null;
            this.render();
          }
        });
      }

      // Add Client Button click
      const addClientBtn = document.getElementById("btn-admin-add-client");
      if (addClientBtn) {
        addClientBtn.addEventListener("click", () => {
          this.selectedClientCif = "new";
          this.render();
        });
      }

      // Cancel Client Creation click
      const cancelClientBtn = document.getElementById("btn-admin-cancel-client-creation");
      if (cancelClientBtn) {
        cancelClientBtn.addEventListener("click", () => {
          this.selectedClientCif = null;
          this.render();
        });
      }

      // Manual Client Create form submit
      const manualClientForm = document.getElementById("admin-manual-client-form");
      if (manualClientForm) {
        manualClientForm.addEventListener("submit", (e) => {
          e.preventDefault();

          const companyName = document.getElementById("reg-company-name").value.trim();
          const cif = document.getElementById("reg-cif").value.trim().toUpperCase();
          const contact = document.getElementById("reg-contact").value.trim();
          const phone = document.getElementById("reg-phone").value.trim();
          const email = document.getElementById("reg-email").value.trim();
          const sector = document.getElementById("reg-sector").value;
          const pin = document.getElementById("reg-pin").value.trim();

          const clients = this.app.getClients();
          const exists = clients.some(c => c.cif === cif);
          if (exists) {
            alert(`Error: Ya existe un establecimiento registrado con el CIF ${cif}.`);
            return;
          }

          const newClient = {
            name: companyName,
            cif: cif,
            contact: contact,
            phone: phone,
            email: email,
            sector: sector,
            pin: pin
          };

          clients.push(newClient);
          this.app.saveClients(clients);

          this.selectedClientCif = cif;
          alert("Establecimiento registrado con éxito y sincronizado con el servidor.");
          this.render();
        });
      }
    }
  }

  generateDemoOrders() {
    // Generate 3 beautiful B2B orders to show the dashboard immediately
    const today = new Date();
    const nextTuesday = new Date();
    nextTuesday.setDate(today.getDate() + ((2 + 7 - today.getDay()) % 7 || 7));
    const nextFriday = new Date();
    nextFriday.setDate(today.getDate() + ((5 + 7 - today.getDay()) % 7 || 7));

    const demoOrders = [
      {
        orderId: "CRQ-10483",
        date: new Date(today.getTime() - 2 * 3600000).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        user: {
          contact: "Chef Dani García",
          phone: "+34 952 865 312",
          email: "pedidos@grupodanigarcia.com"
        },
        delivery: {
          address: "Bulevar Príncipe Alfonso de Hohenlohe (Hotel Puente Romano)",
          city: "marbella",
          postal: "29602",
          dateStr: `Martes, ${nextTuesday.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
        },
        billing: {
          company: "Grupo Dani García Marbella S.L.",
          address: "Avenida de Ramón y Cajal, 4",
          cif: "B92847291"
        },
        payment: {
          method: "stripe",
          status: "paid",
          cardHolder: "Daniel García"
        },
        items: [
          { id: "jamon-iberico", name: "Jamón Ibérico de Bellota", price: 90.00, units: 150, quantity: 4 },
          { id: "manchego-semicurado", name: "Manchego Semicurado", price: 75.00, units: 150, quantity: 2 }
        ],
        subtotal: 510.00,
        vat: 51.00,
        total: 561.00,
        logisticsStatus: "picking"
      },
      {
        orderId: "CRQ-29402",
        date: new Date(today.getTime() - 5 * 3600000).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        user: {
          contact: "Chef José Andrés",
          phone: "+34 600 112 233",
          email: "compras@chiringuitoelpuerto.com"
        },
        delivery: {
          address: "Paseo Marítimo Estepona, Chiringuito 3",
          city: "estepona",
          postal: "29680",
          dateStr: `Viernes, ${nextFriday.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
        },
        billing: {
          company: "Restauración del Puerto Estepona S.A.",
          address: "Puerto Deportivo de Estepona, Local 22",
          cif: "A29384729"
        },
        payment: {
          method: "transfer",
          status: "pending",
          cardHolder: null
        },
        items: [
          { id: "jamon-serrano-gr", name: "Jamón Serrano Gran Reserva", price: 85.00, units: 150, quantity: 3 },
          { id: "chorizo-iberico", name: "Chorizo Ibérico de Bellota", price: 82.50, units: 150, quantity: 2 },
          { id: "manchego-serrano", name: "Manchego y Serrano", price: 78.00, units: 150, quantity: 2 }
        ],
        subtotal: 576.00,
        vat: 57.60,
        total: 633.60,
        logisticsStatus: "pending"
      },
      {
        orderId: "CRQ-95847",
        date: new Date(today.getTime() - 24 * 3600000).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        user: {
          contact: "Chef María Torres",
          phone: "+34 951 987 654",
          email: "m.torres@gastrobar-malaga.es"
        },
        delivery: {
          address: "Calle Larios, 12, Local 2",
          city: "malaga",
          postal: "29005",
          dateStr: `Martes, ${nextTuesday.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
        },
        billing: {
          company: "Torres Gastrobar Málaga S.L.",
          address: "Calle Larios, 12, Local 2",
          cif: "B93847529"
        },
        payment: {
          method: "stripe",
          status: "paid",
          cardHolder: "María Torres"
        },
        items: [
          { id: "jamon-iberico", name: "Jamón Ibérico de Bellota", price: 90.00, units: 150, quantity: 6 }
        ],
        subtotal: 540.00,
        vat: 54.00,
        total: 594.00,
        logisticsStatus: "transit"
      }
    ];

    // Combine with current orders (avoid duplicates)
    const currentOrders = this.getOrders();
    const existingIds = new Set(currentOrders.map(o => o.orderId));
    const toAdd = demoOrders.filter(o => !existingIds.has(o.orderId));
    
    this.saveOrders([...currentOrders, ...toAdd]);
  }
}
