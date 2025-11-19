import * as admin from "firebase-admin";
import {setGlobalOptions} from "firebase-functions/v2";
import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {Resend} from "resend";
import {defineString} from "firebase-functions/params";

// Initialize Firebase Admin
admin.initializeApp();

// Define environment parameters
const resendApiKey = defineString("RESEND_API_KEY");
const siteUrl = defineString("SITE_URL", {
  default: "https://bruised-store.vercel.app",
});

// For cost control
setGlobalOptions({maxInstances: 10});

// Initialize Resend
let resend: Resend;

/**
 * Get or initialize Resend instance
 */
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(resendApiKey.value());
  }
  return resend;
}

/**
 * Send order confirmation email when a new order is created
 */
export const onOrderCreated = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    const order = event.data?.data();
    const orderId = event.params.orderId;

    if (!order) {
      logger.error("No order data found");
      return;
    }

    try {
      const itemsList = order.items
        .map(
          (item: any) =>
            `<li style="margin-bottom: 8px;">
            <strong>${item.painting.title}</strong> - $${item.painting.price.toLocaleString("es-CL")}
          </li>`
        )
        .join("");

      const bankTransferSection =
        order.paymentInfo.method === "transferencia"
          ? `
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #5B7F2D; margin-top: 0;">💳 Datos para Transferencia</h3>
            <p style="margin: 8px 0;"><strong>Banco:</strong> Banco de Chile</p>
            <p style="margin: 8px 0;"><strong>Tipo de Cuenta:</strong> Cuenta Corriente</p>
            <p style="margin: 8px 0;"><strong>Número de Cuenta:</strong> 123-45678-90</p>
            <p style="margin: 8px 0;"><strong>Titular:</strong> José Vega</p>
            <p style="margin: 8px 0;"><strong>RUT:</strong> 12.345.678-9</p>
            <p style="margin: 16px 0 8px 0;"><strong>📧 Importante:</strong> Una vez realizada la transferencia, 
            sube el comprobante en el siguiente enlace:</p>
          </div>
        `
          : "";

      await getResend().emails.send({
        from: "José Vega Art <noreply@bruisedart.com>",
        to: order.shippingInfo.email,
        subject: `✅ Confirmación de Pedido #${order.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #5B7F2D; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">¡Gracias por tu compra!</h1>
              </div>
              
              <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Hola <strong>${order.shippingInfo.fullName}</strong>,
                </p>
                
                <p>Hemos recibido tu pedido <strong>#${order.orderNumber}</strong> y está siendo procesado.</p>
                
                <h2 style="color: #5B7F2D; border-bottom: 2px solid #5B7F2D; padding-bottom: 10px;">📦 Resumen del Pedido</h2>
                
                <ul style="list-style: none; padding: 0;">
                  ${itemsList}
                </ul>
                
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 8px 0;"><strong>Subtotal:</strong> $${order.subtotal.toLocaleString("es-CL")}</p>
                  ${order.discount ? `<p style="margin: 8px 0; color: #059669;"><strong>Descuento:</strong> -$${order.discount.toLocaleString("es-CL")}</p>` : ""}
                  <p style="margin: 8px 0;"><strong>Envío:</strong> $${order.shippingCost.toLocaleString("es-CL")}</p>
                  <p style="margin: 8px 0; font-size: 20px; color: #5B7F2D;"><strong>Total:</strong> $${order.total.toLocaleString("es-CL")}</p>
                </div>
                
                ${bankTransferSection}
                
                <h3 style="color: #5B7F2D; margin-top: 30px;">📍 Dirección de Envío</h3>
                <p style="margin: 8px 0;">${order.shippingInfo.address}</p>
                <p style="margin: 8px 0;">${order.shippingInfo.city}, ${order.shippingInfo.region}</p>
                ${order.shippingInfo.postalCode ? `<p style="margin: 8px 0;">CP: ${order.shippingInfo.postalCode}</p>` : ""}
                
                <div style="text-align: center; margin-top: 40px;">
                  <a href="${siteUrl.value()}/order-confirmation/${orderId}?token=${order.publicAccessToken}" 
                     style="background-color: #5B7F2D; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                    Ver Detalle del Pedido
                  </a>
                </div>
                
                <p style="margin-top: 40px; color: #6b7280; font-size: 14px; text-align: center;">
                  Si tienes alguna pregunta, contáctanos respondiendo este email.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                <p>© ${new Date().getFullYear()} José Vega Art Gallery. Todos los derechos reservados.</p>
              </div>
            </body>
          </html>
        `,
      });

      logger.info(`Order confirmation email sent to ${order.shippingInfo.email} for order ${orderId}`);
    } catch (error) {
      logger.error("Error sending order confirmation email:", error);
    }
  }
);

