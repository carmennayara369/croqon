// Checkout Component - Delivery Schedule, Billing Info & Stripe Mock
export default class Checkout {
  constructor(app) {
    this.app = app;
    this.containerId = "main-content";
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.app.cart.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state-checkout fade-in">
          <h2 class="serif-title golden-text">Su carrito está vacío</h2>
          <p>No puede proceder al checkout sin añadir cajas de croquetas a su pedido.</p>
          <button id="btn-back-catalog" class="btn-primary" style="margin-top: 20px;">
            <span>Volver al Catálogo</span>
          </button>
        </div>
      `;
      this.attachEmptyEvents();
      return;
    }

    const subtotal = this.app.cart.getSubtotal();
    const vat = this.app.cart.getVAT();
    const total = this.app.cart.getTotal();

    // Calculate delivery options (Tuesday and Friday)
    const nextDays = this.getNextDeliveryDays();

    container.innerHTML = `
      <div class="checkout-layout fade-in">
        <header class="checkout-header">
          <button id="btn-back-catalog-link" class="btn-back">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>Volver al catálogo</span>
          </button>
          <h1 class="serif-title golden-text">Finalizar Pedido Profesional</h1>
        </header>

        <div class="checkout-grid">
          <!-- Shipping and Payment Form (Left) -->
          <form id="checkout-form" class="checkout-form-container">
            <!-- Section 1: Delivery Schedule -->
            <section class="checkout-section">
              <h3 class="serif-title golden-text section-title">1. Dirección de Entrega y Programación</h3>
              
              <div class="form-row">
                <div class="form-group flex-2">
                  <label for="shipping-address">Dirección del Establecimiento *</label>
                  <input type="text" id="shipping-address" required placeholder="Ej: Avenida Bulevar Príncipe Alfonso de Hohenlohe, S/N">
                </div>
                <div class="form-group">
                  <label for="shipping-city">Localidad (Costa del Sol) *</label>
                  <select id="shipping-city" required>
                    <option value="marbella">Marbella</option>
                    <option value="malaga">Málaga Centro</option>
                    <option value="estepona">Estepona</option>
                    <option value="fuengirola">Fuengirola</option>
                    <option value="torremolinos">Torremolinos</option>
                    <option value="benalmadena">Benalmádena</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="shipping-postal">Código Postal *</label>
                  <input type="text" id="shipping-postal" required placeholder="Ej: 29602" pattern="^[0-9]{5}$" title="Introduzca un código postal válido de 5 dígitos">
                </div>
                <div class="form-group flex-2">
                  <label for="delivery-date">Fecha de Entrega Programada *</label>
                  <select id="delivery-date" required>
                    <option value="${nextDays[0].iso}">${nextDays[0].formatted} (Logística Martes)</option>
                    <option value="${nextDays[1].iso}">${nextDays[1].formatted} (Logística Viernes)</option>
                  </select>
                  <small class="form-hint">Entregas mediante transporte refrigerado certificado de 8:00 a 14:00.</small>
                </div>
              </div>
            </section>

            <!-- Section 2: Billing Info -->
            <section class="checkout-section">
              <div class="section-title-row">
                <h3 class="serif-title golden-text section-title">2. Datos de Facturación</h3>
                <div class="billing-same-wrap">
                  <input type="checkbox" id="billing-same" checked>
                  <label for="billing-same">Mismos datos de envío</label>
                </div>
              </div>

              <div id="billing-fields" class="hide">
                <div class="form-group">
                  <label for="billing-company">Nombre / Razón Social de Facturación *</label>
                  <input type="text" id="billing-company" placeholder="Ej: La Marea Marbella S.L.">
                </div>
                <div class="form-row">
                  <div class="form-group flex-2">
                    <label for="billing-address">Dirección de Facturación *</label>
                    <input type="text" id="billing-address" placeholder="Ej: Calle Principal 12, Local 4">
                  </div>
                  <div class="form-group">
                    <label for="billing-cif">CIF / NIF Facturación *</label>
                    <input type="text" id="billing-cif" placeholder="Ej: B93848201">
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 3: Payment Method -->
            <section class="checkout-section">
              <h3 class="serif-title golden-text section-title">3. Forma de Pago Seguro</h3>
              
              <div class="payment-selector">
                <label class="payment-option active">
                  <input type="radio" name="payment-method" value="stripe" checked>
                  <div class="payment-option-content">
                    <span class="payment-name">Tarjeta de Crédito (Stripe)</span>
                    <span class="payment-desc">Procesamiento inmediato, ideal para asegurar el cupo de entrega.</span>
                  </div>
                </label>
                <label class="payment-option">
                  <input type="radio" name="payment-method" value="transfer">
                  <div class="payment-option-content">
                    <span class="payment-name">Transferencia Bancaria Directa</span>
                    <span class="payment-desc">Se requiere el envío del justificante de pago antes de la carga logística.</span>
                  </div>
                </label>
              </div>

              <!-- Stripe Elements Card Mock -->
              <div id="stripe-card-wrapper" class="stripe-card-wrapper">
                <div class="stripe-elements-header">
                  <span>Información de la Tarjeta</span>
                  <div class="stripe-badges">
                    <span class="stripe-badge">Visa</span>
                    <span class="stripe-badge">Mastercard</span>
                    <span class="stripe-badge">Amex</span>
                  </div>
                </div>
                <div class="stripe-input-box">
                  <div class="card-number-wrapper">
                    <input type="text" id="card-number" required placeholder="4242 4242 4242 4242" maxlength="19">
                    <span class="card-brand-icon"></span>
                  </div>
                  <div class="card-expiry-cvc">
                    <input type="text" id="card-expiry" required placeholder="MM / AA" maxlength="7">
                    <input type="text" id="card-cvc" required placeholder="CVC" maxlength="4">
                  </div>
                </div>
                <div class="stripe-holder-input">
                  <input type="text" id="card-holder" required placeholder="Nombre del Titular de la Tarjeta">
                </div>
                <div class="stripe-security-notice">
                  Sus datos se encriptan mediante SSL y son procesados directamente por la infraestructura segura de Stripe.
                </div>
              </div>

              <!-- Bank Transfer Details (Hidden by default) -->
              <div id="bank-transfer-details" class="bank-transfer-details hide">
                <p>Realice la transferencia bancaria utilizando los siguientes detalles:</p>
                <div class="bank-info-box">
                  <div class="bank-row"><span>Banco:</span><strong>Banco Santander</strong></div>
                  <div class="bank-row"><span>Beneficiario:</span><strong>CROQON PREMIUM CROQUETAS S.L.</strong></div>
                  <div class="bank-row"><span>IBAN:</span><strong>ES21 0049 1500 2312 3456 7890</strong></div>
                  <div class="bank-row"><span>Concepto:</span><strong>PEDIDO PRO - <span id="mock-concept-id">...</span></strong></div>
                </div>
                <p class="warning-text">Importante: El pedido no será cargado en el transporte refrigerado hasta que recibamos el justificante bancario en logistica@croqon.com.</p>
              </div>
            </section>

            <button type="submit" class="btn-primary btn-block btn-large" id="btn-submit-order" style="margin-top: 30px;">
              <span>Confirmar Pedido y Pagar (${total.toFixed(2)} € TTC)</span>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <!-- Order Summary Sticky Panel (Right) -->
          <aside class="checkout-summary-sidebar">
            <div class="sticky-sidebar">
              <h3 class="serif-title golden-text sidebar-title">Resumen de Compra</h3>
              
              <div class="checkout-summary-items">
                ${this.app.cart.items.map(item => `
                  <div class="checkout-summary-item">
                    <span class="item-qty-name"><strong>${item.quantity}</strong> x ${item.name}</span>
                    <span class="item-total-price">${(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                `).join("")}
              </div>

              <div class="checkout-summary-totals">
                <div class="total-row">
                  <span>Base Imponible (HT)</span>
                  <span>${subtotal.toFixed(2)} €</span>
                </div>
                <div class="total-row">
                  <span>TVA / IVA (10%)</span>
                  <span>${vat.toFixed(2)} €</span>
                </div>
                <div class="total-row total-highlight">
                  <span>Total Neto (TTC)</span>
                  <span class="golden-text">${total.toFixed(2)} €</span>
                </div>
              </div>

              <div class="checkout-help-card">
                <h4>Asistencia Logística</h4>
                <p>¿Tiene alguna solicitud especial de entrega o dudas con su pedido B2B?</p>
                <p>Llámenos: <strong>+34 951 123 456</strong></p>
                <p>Email: <strong>pedidos@croqon.com</strong></p>
              </div>
            </div>
          </aside>
        </div>

        <!-- Payment Processing Overlay -->
        <div id="payment-overlay" class="modal hide">
          <div class="modal-content payment-processing-card">
            <div class="spinner"></div>
            <h3 class="serif-title golden-text" id="overlay-title">Procesando Transacción Comercial...</h3>
            <p id="overlay-desc">Conectando con los servidores seguros de Stripe para validar la operación...</p>
            <div class="payment-status-steps">
              <div class="p-step active" id="p-step-1">✓ Autorizando transacción comercial</div>
              <div class="p-step" id="p-step-2">⚙ Creando factura oficial B2B</div>
              <div class="p-step" id="p-step-3">⌛ Confirmando reserva de entrega refrigerada</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(total);
  }

