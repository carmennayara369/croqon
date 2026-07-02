// B2B Cart State Manager
export default class CartState {
  constructor() {
    this.items = this.loadFromStorage();
    this.vatRate = 0.10; // 10% standard Spanish B2B VAT for food items
  }

  loadFromStorage() {
    try {
      const stored = sessionStorage.getItem("croqon_b2b_cart");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load cart from storage", e);
      return [];
    }
  }

  saveToStorage() {
    try {
      sessionStorage.setItem("croqon_b2b_cart", JSON.stringify(this.items));
    } catch (e) {
      console.error("Failed to save cart to storage", e);
    }
  }

  addItem(product, quantity) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity = quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        units: product.units,
        weight: product.weight,
        imageClass: product.imageClass,
        quantity: quantity
      });
    }
    this.saveToStorage();
    this.dispatchUpdateEvent();
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveToStorage();
    this.dispatchUpdateEvent();
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getVAT() {
    return this.getSubtotal() * this.vatRate;
  }

  getTotal() {
    return this.getSubtotal() * (1 + this.vatRate);
  }

  clear() {
    this.items = [];
    this.saveToStorage();
    this.dispatchUpdateEvent();
  }

  dispatchUpdateEvent() {
    window.dispatchEvent(new CustomEvent("croqon_cart_updated", { detail: this.items }));
  }
}