/**
 * Send email when order status is updated
 */
export const onOrderStatusUpdated = onDocumentUpdated(
  "orders/{orderId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const orderId = event.params.orderId;

    if (!before || !after) {
      logger.error("No order data found");
      return;
    }

    // Only send email if status changed
    if (before.status === after.status) {
      return;
    }

    const statusMessages: Record<string, {title: string; message: string; icon: string}> = {
      confirmed: {
        title: "Pedido Confirmado",
        message: "Tu pedido ha sido confirmado y está siendo procesado. Te notificaremos cuando esté listo para envío.",
        icon: "✅",
      },
      processing: {
        title: "Preparando tu Pedido",
        message: "Estamos preparando tu pedido con mucho cuidado. Pronto estará listo para envío.",
        icon: "📦",
      },
      shipped: {
        title: "Pedido Enviado",
        message: "¡Tu pedido está en camino! Deberías recibirlo en los próximos días.",
        icon: "🚚",
      },
      delivered: {
        title: "Pedido Entregado",
        message: "Tu pedido ha sido entregado. ¡Esperamos que disfrutes tu nueva obra de arte!",
        icon: "🎉",
      },
      cancelled: {
        title: "Pedido Cancelado",
        message: "Tu pedido ha sido cancelado. Si tienes preguntas, contáctanos.",
        icon: "❌",
      },
    };

    const statusInfo = statusMessages[after.status] || {
      title: "Actualización de Pedido",
      message: "El estado de tu pedido ha sido actualizado.",
      icon: "📬",
    };

    try {
      await getResend().emails.send({
        from: "José Vega Art <noreply@bruisedart.com>",
        to: after.shippingInfo.email,
        subject: `${statusInfo.icon} ${statusInfo.title} - Pedido #${after.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #1F5BA5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px;">${statusInfo.icon}</h1>
                <h2 style="color: white; margin: 10px 0 0 0; font-size: 24px;">${statusInfo.title}</h2>
              </div>
              
              <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Hola <strong>${after.shippingInfo.fullName}</strong>,
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  ${statusInfo.message}
                </p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 8px 0;"><strong>Número de Pedido:</strong> ${after.orderNumber}</p>
                  <p style="margin: 8px 0;"><strong>Estado Actual:</strong> <span style="color: #5B7F2D; font-weight: bold;">${after.status}</span></p>
                  <p style="margin: 8px 0;"><strong>Total:</strong> $${after.total.toLocaleString("es-CL")}</p>
                </div>
                
                <div style="text-align: center; margin-top: 40px;">
                  <a href="${siteUrl.value()}/order-confirmation/${orderId}?token=${after.publicAccessToken}" 
                     style="background-color: #1F5BA5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                    Ver Detalle del Pedido
                  </a>
                </div>
                
                <p style="margin-top: 40px; color: #6b7280; font-size: 14px; text-align: center;">
                  Si tienes alguna pregunta, contáctanos respondiendo este email.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                <p>© ${new Date().getFullYear()} José Vega Art Gallery. Todos los derechos reservados.</p>
              </div>
            </body>
          </html>
        `,
      });

      logger.info(`Status update email sent to ${after.shippingInfo.email} for order ${orderId} (${before.status} → ${after.status})`);
    } catch (error) {
      logger.error("Error sending status update email:", error);
    }
  }
);

/**
 * Send confirmation email when a custom order is created
 */
