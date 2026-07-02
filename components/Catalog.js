export default class Catalog {
  constructor(app) {
    this.app = app;
    this.containerId = "main-content";
    this.currentFilter = "todos";
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Filter products
    const dbProducts = this.app.getProducts();
    const filteredProducts = this.currentFilter === "todos" 
      ? dbProducts 
      : dbProducts.filter(p => p.flavorProfile.toLowerCase().includes(this.currentFilter) || (p.flavorProfile_en && p.flavorProfile_en.toLowerCase().includes(this.currentFilter)));

    container.innerHTML = `
      <div class="catalog-layout fade-in">
        <!-- B2B Header Info -->
        <header class="catalog-header">
          <div class="header-left">
            <h1 class="serif-title golden-text">${this.app.t("cat_title", "Gama de Croquetas Gourmet")}</h1>
            <p class="subtitle">${this.app.t("cat_desc", "Suministro directo para hostelería profesional en Costa del Sol")}</p>
          </div>
          <div class="header-right">
            <div class="client-badge">
              <svg class="icon-client" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
              <div class="client-details">
                <span class="company-label">${this.app.user.name}</span>
                <span class="cif-label">CIF: ${this.app.user.cif}</span>
              </div>
            </div>
            <button id="btn-logout" class="btn-text" title="${this.app.lang === "en" ? "Change business session" : "Cambiar Razón Social"}">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              <span>${this.app.t("nav_logout", "Salir")}</span>
            </button>
          </div>
        </header>

        <!-- Promises Bar -->
        <section class="promises-bar">
          <div class="promise-item">
            <svg class="promise-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18V9a6 6 0 0 1 12 0v9M3 18h18a1 1 0 0 1 1 1v2H2v-2a1 1 0 0 1 1-1zM12 3v3"/></svg>
            <div class="promise-text">
              <h4>${this.app.lang === "en" ? "For Demanding Chefs" : "Para Chefs Exigentes"}</h4>
              <p>${this.app.lang === "en" ? "Consistent quality in kitchen" : "Calidad consistente en cocina"}</p>
            </div>
          </div>
          <div class="promise-item">
            <svg class="promise-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><path d="M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/></svg>
            <div class="promise-text">
              <h4>${this.app.lang === "en" ? "Always Frozen (-18°C)" : "Siempre Congelado"}</h4>
              <p>${this.app.lang === "en" ? "Store at -18°C" : "Conservar a -18°C"}</p>
            </div>
          </div>
          <div class="promise-item">
            <svg class="promise-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <div class="promise-text">
              <h4>${this.app.lang === "en" ? "150 Units per Box" : "Cajas de 150 Uds"}</h4>
              <p>${this.app.lang === "en" ? "Pro 30g formats" : "Formatos pro de 30g/ud"}</p>
            </div>
          </div>
          <div class="promise-item">
            <svg class="promise-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v4M18 10h4l2 3v4a1 1 0 0 1-1 1h-3M14 18H8M14 18a2.5 2.5 0 1 1 5 0M8 18a2.5 2.5 0 1 1-5 0"/></svg>
            <div class="promise-text">
              <h4>${this.app.lang === "en" ? "Costa del Sol Delivery" : "Entrega Costa del Sol"}</h4>
              <p>${this.app.lang === "en" ? "Twice weekly (Tue. & Fri.)" : "2 veces por semana (Mar. y Vie.)"}</p>
            </div>
          </div>
        </section>

        <!-- Main Workspace -->
        <div class="catalog-grid">
          <!-- Catalog List (Left) -->
          <div class="products-section">
            <div class="filter-bar">
              <button class="filter-btn ${this.currentFilter === "todos" ? "active" : ""}" data-filter="todos">${this.app.t("cat_filter_all", "Toda la Colección")}</button>
              <button class="filter-btn ${this.currentFilter === "iberico" ? "active" : ""}" data-filter="iberico">${this.app.t("cat_filter_ham", "Gama Ibérica")}</button>
              <button class="filter-btn ${this.currentFilter === "cheese" ? "active" : ""}" data-filter="cheese">${this.app.t("cat_filter_cheese", "Gama Quesos")}</button>
              <button class="filter-btn" id="btn-view-sheet">${this.app.lang === "en" ? "View Ham Technical Sheet" : "Ver Ficha Técnica Jamón"}</button>
            </div>

            <div class="products-list">
              ${filteredProducts.map(p => this.renderProductCard(p)).join("")}
            </div>
          </div>

          <!-- Order & Summary Panel (Right) -->
          <aside class="order-summary-sidebar">
            <div class="sticky-sidebar">
              <h3 class="serif-title golden-text sidebar-title">${this.app.t("cat_summary_title", "Resumen de Pedido")}</h3>
              <div id="sidebar-cart-content">
                <!-- Cart items will be rendered here dynamically -->
                ${this.renderSidebarCart()}
              </div>
            </div>
          </aside>
        </div>

        <!-- Product Sheet Modal -->
        <div id="sheet-modal" class="modal hide">
          <div class="modal-content">
            <button class="close-modal">&times;</button>
            <div class="modal-body-scroll">
              <img src="assets/images/product_sheet_serrano.jpg" alt="Ficha Técnica Jamón Serrano Gran Reserva" class="full-sheet-img">
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderProductCard(product) {
    const cartItem = this.app.cart.items.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const name = this.app.lang === "en" && product.name_en ? product.name_en : product.name;
    const description = this.app.lang === "en" && product.description_en ? product.description_en : product.description;
    const flavorProfile = this.app.lang === "en" && product.flavorProfile_en ? product.flavorProfile_en : product.flavorProfile;
    const badge = this.app.lang === "en" && product.badge_en ? product.badge_en : product.badge;

    return `
      <div class="product-card" id="card-${product.id}">
        <div class="product-visual">
          <div class="product-crop ${product.imagePath ? "" : product.imageClass}" ${product.imagePath ? `style="background-image: url('${product.imagePath}'); background-size: cover; background-position: center;"` : ""}></div>
          <span class="product-badge">${badge}</span>
        </div>
        <div class="product-info">
          <div class="product-header">
            <h3 class="serif-title">${name}</h3>
            <span class="product-flavor">${flavorProfile}</span>
          </div>
          <p class="product-desc">${description}</p>
          
          <div class="product-specs">
            <span class="spec-tag">${this.app.lang === "en" ? `Box of ${product.units} units` : `Caja de ${product.units} unidades`}</span>
            <span class="spec-tag">${this.app.lang === "en" ? "Net weight: 4.5 kg (30g/unit)" : "Peso neto: 4,5 kg (30g/ud)"}</span>
          </div>

          <details class="product-details-dropdown">
            <summary>${this.app.lang === "en" ? "View ingredients and allergens" : "Ver ingredientes y alérgenos"}</summary>
            <div class="details-dropdown-content">
              <p><strong>${this.app.lang === "en" ? "Ingredients:" : "Ingredientes:"}</strong> ${product.ingredients}</p>
              <p><strong>${this.app.lang === "en" ? "Allergens:" : "Alérgenos:"}</strong> ${product.allergens.map(a => `<span class="allergen-tag">${a}</span>`).join(" ")}</p>
              <p><strong>${this.app.lang === "en" ? "Preparation: Fry directly frozen at 180°C for 3-4 minutes. Drain and serve." : "Preparación: Freír directamente congelado a 180°C durante 3-4 minutos. Escurrir y servir."}</strong></p>
            </div>
          </details>

          <div class="product-footer-row">
            <div class="product-price-block">
              <span class="price-label">${this.app.lang === "en" ? "Wholesale price (Excl. VAT)" : "Precio profesional (HT)"}</span>
              <span class="price-value">${product.price.toFixed(2)} € <small>${this.app.lang === "en" ? "/box" : "/caja"}</small></span>
            </div>
            
            <div class="quantity-selector-block">
              <div class="quantity-controller">
                <button class="qty-btn qty-minus" data-id="${product.id}">-</button>
                <input type="number" class="qty-input" data-id="${product.id}" value="${quantity}" min="0" max="99">
                <button class="qty-btn qty-plus" data-id="${product.id}">+</button>
              </div>
              <button class="btn-update-cart ${quantity > 0 ? "in-cart" : ""}" data-id="${product.id}">
                <span>${quantity > 0 ? this.app.t("cat_btn_update", "Actualizar") : this.app.t("cat_btn_add", "Añadir")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSidebarCart() {
    const cart = this.app.cart;
    if (cart.items.length === 0) {
      return `
        <div class="empty-cart-state">
          <svg viewBox="0 0 24 24" width="34" height="34" stroke="currentColor" stroke-width="1.5" fill="none" style="margin: 0 auto 15px; display: block; color: var(--color-gold);"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <p>${this.app.t("cat_summary_empty", "No ha añadido ninguna caja a su pedido.")}</p>
          <p class="hint">${this.app.lang === "en" ? "Modify quantities in the catalog to prepare your shipment." : "Modifique las cantidades en el listado para añadir productos."}</p>
        </div>
      `;
    }

    const subtotal = cart.getSubtotal();
    const vat = cart.getVAT();
    const total = cart.getTotal();

    return `
      <div class="sidebar-cart-list">
        ${cart.items.map(item => {
          const name = this.app.lang === "en" && item.name_en ? item.name_en : item.name;
          return `
            <div class="sidebar-cart-item">
              <div class="item-name-block">
                <span class="item-name">${name}</span>
                <span class="item-meta">${this.app.lang === "en" ? `Box of ${item.units} uds` : `Caja de ${item.units} uds`}</span>
              </div>
              <div class="item-quantity-price">
                <span class="item-qty">${item.quantity} x</span>
                <span class="item-price">${(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="sidebar-cart-totals">
        <div class="total-row">
          <span>${this.app.t("cat_summary_subtotal", "Base Imponible (HT)")}</span>
          <span>${subtotal.toFixed(2)} €</span>
        </div>
        <div class="total-row">
          <span>${this.app.t("cat_summary_vat", "IVA (10%)")}</span>
          <span>${vat.toFixed(2)} €</span>
        </div>
        <div class="total-row total-highlight">
          <span>${this.app.t("cat_summary_total", "Total Facturado (TTC)")}</span>
          <span class="golden-text">${total.toFixed(2)} €</span>
        </div>
        <div class="delivery-notice">
          ${this.app.lang === "en" ? "Free refrigerated logistics delivery (Málaga/Marbella)." : "Entrega logística refrigerada gratuita (Málaga/Marbella)."}
        </div>
      </div>

      <button id="btn-go-checkout" class="btn-primary btn-block">
        <span>${this.app.t("cat_summary_btn_checkout", "Proceder al Pedido")}</span>
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    `;
  }

  attachEvents() {
    // Logout button
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("croqon_b2b_user");
        this.app.user = null;
        this.app.cart.clear();
        this.app.navigate("gateway");
      });
    }

    // Filters
    const filterBtns = document.querySelectorAll(".filter-btn[data-filter]");
    filterBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.currentFilter = e.target.dataset.filter;
        this.render();
      });
    });

    // Ficha tecnica modal triggers
    const viewSheetBtn = document.getElementById("btn-view-sheet");
    const modal = document.getElementById("sheet-modal");
    if (viewSheetBtn && modal) {
      viewSheetBtn.addEventListener("click", () => {
        modal.classList.remove("hide");
      });
    }

    const closeModalBtn = document.querySelector(".close-modal");
    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener("click", () => {
        modal.classList.add("hide");
      });
      // Close on background click
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hide");
      });
    }

    // Quantity selectors minus/plus
    const qtyMinuses = document.querySelectorAll(".qty-minus");
    const qtyPluses = document.querySelectorAll(".qty-plus");
    const qtyInputs = document.querySelectorAll(".qty-input");
    const updateBtns = document.querySelectorAll(".btn-update-cart");

    qtyMinuses.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const input = document.querySelector(`.qty-input[data-id="${id}"]`);
        if (input) {
          let val = parseInt(input.value) || 0;
          if (val > 0) {
            input.value = val - 1;
            this.handleQuantityInputChanged(id, val - 1);
          }
        }
      });
    });

    qtyPluses.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const input = document.querySelector(`.qty-input[data-id="${id}"]`);
        if (input) {
          let val = parseInt(input.value) || 0;
          input.value = val + 1;
          this.handleQuantityInputChanged(id, val + 1);
        }
      });
    });

    qtyInputs.forEach(input => {
      input.addEventListener("change", (e) => {
        const id = e.target.dataset.id;
        let val = parseInt(e.target.value) || 0;
        if (val < 0) val = 0;
        e.target.value = val;
        this.handleQuantityInputChanged(id, val);
      });
    });

    updateBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const input = document.querySelector(`.qty-input[data-id="${id}"]`);
        if (input) {
          const qty = parseInt(input.value) || 0;
          this.updateCartItem(id, qty);
        }
      });
    });

    // Proceed to checkout button
    const checkoutBtn = document.getElementById("btn-go-checkout");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        this.app.navigate("checkout");
      });
    }
  }

  handleQuantityInputChanged(id, value) {
    const btn = document.querySelector(`.btn-update-cart[data-id="${id}"]`);
    if (btn) {
      btn.classList.add("highlight-update");
    }
  }

  updateCartItem(id, qty) {
    const product = this.app.getProducts().find(p => p.id === id);
    if (!product) return;

    if (qty === 0) {
      this.app.cart.removeItem(id);
    } else {
      this.app.cart.addItem(product, qty);
    }

    // Refresh cart display
    this.render();
  }
}
