// Invoice Component - Branded B2B Invoice / Delivery Slip Sheet
export default class Invoice {
  static renderHTML(order, lang = "es") {
    if (!order) return "";

    const isStripe = order.payment.method === "stripe";
    const isEn = lang === "en";
    const isSample = order.isSample === true;

    let paymentStatus = "";
    if (isSample) {
      paymentStatus = `<span class="status-badge paid" style="background: rgba(197, 168, 128, 0.1); color: #c5a880; border: 1px solid #c5a880;">${isEn ? "FREE SAMPLE" : "MUESTRA GRATUITA"}</span>`;
    } else {
      paymentStatus = isStripe 
        ? `<span class="status-badge paid">${isEn ? "PAID (Stripe)" : "PAGADO (Stripe)"}</span>` 
        : `<span class="status-badge pending">${isEn ? "PENDING (Transfer)" : "PENDIENTE (Transferencia)"}</span>`;
    }

    const docTitle = isSample 
      ? (isEn ? "DELIVERY SLIP (SAMPLES)" : "ALBARÁN DE ENTREGA (MUESTRAS)")
      : (isEn ? "B2B INVOICE" : "FACTURA B2B");

    const numberLabel = isSample ? (isEn ? "Slip No:" : "Albarán Nº:") : (isEn ? "Invoice No:" : "Factura Nº:");
    const numberVal = isSample 
      ? `ALB-${order.orderId.split("-")[1] || order.orderId}`
      : `INV-${order.orderId.split("-")[1] || order.orderId}`;

    const qtyHeader = isSample ? (isEn ? "Qty (Pieces)" : "Cant. (Unidades)") : (isEn ? "Qty" : "Cantidad");
    const formatHeader = isSample ? (isEn ? "Format" : "Formato") : (isEn ? "Format / Units" : "Formato / Unidades");
    const priceHeader = isSample ? (isEn ? "Unit Price" : "Precio Unitario") : (isEn ? "Box Price (HT)" : "Precio Caja (HT)");
    const totalHeader = isSample ? (isEn ? "Total" : "Total") : (isEn ? "Total Net (HT)" : "Total Neto (HT)");

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
            <h2 class="serif-title golden-text">${docTitle}</h2>
            <div class="invoice-meta-grid">
              <span class="meta-label">${numberLabel}</span>
              <span class="meta-val"><strong>${numberVal}</strong></span>
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
            <h4 class="invoice-col-title">${isEn ? "Client Profile / Recipient:" : "Ficha de Cliente / Destinatario:"}</h4>
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
              <th class="text-center">${formatHeader}</th>
              <th class="text-right">${priceHeader}</th>
              <th class="text-center">${qtyHeader}</th>
              <th class="text-right">${totalHeader}</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => {
              const name = isEn && item.name_en ? item.name_en : item.name;
              const formatText = isSample 
                ? (isEn ? "Loose units (samples)" : "Unidades sueltas (muestras)")
                : (isEn ? `Box of ${item.units} units` : `Caja de ${item.units} uds`) + " (4.5kg)";
              const itemPrice = isSample ? 0.00 : item.price;
              const itemTotal = isSample ? 0.00 : (item.price * item.quantity);

              return `
                <tr>
                  <td>
                    <strong>Croquetas de ${name}</strong><br>
                    <small>${isEn ? "Premium Range - Flash-frozen ready to fry" : "Gama Premium - Producto Ultracongelado listo para freír"}</small>
                  </td>
                  <td class="text-center">${formatText}</td>
                  <td class="text-right">${itemPrice.toFixed(2)} €</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${itemTotal.toFixed(2)} €</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <!-- Summary Totals -->
        <div class="invoice-summary-row">
          <div class="invoice-payment-instructions">
            ${isSample ? `
              <p><strong>${isEn ? "Commercial Sample Details:" : "Detalle de Muestras Comerciales:"}</strong><br>
              ${isEn 
                ? "Free commercial samples sent for culinary evaluation and testing. Strictly not for resale. Value set at 0.00 € for customs/internal tracking." 
                : "Envío gratuito de muestras comerciales para degustación y evaluación en cocina. Prohibida su venta. Valor comercial 0.00 € para control de inventario."}</p>
            ` : isStripe ? `
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
                <td><strong>${isEn ? "Total (TTC)" : "Total (TTC)"}</strong></td>
                <td class="text-right"><strong>${order.total.toFixed(2)} €</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <div class="invoice-footer-banner">
          <p>${isSample 
            ? (isEn ? "FREE COMMERCIAL SAMPLES - LOO INVEST IMMO, S.L." : "MUESTRAS COMERCIALES GRATUITAS - LOO INVEST IMMO, S.L.")
            : (isEn ? "THANK YOU FOR YOUR BUSINESS - LOO INVEST IMMO, S.L." : "GRACIAS POR SU CONFIANZA COMERCIAL - LOO INVEST IMMO, S.L.")}</p>
        </div>
      </div>
    `;
  }
}
