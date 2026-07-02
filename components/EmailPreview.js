// Email Preview Component - Transactional B2B Email Simulation
export default class EmailPreview {
  static renderClientEmail(order, lang = "es") {
    if (!order) return "";

    const isStripe = order.payment.method === "stripe";
    const isEn = lang === "en";
    
    return `
      <div class="email-mock-wrapper">
        <div class="email-header-meta">
          <div class="email-meta-row"><strong>${isEn ? "From:" : "De:"}</strong> <span>pedidos@croqon.com (Croqon Logística B2B)</span></div>
          <div class="email-meta-row"><strong>${isEn ? "To:" : "Para:"}</strong> <span>${order.user.email} (${order.user.contact})</span></div>
          <div class="email-meta-row"><strong>${isEn ? "Subject:" : "Asunto:"}</strong> <span class="email-subject-highlight">${isEn ? `B2B Order Confirmation #${order.orderId} - Croqon Croquettes` : `Confirmación de Pedido B2B #${order.orderId} - Croqon Croquetas`}</span></div>
          <div class="email-meta-row"><strong>${isEn ? "Date:" : "Fecha:"}</strong> <span>${order.date}</span></div>
        </div>

        <div class="email-body-content">
          <!-- Email Brand Header -->
          <div style="background-color: #111111; padding: 25px 20px; text-align: center; border-radius: 4px 4px 0 0; border-bottom: 1px solid #c5a880;">
            <img src="assets/images/clean_logo.png" alt="Croqon" style="max-width: 160px; height: auto; display: inline-block; vertical-align: middle;">
            <div style="color: #c5a880; font-size: 8px; letter-spacing: 2.2px; font-weight: bold; margin-top: 3.5px; font-family: 'Poppins', sans-serif;">PREMIUM CROQUETAS</div>
          </div>

          <!-- Email Content Body -->
          <div style="background-color: #f9f6f0; color: #333333; padding: 30px; font-family: 'Inter', sans-serif; line-height: 1.6; border: 1px solid #eae3d2; border-radius: 0 0 4px 4px;">
            <h2 style="font-family: serif; color: #111; margin-top: 0; font-size: 22px;">${isEn ? `Dear ${order.user.contact},` : `Estimado/a ${order.user.contact},`}</h2>
            <p>${isEn ? "Thank you for choosing Croqon to supply your establishment. We confirm we have successfully received your B2B order of premium croquettes." : "Muchas gracias por confiar en Croqon para abastecer a su establecimiento. Confirmamos que hemos recibido con éxito su pedido comercial de croquetas premium."}</p>
            
            <div style="background-color: #ffffff; border-left: 4px solid #c5a880; padding: 15px; margin: 20px 0; border-radius: 2px;">
              <strong style="color: #111;">📅 ${isEn ? "Scheduled Delivery Information:" : "Información de Entrega Programada:"}</strong><br>
              ${isEn ? "Establishment" : "Establecimiento"}: <strong>${order.user.name}</strong><br>
              ${isEn ? "Shipping Address" : "Dirección de Suministro"}: <strong>${order.delivery.address}, ${order.delivery.postal} (${order.delivery.city.toUpperCase()})</strong><br>
              ${isEn ? "Delivery Date" : "Fecha Logística de Carga"}: <strong>${order.delivery.dateStr}</strong><br>
              ${isEn ? "Delivery Window" : "Franja de Entrega"}: <strong>08:00 - 14:00 (${isEn ? "Certified Refrigerated Transport" : "Transporte Refrigerado Certificado"})</strong>
            </div>

            <h3 style="font-family: serif; color: #111; border-bottom: 1px solid #eae3d2; padding-bottom: 8px; margin-top: 30px;">${isEn ? "Order Summary" : "Resumen del Pedido"}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #eae3d2;">
                  <th style="padding: 10px; text-align: left; font-size: 13px;">${isEn ? "Croquette Variety (Box 150 uds)" : "Gama de Croquetas (Box 150 uds)"}</th>
                  <th style="padding: 10px; text-align: center; font-size: 13px;">${isEn ? "Quantity" : "Cantidad"}</th>
                  <th style="padding: 10px; text-align: right; font-size: 13px;">${isEn ? "Price HT" : "Precio HT"}</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => {
                  const name = isEn && item.name_en ? item.name_en : item.name;
                  return `
                    <tr style="border-bottom: 1px solid #eae3d2;">
                      <td style="padding: 10px; font-size: 14px;"><strong>${name}</strong><br><span style="font-size: 12px; color: #666;">${isEn ? `Box of ${item.units} units` : `Caja de ${item.units} uds`} (4.5kg net)</span></td>
                      <td style="padding: 10px; text-align: center; font-size: 14px;">${item.quantity}</td>
                      <td style="padding: 10px; text-align: right; font-size: 14px;">${(item.price * item.quantity).toFixed(2)} €</td>
                    </tr>
                  `;
                }).join("")}
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right; font-size: 13px; color: #555;">${isEn ? "Base Imponible (HT)" : "Base Imponible (HT)"}:</td>
                  <td style="padding: 10px; text-align: right; font-size: 13px; color: #555;">${order.subtotal.toFixed(2)} €</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right; font-size: 13px; color: #555;">${isEn ? "VAT (10%)" : "IVA Alimentario (10%)"}:</td>
                  <td style="padding: 10px; text-align: right; font-size: 13px; color: #555;">${order.vat.toFixed(2)} €</td>
                </tr>
                <tr style="background-color: #eae3d2; font-weight: bold;">
                  <td colspan="2" style="padding: 10px; text-align: right; font-size: 14px; color: #111;">${isEn ? "Total (TTC)" : "Total Suministrado (TTC)"}:</td>
                  <td style="padding: 10px; text-align: right; font-size: 14px; color: #111;">${order.total.toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>

            <h3 style="font-family: serif; color: #111; margin-top: 30px;">${isEn ? "Payment Method" : "Forma de Pago"}</h3>
            <p>${isStripe ? `
              💳 <strong>${isEn ? "Credit Card via Stripe:" : "Tarjeta de Crédito via Stripe:"}</strong> ${isEn ? "The transaction has been successfully processed and verified via our Stripe gateway. A digital invoice is attached below." : "El pago se ha completado correctamente a través de nuestra pasarela cifrada de Stripe. Se adjunta el recibo digital de cobro comercial."}
            ` : `
              🏦 <strong>${isEn ? "Direct Bank Transfer:" : "Transferencia Bancaria Directa:"}</strong> ${isEn ? `Please notice that your refrigerated truck loading slot remains pending until we receive the transfer proof for <strong>${order.total.toFixed(2)} €</strong>.` : `Le recordamos que su pedido queda reservado pero no será cargado en el transporte refrigerado hasta que recibamos el justificante de la transferencia bancaria por valor de <strong>${order.total.toFixed(2)} €</strong>.`}<br>
              <strong>${isEn ? "Bank:" : "Banco:"}</strong> Banco Santander | <strong>IBAN:</strong> ES21 0049 1500 2312 3456 7890<br>
              <strong>${isEn ? "Reference:" : "Concepto:"}</strong> PEDIDO PRO #${order.orderId}
            `}</p>

            <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
              <a href="#view-invoice" style="background-color: #c5a880; color: #111111; text-decoration: none; padding: 12px 25px; font-weight: bold; font-family: serif; border-radius: 2px; border: 1px solid #111; display: inline-block;">${isEn ? "DOWNLOAD B2B INVOICE (PDF)" : "DESCARGAR FACTURA B2B (PDF)"}</a>
            </div>

            <hr style="border: 0; border-top: 1px solid #eae3d2; margin: 30px 0;">

            <p style="font-size: 12px; color: #777; text-align: center;">
              Croqon Premium Croquetas S.L. - Marbella - Costa del Sol<br>
              ${isEn ? "Need assistance? Contact us at orders@croqon.com or reply to this message." : "¿Tiene dudas logísticas? Contáctenos a pedidos@croqon.com o responda a este email."}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  static renderStoreEmail(order, lang = "es") {
    if (!order) return "";

    const isStripe = order.payment.method === "stripe";
    const isEn = lang === "en";
    
    return `
      <div class="email-mock-wrapper alert-email">
        <div class="email-header-meta">
          <div class="email-meta-row"><strong>${isEn ? "From:" : "De:"}</strong> <span>sistema-pedidos@croqon.com (Croqon CRM B2B)</span></div>
          <div class="email-meta-row"><strong>${isEn ? "To:" : "Para:"}</strong> <span>ventas@croqon.com, logistica@croqon.com</span></div>
          <div class="email-meta-row"><strong>${isEn ? "Subject:" : "Asunto:"}</strong> <span class="email-subject-highlight-store">${isEn ? `⚠️ NEW B2B ORDER RECEIVED - ${order.user.name} (${order.orderId})` : `⚠️ NUEVO PEDIDO B2B RECIBIDO - ${order.user.name} (${order.orderId})`}</span></div>
          <div class="email-meta-row"><strong>${isEn ? "Date:" : "Fecha:"}</strong> <span>${order.date}</span></div>
        </div>

        <div class="email-body-content">
          <div style="background-color: #d4af37; padding: 15px; color: #111111; font-weight: bold; text-align: center; border-radius: 4px 4px 0 0; font-family: sans-serif; letter-spacing: 1px;">
            ${isEn ? "NEW WHOLESALE TRANSACTION LOGGED (HORECA)" : "NUEVA VENTA MAYORISTA REGISTRADA (HOSTELERÍA)"}
          </div>

          <div style="background-color: #ffffff; color: #333333; padding: 30px; font-family: 'Inter', sans-serif; line-height: 1.6; border: 1px solid #ddd; border-radius: 0 0 4px 4px;">
            <p>${isEn ? "A new wholesale order has been submitted on the B2B portal. Billing, packing, and shipping logs are detailed below." : "Se ha recibido y registrado un nuevo pedido comercial en el portal B2B. A continuación se detallan los datos de facturación, carga y envío."}</p>

            <h3 style="color: #111; border-bottom: 2px solid #333; padding-bottom: 5px; margin-top: 25px;">${isEn ? "1. Client Profile details" : "1. Datos Comerciales del Cliente"}</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="width: 150px; padding: 5px 0; color: #666;">${isEn ? "Business Name:" : "Razón Social:"}</td>
                <td><strong>${order.user.name}</strong></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">CIF:</td>
                <td><strong>${order.user.cif}</strong></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">${isEn ? "Chef Contact:" : "Contacto Chef:"}</td>
                <td>${order.user.contact} (Tel: ${order.user.phone})</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">Email:</td>
                <td>${order.user.email}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">Sector:</td>
                <td>${order.user.sector.toUpperCase()}</td>
              </tr>
            </table>

            <h3 style="color: #111; border-bottom: 2px solid #333; padding-bottom: 5px; margin-top: 30px;">${isEn ? "2. Logistics Planning (Loading & Routes)" : "2. Planificación Logística (Carga y Rutas)"}</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="width: 150px; padding: 5px 0; color: #666;">${isEn ? "Logistics Date:" : "Fecha Logística:"}</td>
                <td><strong style="color: #e74c3c;">${order.delivery.dateStr}</strong></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">${isEn ? "Assigned Route:" : "Ruta Asignada:"}</td>
                <td><strong>Marbella / Málaga Sur (Ruta de Reparto Costa del Sol)</strong></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">${isEn ? "Delivery Address:" : "Dirección Destino:"}</td>
                <td>${order.delivery.address}, ${order.delivery.postal} (${order.delivery.city.toUpperCase()})</td>
              </tr>
            </table>

            <h3 style="color: #111; border-bottom: 2px solid #333; padding-bottom: 5px; margin-top: 30px;">${isEn ? "3. Loading Sheets (Boxes to Load in Truck)" : "3. Hojas de Carga (Mercancía a Cargar en Camión)"}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">${isEn ? "Flavor" : "Sabor Gourmet"}</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center; width: 100px;">${isEn ? "Boxes" : "Cajas"}</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center; width: 100px;">${isEn ? "Units" : "Unidades"}</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center; width: 100px;">${isEn ? "Total Weight" : "Peso Total"}</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => {
                  const name = isEn && item.name_en ? item.name_en : item.name;
                  return `
                    <tr>
                      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Croquetas de ${name}</strong></td>
                      <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #2c3e50;">${item.quantity}</td>
                      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity * item.units} uds</td>
                      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${(item.quantity * 4.5).toFixed(1)} kg</td>
                    </tr>
                  `;
                }).join("")}
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${isEn ? "Total Loading:" : "Carga Total Logística:"}</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #e74c3c;">
                    ${order.items.reduce((sum, item) => sum + item.quantity, 0)} ${isEn ? "boxes" : "cajas"}
                  </td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                    ${order.items.reduce((sum, item) => sum + (item.quantity * item.units), 0)} uds
                  </td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                    ${order.items.reduce((sum, item) => sum + (item.quantity * 4.5), 0).toFixed(1)} kg
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 style="color: #111; border-bottom: 2px solid #333; padding-bottom: 5px; margin-top: 30px;">${isEn ? "4. Settlement Log" : "4. Estado Financiero"}</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="width: 150px; padding: 5px 0; color: #666;">${isEn ? "Method:" : "Método Elegido:"}</td>
                <td><strong>${order.payment.method.toUpperCase()}</strong></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">${isEn ? "Amount:" : "Importe Total:"}</td>
                <td><strong>${order.total.toFixed(2)} € (${isEn ? "VAT Inc." : "IVA Inc."})</strong> [HT: ${order.subtotal.toFixed(2)} €]</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666;">${isEn ? "Payment Status:" : "Estado Cobro:"}</td>
                <td>
                  ${isStripe 
                    ? `<span style="background-color: #2ecc71; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold; font-size: 12px;">${isEn ? "PAID (Stripe Card API)" : "PAGADO via Stripe API"}</span>` 
                    : `<span style="background-color: #f1c40f; color: black; padding: 3px 8px; border-radius: 3px; font-weight: bold; font-size: 12px;">${isEn ? "PENDING BANK TRANSFER" : "PENDIENTE DE TRANSFERENCIA BANCARIA"}</span>`
                  }
                </td>
              </tr>
            </table>

            <div style="background-color: #fcf8e3; border: 1px solid #faebcc; padding: 15px; margin-top: 30px; border-radius: 4px; font-size: 13px;">
              ${isStripe 
                ? (isEn ? "✅ <strong>Staff instruction:</strong> Transaction settled. Print delivery slip and prepare boxes in the flash-frozen shipping bay." : "✅ <strong>Acción del personal:</strong> Transacción ya cobrada. Imprimir albarán de entrega y preparar cajas en el muelle de carga ultracongelada.") 
                : (isEn ? "⌛ <strong>Staff instruction:</strong> Hold shipping until administration confirms bank receipt in Santander account." : "⌛ <strong>Acción del personal:</strong> Retener carga hasta que Administración valide el abono del dinero en el banco Santander.")
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