export const onCustomOrderCreated = onDocumentCreated(
  "customOrders/{orderId}",
  async (event) => {
    const order = event.data?.data();
    const orderId = event.params.orderId;

    if (!order) {
      logger.error("No custom order data found");
      return;
    }

    try {
      await getResend().emails.send({
        from: "José Vega Art <noreply@bruisedart.com>",
        to: order.email,
        subject: "✅ Solicitud de Obra Personalizada Recibida",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #5B7F2D; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Solicitud Recibida</h1>
              </div>
              
              <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Hola <strong>${order.customerName}</strong>,
                </p>
                
                <p>¡Gracias por tu interés en una obra personalizada! Hemos recibido tu solicitud y la estamos revisando.</p>
                
                <h2 style="color: #5B7F2D; border-bottom: 2px solid #5B7F2D; padding-bottom: 10px;">🖼️ Detalles de tu Solicitud</h2>
                
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 8px 0;"><strong>Tamaño:</strong> ${order.selectedSize.name} (${order.selectedSize.width}x${order.selectedSize.height} cm)</p>
                  <p style="margin: 8px 0;"><strong>Orientación:</strong> ${order.orientation}</p>
                  <p style="margin: 8px 0;"><strong>Precio Estimado:</strong> $${order.totalPrice.toLocaleString("es-CL")}</p>
                </div>
                
                ${order.notes ? `
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>📝 Notas:</strong> ${order.notes}</p>
                </div>
                ` : ""}
                
                <p style="margin-top: 30px;">
                  Te contactaremos pronto para confirmar los detalles y comenzar a trabajar en tu obra.
                </p>
                
                <p style="margin-top: 40px; color: #6b7280; font-size: 14px; text-align: center;">
                  Si tienes alguna pregunta, contáctanos respondiendo este email o por WhatsApp.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                <p>© ${new Date().getFullYear()} José Vega Art Gallery. Todos los derechos reservados.</p>
              </div>
            </body>
          </html>
        `,
      });

      logger.info(`Custom order confirmation email sent to ${order.email} for order ${orderId}`);
    } catch (error) {
      logger.error("Error sending custom order confirmation email:", error);
    }
  }
);

/**
 * Send email when custom order status is updated
 */
export const onCustomOrderStatusUpdated = onDocumentUpdated(
  "customOrders/{orderId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) {
      logger.error("No custom order data found");
      return;
    }

    // Only send email if status changed
    if (before.status === after.status) {
      return;
    }

    const statusMessages: Record<string, {title: string; message: string; icon: string}> = {
      "in-progress": {
        title: "Obra en Proceso",
        message: "¡Buenas noticias! He comenzado a trabajar en tu obra personalizada. Te mantendré informado del progreso.",
        icon: "🎨",
      },
      completed: {
        title: "Obra Completada",
        message: "¡Tu obra personalizada está lista! Contáctame para coordinar la entrega.",
        icon: "✅",
      },
      cancelled: {
        title: "Solicitud Cancelada",
        message: "Tu solicitud de obra personalizada ha sido cancelada. Si tienes preguntas, contáctanos.",
        icon: "❌",
      },
    };

    const statusInfo = statusMessages[after.status] || {
      title: "Actualización de Solicitud",
      message: "El estado de tu solicitud ha sido actualizado.",
      icon: "📬",
    };

    try {
      await getResend().emails.send({
        from: "José Vega Art <noreply@bruisedart.com>",
        to: after.email,
        subject: `${statusInfo.icon} ${statusInfo.title} - Obra Personalizada`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #1F5BA5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px;">${statusInfo.icon}</h1>
                <h2 style="color: white; margin: 10px 0 0 0; font-size: 24px;">${statusInfo.title}</h2>
              </div>
              
              <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Hola <strong>${after.customerName}</strong>,
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  ${statusInfo.message}
                </p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 8px 0;"><strong>Tamaño:</strong> ${after.selectedSize.name}</p>
                  <p style="margin: 8px 0;"><strong>Estado Actual:</strong> <span style="color: #5B7F2D; font-weight: bold;">${after.status}</span></p>
                  <p style="margin: 8px 0;"><strong>Precio:</strong> $${after.totalPrice.toLocaleString("es-CL")}</p>
                </div>
                
                <p style="margin-top: 40px; color: #6b7280; font-size: 14px; text-align: center;">
                  Si tienes alguna pregunta, contáctanos respondiendo este email.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                <p>© ${new Date().getFullYear()} José Vega Art Gallery. Todos los derechos reservados.</p>
              </div>
            </body>
          </html>
        `,
      });

      logger.info(`Custom order status update email sent to ${after.email} (${before.status} → ${after.status})`);
    } catch (error) {
      logger.error("Error sending custom order status update email:", error);
    }
  }
);
