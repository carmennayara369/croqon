// Invoice Component - Branded B2B Invoice Sheet
export default class Invoice {
  static renderHTML(order, lang = "es") {
    if (!order) return "";

    const isStripe = order.payment.method === "stripe";
    const isEn = lang === "en";

    const paymentStatus = isStripe 
      ? `<span class="status-badge paid">${isEn ? "PAID (Stripe)" : "PAGADO (Stripe)"}</span>` 
      : `<span class="status-badge pending">${isEn ? "PENDING (Transfer)" : "PENDIENTE (Transferencia)"}</span>`;

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
              <strong>Loo Invest Immo, S.L.</strong><br>
              CIF: B13721766<br>
              Calle Rododendro, 59<br>
              29639 Benalmádena, Málaga (España)<br>
              Email: logistica@croqon.com | Tel: +34 951 123 456
            </div>
          </div>
          <div class="invoice-title-block">
            <h2 class="serif-title golden-text">${isEn ? "B2B INVOICE" : "FACTURA B2B"}</h2>
            <div class="invoice-meta-grid">
              <span class="meta-label">${isEn ? "Invoice No:" : "Factura Nº:"}</span>
              <span class="meta-val"><strong>INV-${order.orderId.split("-")[1] || order.orderId}</strong></span>
              <span class="meta-label">${isEn ? "Issue Date:" : "Fecha Emisión:"}</span>
              <span class="meta-val">${order.date.split(" a las")[0]}</span>
              <span class="meta-label">${isEn ? "Status:" : "Estado:"}</span>
              <span class="meta-val">${paymentStatus}</span>
            </div>
          </div>
        </div>

        <hr class="gold-hr">

        <!-- Billing details -->
        <div class="invoice-billing-row">
          <div class="invoice-billing-col">
            <h4 class="invoice-col-title">${isEn ? "Billed to (B2B Client):" : "Facturado a (Cliente B2B):"}</h4>
            <div class="billing-client-info">
              <strong>${order.billing.company}</strong><br>
              CIF / NIF: ${order.billing.cif}<br>
              ${isEn ? "Address" : "Dirección"}: ${order.billing.address}<br>
              Email: ${order.user.email}<br>
              ${isEn ? "Phone" : "Teléfono"}: ${order.user.phone}
            </div>
          </div>
          <div class="invoice-billing-col">
            <h4 class="invoice-col-title">${isEn ? "Delivery Address & Date:" : "Dirección y Fecha de Suministro:"}</h4>
            <div class="shipping-client-info">
              <strong>${order.user.contact} (Chef / ${isEn ? "Buyer" : "Compras"})</strong><br>
              ${isEn ? "Establishment" : "Establecimiento"}: ${order.billing.company}<br>
              ${isEn ? "Destination" : "Destino"}: ${order.delivery.address}, ${order.delivery.postal} Marbella / Málaga<br>
              <strong>${isEn ? "Scheduled Delivery:" : "Entrega Programada:"}</strong> ${order.delivery.dateStr}
            </div>
          </div>
        </div>

        <!-- Invoice Line Items Table -->
        <table class="invoice-table">
          <thead>
            <tr>
              <th>${isEn ? "Gourmet Product Description" : "Descripción del Producto (Gourmet)"}</th>
              <th class="text-center">${isEn ? "Format / Units" : "Formato / Unidades"}</th>
              <th class="text-right">${isEn ? "Box Price (HT)" : "Precio Caja (HT)"}</th>
              <th class="text-center">${isEn ? "Qty" : "Cantidad"}</th>
              <th class="text-right">${isEn ? "Total Net (HT)" : "Total Neto (HT)"}</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => {
              const name = isEn && item.name_en ? item.name_en : item.name;
              return `
                <tr>
                  <td>
                    <strong>Croquetas de ${name}</strong><br>
                    <small>${isEn ? "Premium Range - Flash-frozen ready to fry (30g/unit)" : "Gama Premium - Producto Ultracongelado listo para freír (30g/ud)"}</small>
                  </td>
                  <td class="text-center">${isEn ? `Box of ${item.units} units` : `Caja de ${item.units} uds`} (4.5kg)</td>
                  <td class="text-right">${item.price.toFixed(2)} €</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${(item.price * item.quantity).toFixed(2)} €</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <!-- Summary Totals -->
        <div class="invoice-summary-row">
          <div class="invoice-payment-instructions">
            ${isStripe ? `
              <p><strong>${isEn ? "Payment Details:" : "Detalle de Pago:"}</strong> ${isEn ? `Payment processed and verified via secure Stripe gateway. Capture completed successfully to the credit card of ${order.payment.cardHolder}.` : `Pago procesado y verificado mediante pasarela de pago seguro Stripe. Cargo realizado con éxito a la tarjeta de crédito de ${order.payment.cardHolder}.`}</p>
            ` : `
              <p><strong>${isEn ? "Bank Transfer Details:" : "Detalles de Transferencia Bancaria:"}</strong><br>
              ${isEn ? "Please make the bank transfer using the following details:" : "Por favor, efectúe el pago a la cuenta del Banco Santander:"} <br>
              <strong>ES48 3058 0776 8127 2004 3134</strong><br>
              ${isEn ? "Reference:" : "Concepto:"} <strong>FACTURA INV-${order.orderId.split("-")[1] || order.orderId}</strong><br>
              ${isEn ? "Please send the bank transfer proof to logistica@croqon.com to release your cold-truck loading slot." : "Envíe el justificante de transferencia bancaria a logistica@croqon.com para programar la carga en el camión refrigerado."}</p>
            `}
            <p class="invoice-footer-terms">${isEn ? "Store at -18°C. Frozen product ready to fry. Do not refreeze. Preparation: Fry directly frozen at 180°C for 3-4 minutes." : "Conservar a -18°C. Producto congelado listo para freír. No recongelar tras la descongelación. Preparación: Freír en freidora a 180°C durante 3-4 minutos."}</p>
          </div>
          
          <div class="invoice-summary-table-wrap">
            <table class="invoice-totals-table">
              <tr>
                <td>${isEn ? "Base Imponible (HT)" : "Base Imponible (HT)"}</td>
                <td class="text-right">${order.subtotal.toFixed(2)} €</td>
              </tr>
              <tr>
                <td>${isEn ? "IVA (10%)" : "IVA Alimentario (10%)"}</td>
                <td class="text-right">${order.vat.toFixed(2)} €</td>
              </tr>
              <tr class="total-row-highlight">
                <td><strong>${isEn ? "Total Invoice (TTC)" : "Total Factura (TTC)"}</strong></td>
                <td class="text-right"><strong>${order.total.toFixed(2)} €</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <div class="invoice-footer-banner">
          <p>${isEn ? "THANK YOU FOR YOUR BUSINESS - CROQON PREMIUM CROQUETAS" : "GRACIAS POR SU CONFIANZA COMERCIAL - CROQON PREMIUM CROQUETAS"}</p>
        </div>
      </div>
    `;
  }
}
