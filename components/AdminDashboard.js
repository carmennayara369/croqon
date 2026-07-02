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
          ${this.renderOrderDetailPanel(selectedOrder)}
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

        <div class="detail-actions-footer-row">
          <button class="btn-secondary" id="btn-admin-print-slip" data-id="${order.orderId}">
            <span>🖨️ Imprimir Albarán</span>
          </button>
          <button class="btn-text text-danger" id="btn-admin-delete-order" data-id="${order.orderId}" style="margin-left: auto;">
            <span>Eliminar Pedido</span>
          </button>
        </div>
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
                  <th>Categoría</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => `
                  <tr class="admin-product-row ${p.id === this.selectedProductId ? "selected" : ""}" data-prod-id="${p.id}">
                    <td><strong>${p.name}</strong><br><small style="color: #888;">${p.badge || "Gourmet"}</small></td>
                    <td><strong>${p.price.toFixed(2)} €</strong></td>
                    <td>${p.units} uds / ${p.weight}g</td>
                    <td><span class="status-badge" style="background: rgba(197, 168, 128, 0.1); color: #c5a880;">${p.flavorProfile.split(" / ")[0]}</span></td>
                  </tr>
                `).join("")}
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

          <div class="form-row">
            <div class="form-group">
              <label for="edit-prod-units">Unidades por Caja *</label>
              <input type="number" id="edit-prod-units" required value="${p.units}">
            </div>
            <div class="form-group">
              <label for="edit-prod-weight">Peso por Croqueta (g) *</label>
              <input type="number" id="edit-prod-weight" required value="${p.weight}">
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
            <div class="card-header-actions">
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
          ${this.renderClientEditPanel(selectedClient)}
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

      // Print delivery slip
      const printSlipBtn = document.getElementById("btn-admin-print-slip");
      if (printSlipBtn) {
        printSlipBtn.addEventListener("click", (e) => {
          const orderId = e.currentTarget.dataset.id;
          alert(`Preparando impresión de albarán para el reparto #${orderId}. Se llamará a la función de impresión de hoja de ruta.`);
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
            imagePath: imagePath
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
