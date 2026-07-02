// B2B Gateway - Professional Access & Registration Gateway
export default class B2bGateway {
  constructor(app) {
    this.app = app;
    this.containerId = "main-content";
    this.activeTab = "login"; // login, register
    this.registrationSuccessPin = null;
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="gateway-container fade-in">
        <div class="gateway-card">
          <!-- Back button to Public Vitrine -->
          <button id="btn-gateway-back-home" class="btn-gateway-back">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>${this.app.t("gateway_btn_back_vitrine", "Volver a la vitrina pública")}</span>
          </button>

          <div class="gateway-brand">
            <div class="gateway-logo-container">
              <img src="assets/images/clean_logo.png" alt="Croqon" class="gateway-logo">
              <span class="gateway-logo-subtitle">PREMIUM CROQUETAS</span>
            </div>
            <h2 class="serif-title golden-text" style="margin-top: 15px;">${this.app.t("nav_pro_access", "Acceso Profesional")}</h2>
            <p class="subtitle">${this.app.t("gateway_subtitle", "Canal exclusivo de suministro para hostelería de la Costa del Sol")}</p>
          </div>

          ${this.registrationSuccessPin ? this.renderRegistrationSuccess() : this.renderTabsAndForms()}

          <div id="gateway-loader" class="gateway-loader hide">
            <div class="spinner"></div>
            <h3 class="serif-title golden-text">${this.app.lang === "en" ? "Verifying Trade Credentials..." : "Verificando Datos Comerciales..."}</h3>
            <p>${this.app.lang === "en" ? "Connecting to the corporate registry and checking validity..." : "Conectando con el registro mercantil y comprobando validez..."}</p>
            <div class="loader-steps">
              <div class="step step-1 active">✓ ${this.app.lang === "en" ? "Secure connection established" : "Conexión establecida"}</div>
              <div class="step step-2">⚙ ${this.app.lang === "en" ? "Verifying credentials in database" : "Comprobando credenciales en base de datos"}</div>
              <div class="step step-3">⌛ ${this.app.lang === "en" ? "Creating secure professional session" : "Creando sesión profesional segura"}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderTabsAndForms() {
    return `
      <!-- Tab Toggles -->
      <div class="gateway-tabs-header">
        <button class="gateway-tab-btn ${this.activeTab === "login" ? "active" : ""}" data-tab="login">${this.app.t("gateway_tab_login", "Acceso con PIN")}</button>
        <button class="gateway-tab-btn ${this.activeTab === "register" ? "active" : ""}" data-tab="register">${this.app.t("gateway_tab_register", "Registrar Establecimiento")}</button>
      </div>

      <!-- Tab 1: LOGIN (Acceso con PIN) -->
      <div class="gateway-tab-pane ${this.activeTab === "login" ? "" : "hide"}">
        <form id="gateway-login-form" class="gateway-form">
          <div class="form-group">
            <label for="login-cif">${this.app.t("gateway_login_cif", "CIF / NIF del Establecimiento *")}</label>
            <input type="text" id="login-cif" required placeholder="Ej: B93848201">
          </div>
          <div class="form-group">
            <label for="login-pin">${this.app.t("gateway_login_pin", "Código PIN de Acceso *")}</label>
            <input type="password" id="login-pin" required placeholder="${this.app.lang === "en" ? "Enter your 4-digit PIN" : "Ingrese su PIN de 4 dígitos"}" pattern="^[0-9]{4}$" title="${this.app.lang === "en" ? "PIN must be 4 digits" : "El PIN debe consistir de 4 dígitos"}">
            <small class="form-hint">${this.app.t("gateway_login_hint", "Tip de prueba: Ingrese CIF <strong>B93848201</strong> y PIN <strong>1234</strong>")}</small>
          </div>
          
          <div id="login-error-msg" class="hide" style="color: var(--color-error); font-size: 13px; margin-bottom: 15px; text-align: center; font-weight: 500;">
            ${this.app.t("gateway_login_err", "❌ CIF o PIN incorrectos. Si no recuerda su PIN, contacte con Administración.")}
          </div>

          <button type="submit" class="btn-primary btn-block">
            <span>${this.app.t("gateway_btn_login", "Verificar e Ingresar")}</span>
            <svg class="icon-arrow" viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </form>
      </div>

      <!-- Tab 2: REGISTER (Registro) -->
      <div class="gateway-tab-pane ${this.activeTab === "register" ? "" : "hide"}">
        <form id="gateway-register-form" class="gateway-form">
          <div class="form-row">
            <div class="form-group">
              <label for="company-name">${this.app.t("gateway_reg_company", "Razón Social *")}</label>
              <input type="text" id="company-name" required placeholder="Ej: Restaurante Miramar S.L." autocomplete="organization">
            </div>
            <div class="form-group">
              <label for="cif-nif">${this.app.t("gateway_reg_cif", "CIF / NIF / SIRET *")}</label>
              <input type="text" id="cif-nif" required placeholder="Ej: B98765432" pattern="^[a-zA-Z0-9-]{8,15}$" title="${this.app.lang === "en" ? "Please enter a valid CIF/NIF (8-15 characters)" : "Introduzca un CIF/NIF válido (8-15 caracteres)"}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="contact-name">${this.app.t("gateway_reg_contact", "Nombre del Comprador / Chef *")}</label>
              <input type="text" id="contact-name" required placeholder="Ej: Chef María Ortiz">
            </div>
            <div class="form-group">
              <label for="contact-phone">${this.app.t("gateway_reg_phone", "Teléfono de Contacto *")}</label>
              <input type="tel" id="contact-phone" required placeholder="Ej: +34 600 123 456" autocomplete="tel">
            </div>
          </div>

          <div class="form-group">
            <label for="contact-email">${this.app.t("gateway_reg_email", "Email Profesional *")}</label>
            <input type="email" id="contact-email" required placeholder="Ej: compras@miramarmarbella.com" autocomplete="email">
            <small class="form-hint">${this.app.t("gateway_reg_email_hint", "Las facturas y confirmaciones de entrega se enviarán a este correo.")}</small>
          </div>

          <div class="form-group">
            <label for="company-sector">${this.app.t("gateway_reg_sector", "Sector de Hostelería")}</label>
            <select id="company-sector">
              <option value="restaurante">${this.app.t("gateway_reg_sector_rest", "Restaurante / Gastrobar")}</option>
              <option value="hotel">${this.app.t("gateway_reg_sector_hotel", "Hotel / Catering")}</option>
              <option value="beach-club">${this.app.t("gateway_reg_sector_beach", "Beach Club / Chiringuito")}</option>
              <option value="distribuidor">${this.app.t("gateway_reg_sector_dist", "Distribuidor Gourmet")}</option>
            </select>
          </div>

          <div class="form-terms">
            <input type="checkbox" id="terms-agree" required checked>
            <label for="terms-agree">${this.app.t("gateway_reg_terms", "Declaro que actúo como profesional y acepto las condiciones de suministro comercial.")}</label>
          </div>

          <button type="submit" class="btn-primary btn-block">
            <span>${this.app.t("gateway_reg_btn", "Registrar y Obtener PIN")}</span>
            <svg class="icon-arrow" viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          
          <button type="button" class="btn-secondary btn-block" id="btn-demo-fill" style="margin-top: 12px;">
            <span>${this.app.t("gateway_btn_demo", "Rellenar con datos de prueba")}</span>
          </button>
        </form>
      </div>
    `;
  }

  renderRegistrationSuccess() {
    return `
      <div class="gateway-registration-success-card fade-in">
        <div style="background-color: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.2); padding: 25px; border-radius: 4px; text-align: center; margin-bottom: 25px;">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#2ecc71" stroke-width="2" style="margin-bottom: 15px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <h3 class="serif-title" style="color: #2ecc71; font-size: 20px; margin-bottom: 8px;">${this.app.t("gateway_success_title", "¡Establecimiento Registrado!")}</h3>
          <p style="font-size: 13px; color: var(--color-text-muted);">${this.app.t("gateway_success_desc", "Su cuenta B2B ha sido configurada. Guarde su código de acceso rápido (PIN) para próximos pedidos:")}</p>
          
          <div style="background-color: #111; color: var(--color-gold); font-size: 36px; font-weight: 700; letter-spacing: 6px; padding: 15px; border-radius: 4px; margin: 20px 0; border: 1px dashed var(--color-gold);">
            ${this.registrationSuccessPin}
          </div>
          
          <p style="font-size: 11px; color: var(--color-gold-light);">${this.app.t("gateway_success_hint", "Este código PIN puede ser regenerado en cualquier momento por el Administrador si se pierde.")}</p>
        </div>

        <button id="btn-gateway-success-continue" class="btn-primary btn-block">
          <span>${this.app.t("gateway_success_btn", "Ingresar al Catálogo Pro")}</span>
        </button>
      </div>
    `;
  }

  attachEvents() {
    const loginForm = document.getElementById("gateway-login-form");
    const registerForm = document.getElementById("gateway-register-form");
    const demoBtn = document.getElementById("btn-demo-fill");
    const backBtn = document.getElementById("btn-gateway-back-home");
    const continueBtn = document.getElementById("btn-gateway-success-continue");

    // Tab buttons event listeners
    document.querySelectorAll(".gateway-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.activeTab = e.target.dataset.tab;
        this.render();
      });
    });

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLoginSubmit();
      });
    }

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleRegisterSubmit();
      });
    }

    if (demoBtn) {
      demoBtn.addEventListener("click", () => {
        // Generate random CIF to avoid duplicate alerts during tests
        const randomNum = Math.floor(10000000 + Math.random() * 89999999);
        document.getElementById("company-name").value = "Restaurante Miramar Costa S.L.";
        document.getElementById("cif-nif").value = "B" + randomNum;
        document.getElementById("contact-name").value = "Chef María Ortiz";
        document.getElementById("contact-phone").value = "+34 600 123 456";
        document.getElementById("contact-email").value = "compras@miramarcosta.com";
        document.getElementById("company-sector").value = "restaurante";
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.app.navigate("home");
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        this.registrationSuccessPin = null;
        this.app.navigate("catalog");
      });
    }
  }

  handleLoginSubmit() {
    const cifInput = document.getElementById("login-cif").value.trim().toUpperCase();
    const pinInput = document.getElementById("login-pin").value.trim();
    const errorMsg = document.getElementById("login-error-msg");
    const loginForm = document.getElementById("gateway-login-form");
    const loader = document.getElementById("gateway-loader");
    const backBtn = document.getElementById("btn-gateway-back-home");

    // Look up client
    const clients = this.app.getClients();
    const client = clients.find(c => c.cif.toUpperCase() === cifInput && c.pin === pinInput);

    if (client) {
      if (errorMsg) errorMsg.classList.add("hide");
      if (backBtn) backBtn.classList.add("hide");
      if (loginForm) loginForm.closest(".gateway-tab-pane").classList.add("hide");
      
      const tabHeader = document.querySelector(".gateway-tabs-header");
      if (tabHeader) tabHeader.classList.add("hide");

      if (loader) {
        loader.classList.remove("hide");
        const steps = loader.querySelectorAll(".loader-steps .step");
        
        setTimeout(() => {
          if (steps[1]) steps[1].classList.add("active");
        }, 500);

        setTimeout(() => {
          if (steps[2]) steps[2].classList.add("active");
        }, 1000);

        setTimeout(() => {
          // Log user in
          localStorage.setItem("croqon_b2b_user", JSON.stringify(client));
          this.app.user = client;
          this.app.navigate("catalog");
        }, 1500);
      }
    } else {
      if (errorMsg) errorMsg.classList.remove("hide");
    }
  }

  handleRegisterSubmit() {
    const registerForm = document.getElementById("gateway-register-form");
    const loader = document.getElementById("gateway-loader");
    const backBtn = document.getElementById("btn-gateway-back-home");

    if (!registerForm || !loader) return;

    if (backBtn) backBtn.classList.add("hide");
    registerForm.closest(".gateway-tab-pane").classList.add("hide");
    
    const tabHeader = document.querySelector(".gateway-tabs-header");
    if (tabHeader) tabHeader.classList.add("hide");
    
    loader.classList.remove("hide");
    const steps = loader.querySelectorAll(".loader-steps .step");

    setTimeout(() => {
      if (steps[1]) steps[1].classList.add("active");
    }, 500);

    setTimeout(() => {
      if (steps[2]) steps[2].classList.add("active");
    }, 1000);

    setTimeout(() => {
      // Gather form inputs
      const pin = Math.floor(1000 + Math.random() * 9000).toString(); // Generate random B2B PIN
      const company = {
        name: document.getElementById("company-name").value,
        cif: document.getElementById("cif-nif").value.toUpperCase(),
        contact: document.getElementById("contact-name").value,
        phone: document.getElementById("contact-phone").value,
        email: document.getElementById("contact-email").value,
        sector: document.getElementById("company-sector").value,
        pin: pin
      };

      // Append to local database of clients
      const clients = this.app.getClients();
      if (!clients.some(c => c.cif === company.cif)) {
        clients.push(company);
        this.app.saveClients(clients);
      }

      // Log user session in
      localStorage.setItem("croqon_b2b_user", JSON.stringify(company));
      this.app.user = company;

      // Swap loader out, render success passcode
      loader.classList.add("hide");
      this.registrationSuccessPin = pin;
      this.render();
    }, 1500);
  }
}