  attachEmptyEvents() {
    const btn = document.getElementById("btn-back-catalog");
    if (btn) {
      btn.addEventListener("click", () => {
        this.app.navigate("catalog");
      });
    }
  }

  getNextDeliveryDays() {
    const days = [];
    const date = new Date();
    
    // Simple logic to find next Tuesday (day 2) and next Friday (day 5)
    for (let i = 1; i <= 14; i++) {
      const nextDate = new Date();
      nextDate.setDate(date.getDate() + i);
      const dayOfWeek = nextDate.getDay();
      
      if (dayOfWeek === 2) {
        days.push({
          iso: nextDate.toISOString().split("T")[0],
          formatted: `Martes, ${nextDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
        });
      } else if (dayOfWeek === 5) {
        days.push({
          iso: nextDate.toISOString().split("T")[0],
          formatted: `Viernes, ${nextDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
        });
      }

      if (days.length === 2) break;
    }

    return days;
  }

  attachEvents(total) {
    const btnBackLink = document.getElementById("btn-back-catalog-link");
    if (btnBackLink) {
      btnBackLink.addEventListener("click", () => {
        this.app.navigate("catalog");
      });
    }

    // Toggle billing fields depending on "billing same" checkbox
    const billingSameCheckbox = document.getElementById("billing-same");
    const billingFields = document.getElementById("billing-fields");
    if (billingSameCheckbox && billingFields) {
      billingSameCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          billingFields.classList.add("hide");
          this.toggleBillingFieldsRequired(false);
        } else {
          billingFields.classList.remove("hide");
          this.toggleBillingFieldsRequired(true);
          
          // Auto-fill with user company info to help
          document.getElementById("billing-company").value = this.app.user.name;
          document.getElementById("billing-address").value = document.getElementById("shipping-address").value;
          document.getElementById("billing-cif").value = this.app.user.cif;
        }
      });
    }

    // Toggle payment method display (Stripe vs Transfer)
    const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
    const stripeWrapper = document.getElementById("stripe-card-wrapper");
    const bankDetails = document.getElementById("bank-transfer-details");
    const submitBtnSpan = document.querySelector("#btn-submit-order span");

    // Generate random order ID concept
    const mockOrderId = "CRQ-" + Math.floor(100000 + Math.random() * 90000);
    const conceptSpan = document.getElementById("mock-concept-id");
    if (conceptSpan) conceptSpan.innerText = mockOrderId;

    paymentOptions.forEach(radio => {
      radio.addEventListener("change", (e) => {
        // Remove active class from labels
        document.querySelectorAll(".payment-option").forEach(label => label.classList.remove("active"));
        e.target.closest(".payment-option").classList.add("active");

        if (e.target.value === "stripe") {
          stripeWrapper.classList.remove("hide");
          bankDetails.classList.add("hide");
          this.toggleStripeFieldsRequired(true);
          if (submitBtnSpan) submitBtnSpan.innerText = `Confirmar Pedido y Pagar (${total.toFixed(2)} € TTC)`;
        } else {
          stripeWrapper.classList.add("hide");
          bankDetails.classList.remove("hide");
          this.toggleStripeFieldsRequired(false);
          if (submitBtnSpan) submitBtnSpan.innerText = `Reservar Pedido - Pago por Transferencia (${total.toFixed(2)} € TTC)`;
        }
      });
    });

    // Formatting Stripe card inputs
    const cardNumber = document.getElementById("card-number");
    if (cardNumber) {
      cardNumber.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        let matches = val.match(/\d{4,16}/g);
        let match = (matches && matches[0]) || "";
        let parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
          parts.push(match.substring(i, i + 4));
        }

        if (parts.length > 0) {
          e.target.value = parts.join(" ");
        } else {
          e.target.value = val;
        }

        // Change card icon based on number
        const icon = document.querySelector(".card-brand-icon");
        if (val.startsWith("4")) {
          icon.innerText = " Visa ";
        } else if (val.startsWith("5")) {
          icon.innerText = " Mastercard ";
        } else if (val.startsWith("3")) {
          icon.innerText = " Amex ";
        } else {
          icon.innerText = "";
        }
      });
    }

    const cardExpiry = document.getElementById("card-expiry");
    if (cardExpiry) {
      cardExpiry.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        if (val.length >= 2) {
          e.target.value = val.substring(0, 2) + " / " + val.substring(2, 4);
        } else {
          e.target.value = val;
        }
      });
    }

    const cardCvc = document.getElementById("card-cvc");
    if (cardCvc) {
      cardCvc.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/gi, "");
      });
    }

    // Submit handler
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.processOrder(mockOrderId);
      });
    }
  }

  toggleBillingFieldsRequired(isRequired) {
    const comp = document.getElementById("billing-company");
    const addr = document.getElementById("billing-address");
    const cif = document.getElementById("billing-cif");
    
    if (comp && addr && cif) {
      comp.required = isRequired;
      addr.required = isRequired;
      cif.required = isRequired;
    }
  }

  toggleStripeFieldsRequired(isRequired) {
    const num = document.getElementById("card-number");
    const exp = document.getElementById("card-expiry");
    const cvc = document.getElementById("card-cvc");
    const holder = document.getElementById("card-holder");

    if (num && exp && cvc && holder) {
      num.required = isRequired;
      exp.required = isRequired;
      cvc.required = isRequired;
      holder.required = isRequired;
    }
  }

  processOrder(orderId) {
    const overlay = document.getElementById("payment-overlay");
    if (!overlay) return;

    overlay.classList.remove("hide");

    // Animate B2B payment steps
    const step1 = document.getElementById("p-step-1");
    const step2 = document.getElementById("p-step-2");
    const step3 = document.getElementById("p-step-3");
    const title = document.getElementById("overlay-title");
    const desc = document.getElementById("overlay-desc");

    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

    if (paymentMethod === "transfer") {
      if (step1) {
        step1.innerText = "✓ Registro de pedido B2B reservado";
        step1.classList.add("active");
      }
      if (title) title.innerText = "Creando Reserva Logística...";
      if (desc) desc.innerText = "Preparando cuenta de transferencia y albarán de compra...";
    }

    // Step 2
    setTimeout(() => {
      if (step2) step2.classList.add("active");
      if (desc) desc.innerText = "Generando factura proforma en formato PDF...";
    }, 700);

    // Step 3
    setTimeout(() => {
      if (step3) step3.classList.add("active");
      if (desc) desc.innerText = "Asignando cupo de transporte refrigerado para Málaga - Costa del Sol...";
    }, 1400);

    // Success and routing
    setTimeout(() => {
      // Gather final order details
      const isBillingSame = document.getElementById("billing-same").checked;
      const deliveryDateSelect = document.getElementById("delivery-date");
      const deliveryDateStr = deliveryDateSelect.options[deliveryDateSelect.selectedIndex].text;
      
      const order = {
        orderId: orderId,
        date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        user: this.app.user,
        delivery: {
          address: document.getElementById("shipping-address").value,
          city: document.getElementById("shipping-city").value,
          postal: document.getElementById("shipping-postal").value,
          dateStr: deliveryDateStr,
        },
        billing: isBillingSame ? {
          company: this.app.user.name,
          address: document.getElementById("shipping-address").value,
          cif: this.app.user.cif
        } : {
          company: document.getElementById("billing-company").value,
          address: document.getElementById("billing-address").value,
          cif: document.getElementById("billing-cif").value
        },
        payment: {
          method: paymentMethod,
          cardHolder: paymentMethod === "stripe" ? document.getElementById("card-holder").value : null
        },
        items: [...this.app.cart.items],
        subtotal: this.app.cart.getSubtotal(),
        vat: this.app.cart.getVAT(),
        total: this.app.cart.getTotal()
      };
      // Save to application order history / session order
      this.app.lastOrder = order;

      // Save to B2B orders list database in localStorage
      try {
        const stored = localStorage.getItem("croqon_b2b_orders");
        const orders = stored ? JSON.parse(stored) : [];
        // Add default pending statuses for logistics
        order.logisticsStatus = "pending";
        order.payment.status = paymentMethod === "stripe" ? "paid" : "pending";
        orders.push(order);
        localStorage.setItem("croqon_b2b_orders", JSON.stringify(orders));
      } catch (e) {
        console.error("Failed to append order to local storage database", e);
      }
      
      // Clear cart
      this.app.cart.clear();

      // Navigate to order-success
      this.app.navigate("order-success");
    }, 2200);
  }
}
