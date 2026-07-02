// Invoice Component - Branded B2B Invoice Sheet
export default class Invoice {
  static renderHTML(order) {
    if (!order) return "";

    const isStripe = order.payment.method === "stripe";
    const paymentStatus = isStripe 
      ? '<span class="status-badge paid">PAGADO (Stripe)</span>' 
      : '<span class="status-badge pending">PENDIENTE (Transferencia)</span>';

    return `
      <div class="invoice-sheet" id="printable-invoice">
        <!-- Invoice Header -->
        <div class="invoice-header-row">
          <div class="invoice-company-logo">
            <div class="invoice-logo-container">
              <div class="invoice-logo-blackbox">
                <img src="assets/images/clean_logo.png" alt="Croqon" class="invoice-logo">
                <span class="invoice-logo-subtitle">PREMIUM CROQUETAS</span>
              </div>
            </div>
            <div class="invoice-company-details" style="margin-top: 10px;">
              <strong>CROQON PREMIUM CROQUETAS S.L.</strong><br>
              CIF: B29837482<br>
              Avenida Bulevar Príncipe de Marbella, 45<br>
              29602 Marbella, Málaga (España)<br>
              Email: logistica@croqon.com | Tel: +34 951 123 456
            </div>
          </div>
          <div class="invoice-title-block">
            <h2 class="serif-title golden-text">FACTURA B2B</h2>
            <div class="invoice-meta-grid">
              <span class="meta-label">Factura Nº:</span>
              <span class="meta-val"><strong>INV-${order.orderId.split("-")[1] || order.orderId}</strong></span>
              <span class="meta-label">Fecha Emisión:</span>
              <span class="meta-val">${order.date.split(" a las")[0]}</span>
              <span class="meta-label">Estado:</span>
              <span class="meta-val">${paymentStatus}</span>
            </div>
          </div>
        </div>

        <hr class="gold-hr">

        <!-- Billing details -->
        <div class="invoice-billing-row">
          <div class="invoice-billing-col">
            <h4 class="invoice-col-title">Facturado a (Cliente B2B):</h4>
            <div class="billing-client-info">
              <strong>${order.billing.company}</strong><br>
              CIF / NIF: ${order.billing.cif}<br>
              Dirección: ${order.billing.address}<br>
              Email: ${order.user.email}<br>
              Teléfono: ${order.user.phone}
            </div>
          </div>
          <div class="invoice-billing-col">
            <h4 class="invoice-col-title">Dirección y Fecha de Suministro:</h4>
            <div class="shipping-client-info">
              <strong>${order.user.contact} (Chef / Compras)</strong><br>
              Establecimiento: ${order.billing.company}<br>
              Destino: ${order.delivery.address}, ${order.delivery.postal} Marbella / Málaga<br>
              <strong>Entrega Programada:</strong> ${order.delivery.dateStr}
            </div>
          </div>
        </div>

        <!-- Invoice Line Items Table -->
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Descripción del Producto (Gourmet)</th>
              <th class="text-center">Formato / Unidades</th>
              <th class="text-right">Precio Caja (HT)</th>
              <th class="text-center">Cantidad</th>
              <th class="text-right">Total Neto (HT)</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>
                  <strong>Croquetas de ${item.name}</strong><br>
                  <small>Gama Premium - Producto Ultracongelado listo para freír (30g/ud)</small>
                </td>
                <td class="text-center">Caja de ${item.units} uds (4.5kg)</td>
                <td class="text-right">${item.price.toFixed(2)} €</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${(item.price * item.quantity).toFixed(2)} €</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <!-- Summary Totals -->
        <div class="invoice-summary-row">
          <div class="invoice-payment-instructions">
            ${isStripe ? `
              <p><strong>Detalle de Pago:</strong> Pago procesado y verificado mediante pasarela de pago seguro Stripe. Cargo realizado con éxito a la tarjeta de crédito de ${order.payment.cardHolder}.</p>
            ` : `
              <p><strong>Detalles de Transferencia Bancaria:</strong><br>
              Por favor, efectúe el pago a la cuenta del Banco Santander: <br>
              <strong>ES21 0049 1500 2312 3456 7890</strong><br>
              Concepto: <strong>FACTURA INV-${order.orderId.split("-")[1] || order.orderId}</strong><br>
              Envíe el justificante de transferencia bancaria a <strong>logistica@croqon.com</strong> para programar la carga en el camión refrigerado.</p>
            `}
            <p class="invoice-footer-terms">Conservar a -18°C. Producto congelado listo para freír. No recongelar tras la descongelación. Preparación: Freír en freidora a 180°C durante 3-4 minutos.</p>
          </div>
          
          <div class="invoice-summary-table-wrap">
            <table class="invoice-totals-table">
              <tr>
                <td>Base Imponible (HT)</td>
                <td class="text-right">${order.subtotal.toFixed(2)} €</td>
              </tr>
              <tr>
                <td>IVA Alimentario (10%)</td>
                <td class="text-right">${order.vat.toFixed(2)} €</td>
              </tr>
              <tr class="total-row-highlight">
                <td><strong>Total Factura (TTC)</strong></td>
                <td class="text-right"><strong>${order.total.toFixed(2)} €</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <div class="invoice-footer-banner">
          <p>GRACIAS POR SU CONFIANZA COMERCIAL - CROQON PREMIUM CROQUETAS</p>
        </div>
      </div>
    `;
  }
}
