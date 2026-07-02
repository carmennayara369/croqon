// Updated Main SPA Controller for Croqon Portal (Showcase, Catalog & Admin Dashboard)
import CartState from "./utils/CartState.js";
import Home from "./components/Home.js";
import B2bGateway from "./components/B2bGateway.js";
import Catalog from "./components/Catalog.js";
import Checkout from "./components/Checkout.js";
import OrderSuccess from "./components/OrderSuccess.js";
import AdminDashboard from "./components/AdminDashboard.js";

import { products as defaultProducts } from "./data/products.js";
import { translations } from "./data/translations.js";

class App {
  constructor() {
    this.user = this.loadUserSession();
    this.cart = new CartState();
    this.lastOrder = null;
    this.currentRoute = "home";
    this.lang = localStorage.getItem("croqon_lang") || "es";
    
    // Seed databases
    this.getProducts();
    this.getClients();
    
    // Components cache
    this.routes = {
      home: new Home(this),
      gateway: new B2bGateway(this),
      catalog: new Catalog(this),
      checkout: new Checkout(this),
      "order-success": new OrderSuccess(this),
      admin: new AdminDashboard(this)
    };
  }

  getProducts() {
    try {
      let stored = localStorage.getItem("croqon_b2b_products");
      if (!stored) {
        localStorage.setItem("croqon_b2b_products", JSON.stringify(defaultProducts));
        return defaultProducts;
      }
      const products = JSON.parse(stored);
      // Hotfix database migration: Set the new custom images as default for jamon-iberico & manchego-serrano
      let modified = false;
      const jamon = products.find(p => p.id === "jamon-iberico");
      if (jamon && jamon.imagePath !== "assets/images/product_jamon_iberico.jpg") {
        jamon.imagePath = "assets/images/product_jamon_iberico.jpg";
        jamon.imageType = "file";
        modified = true;
      }
      const manchegoSerrano = products.find(p => p.id === "manchego-serrano");
      if (manchegoSerrano && manchegoSerrano.imagePath !== "assets/images/product_manchego_serrano.jpg") {
        manchegoSerrano.imagePath = "assets/images/product_manchego_serrano.jpg";
        manchegoSerrano.imageType = "file";
        modified = true;
      }
      if (modified) {
        this.saveProducts(products); // Sync local & Plesk backend automatically!
      }
      return products;
    } catch (e) {
      console.error("Failed to load products from storage", e);
      return defaultProducts;
    }
  }

  async saveProducts(products) {
    try {
      localStorage.setItem("croqon_b2b_products", JSON.stringify(products));
      await fetch("api.php?action=save_products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(products)
      });
    } catch (e) {
      console.error("Failed to save products to storage", e);
    }
  }

  getClients() {
    try {
      let stored = localStorage.getItem("croqon_b2b_clients");
      if (!stored) {
        const defaultClients = [
          {
            name: "Restaurante La Marea Marbella S.L.",
            cif: "B93848201",
            contact: "Chef Carlos Martínez",
            phone: "+34 654 987 321",
            email: "compras@lamareamarbella.com",
            sector: "beach-club",
            pin: "1234"
          }
        ];
        localStorage.setItem("croqon_b2b_clients", JSON.stringify(defaultClients));
        return defaultClients;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to load clients from storage", e);
      return [];
    }
  }

  async saveClients(clients) {
    try {
      localStorage.setItem("croqon_b2b_clients", JSON.stringify(clients));
      await fetch("api.php?action=save_clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clients)
      });
    } catch (e) {
      console.error("Failed to save clients to storage", e);
    }
  }

  async syncWithServer() {
    try {
      // Fetch products
      const resProds = await fetch("api.php?action=get_products");
      if (resProds.ok) {
        const prods = await resProds.json();
        if (prods && prods.length > 0) {
          localStorage.setItem("croqon_b2b_products", JSON.stringify(prods));
        }
      }

      // Fetch clients
      const resClients = await fetch("api.php?action=get_clients");
      if (resClients.ok) {
        const clients = await resClients.json();
        if (clients && clients.length > 0) {
          localStorage.setItem("croqon_b2b_clients", JSON.stringify(clients));
        }
      }

      // Fetch orders
      const resOrders = await fetch("api.php?action=get_orders");
      if (resOrders.ok) {
        const orders = await resOrders.json();
        if (orders) {
          localStorage.setItem("croqon_b2b_orders", JSON.stringify(orders));
        }
      }
    } catch (e) {
      console.warn("Server database sync failed (using local offline cache):", e);
    }
  }

  t(key, defaultText = "") {
    if (this.lang === "es") return defaultText;
    if (translations[this.lang] && translations[this.lang][key] !== undefined) {
      return translations[this.lang][key];
    }
    return defaultText;
  }

  setLanguage(lang) {
    this.lang = lang;
    localStorage.setItem("croqon_lang", lang);
    this.updateLangButtons();
    
    // Re-render the header nav (since nav links are translated)
    this.updateHeaderContent();
    
    // Re-render the active route view to display translated content
    this.renderRoute();
  }

  updateLangButtons() {
    document.querySelectorAll(".lang-btn").forEach(btn => {
      if (btn.dataset.lang === this.lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  loadUserSession() {
    try {
      const stored = localStorage.getItem("croqon_b2b_user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to load session", e);
      return null;
    }
  }

  init() {
    // Listen for cart updates to refresh header badges
    window.addEventListener("croqon_cart_updated", () => {
      this.updateHeaderCartBadge();
    });

    // Check window hash route changes for direct admin load
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.substring(1);
      if (hash === "admin") {
        this.navigate("admin");
      } else if (hash === "home") {
        this.navigate("home");
      }
    });

    // Check routing on init
    const initRoute = async () => {
      await this.syncWithServer();
      const hash = window.location.hash.substring(1);
      if (hash === "admin") {
        this.navigate("admin");
      } else if (this.user) {
        this.navigate("catalog");
      } else {
        this.navigate("home");
      }
    };
    initRoute();

    // Initialize language switcher active states
    this.updateLangButtons();

    // Bind language switcher clicks
    document.querySelectorAll(".lang-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const selectedLang = e.currentTarget.dataset.lang;
        this.setLanguage(selectedLang);
      });
    });

    // Set initial header layout and badge
    this.updateHeaderContent();
    this.updateHeaderCartBadge();
    
    // Setup global window event handlers
    this.setupGlobalEvents();
  }

  async navigate(route) {
    // Pull fresh data from Plesk backend API before rendering
    await this.syncWithServer();

    if (route === "admin") {
      this.currentRoute = "admin";
      window.location.hash = "admin";
    } else {
      // Clear hash if moving away from admin
      if (window.location.hash === "#admin") {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
      
      // Route guard: force gateway or home if not logged in
      const isProRoute = ["catalog", "checkout", "order-success"].includes(route);
      
      if (!this.user && isProRoute) {
        this.currentRoute = "gateway";
      } else if (this.user && (route === "gateway" || route === "home")) {
        this.currentRoute = "catalog";
      } else {
        this.currentRoute = route;
      }
    }

    // Smooth scroll to top on navigation
    window.scrollTo({ top: 0, behavior: "smooth" });

    this.renderRoute();
  }

  renderRoute() {
    const component = this.routes[this.currentRoute];
    if (component) {
      // Dynamic header adjustments
      this.updateHeaderContent();
      
      // Update body view state
      const container = document.getElementById("main-container");
      if (container) {
        if (this.currentRoute === "gateway" || this.currentRoute === "home" || this.currentRoute === "admin") {
          container.classList.add("gateway-view-active");
        } else {
          container.classList.remove("gateway-view-active");
        }
      }

      // Render components
      component.render();
      
      // Update cart count immediately if in B2B catalog/checkout
      this.updateHeaderCartBadge();
    } else {
      console.error(`Route "${this.currentRoute}" not found.`);
      this.navigate("home");
    }
  }

  updateHeaderContent() {
    const navContent = document.getElementById("header-nav-content");
    const actionsContent = document.getElementById("header-actions-content");
    const header = document.querySelector(".app-header");
    
    if (!navContent || !actionsContent || !header) return;

    if (this.currentRoute === "admin" || this.currentRoute === "gateway") {
      header.classList.add("hide");
      return;
    } else {
      header.classList.remove("hide");
    }

    if (this.user) {
      // B2B Logged-In Mode
      navContent.innerHTML = `
        <span class="nav-b2b-badge">${this.t("nav_pro_channel", "Canal Profesional (HORECA)")}</span>
      `;
      actionsContent.innerHTML = `
        <div class="header-user-status">
          <span class="header-username">${this.user.name}</span>
        </div>
        <button id="header-cart-icon" class="cart-icon-btn" aria-label="Ver Resumen de Compra">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span id="header-cart-count" class="cart-badge">0</span>
        </button>
      `;

      // Re-attach cart click listener
      const cartIcon = document.getElementById("header-cart-icon");
      if (cartIcon) {
        cartIcon.addEventListener("click", () => {
          if (this.currentRoute === "catalog") {
            const sidebar = document.querySelector(".order-summary-sidebar");
            if (sidebar) sidebar.scrollIntoView({ behavior: "smooth" });
          } else {
            this.navigate("catalog");
          }
        });
      }
    } else {
      // Public Visitor Mode
      navContent.innerHTML = `
        <a href="#collection-target" class="nav-link" id="nav-link-collection">${this.t("nav_collection", "Nuestra Colección")}</a>
        <a href="#logistics-coverage" class="nav-link" id="nav-link-logistics">${this.t("nav_logistics", "Logística y Reparto")}</a>
      `;
      actionsContent.innerHTML = `
        <button class="btn-primary btn-small" id="nav-btn-gateway">${this.t("nav_pro_access", "Acceso Profesional")}</button>
      `;

      // Attach public clicks
      const gatewayBtn = document.getElementById("nav-btn-gateway");
      if (gatewayBtn) {
        gatewayBtn.addEventListener("click", () => this.navigate("gateway"));
      }

      // Smooth scrolling for public header links
      const colLink = document.getElementById("nav-link-collection");
      if (colLink) {
        colLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.scrollToElement("collection-target");
        });
      }

      const logLink = document.getElementById("nav-link-logistics");
      if (logLink) {
        logLink.addEventListener("click", (e) => {
          e.preventDefault();
          const target = document.querySelector(".logistics-coverage-section");
          if (target) target.scrollIntoView({ behavior: "smooth" });
        });
      }
    }
  }

  scrollToElement(id) {
    if (this.currentRoute !== "home") {
      this.navigate("home");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }

  updateHeaderCartBadge() {
    const badge = document.getElementById("header-cart-count");
    if (!badge) return;

    const totalBoxes = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalBoxes;
    
    // Animate badge
    if (totalBoxes > 0) {
      badge.classList.add("badge-active");
      badge.classList.add("pulse");
      setTimeout(() => badge.classList.remove("pulse"), 500);
    } else {
      badge.classList.remove("badge-active");
    }
  }

  setupGlobalEvents() {
    // Logo click redirects home or catalog
    const logoLink = document.getElementById("header-logo-link");
    if (logoLink) {
      logoLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.user) {
          this.navigate("catalog");
        } else {
          this.navigate("home");
        }
      });
    }
  }
}

// Instantiate and start app on load
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
  window.croqonApp = app;
});
