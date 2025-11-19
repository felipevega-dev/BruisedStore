# 📧 Guía del Sistema de Emails - José Vega Art Gallery

## 📌 Estado Actual

**❌ NO IMPLEMENTADO** - El sistema de emails automáticos aún no está configurado.

Actualmente, los usuarios NO reciben correos electrónicos de:
- Confirmación de compra
- Cambios de estado del pedido
- Bienvenida al registrarse
- Verificación de email (Firebase maneja esto automáticamente)

---

## 🎯 ¿Cómo Implementar Emails Automáticos?

Hay **2 opciones** principales:

### Opción 1: Firebase Cloud Functions + SendGrid/Resend (RECOMENDADO)

#### Ventajas:
- ✅ Integración nativa con Firebase
- ✅ Se activa automáticamente con triggers de Firestore
- ✅ Escalable y confiable
- ✅ Logs completos en Firebase Console

#### Desventajas:
- ⚠️ Requiere plan Blaze de Firebase (pago por uso)
- ⚠️ Necesita configurar servicio de email (SendGrid/Resend)

#### Costo Estimado:
- **Firebase Functions**: $0-5/mes (para bajo volumen)
- **SendGrid Free Tier**: 100 emails/día gratis
- **Resend Free Tier**: 3,000 emails/mes gratis

---

### 📦 Implementación Paso a Paso (Firebase Functions + Resend)

#### 1. Instalar Dependencias

```bash
# Inicializar Firebase Functions
npm install -g firebase-tools
firebase init functions

# En la carpeta functions/
cd functions
npm install @sendgrid/mail resend
```

#### 2. Crear Variables de Entorno

```bash
# Configurar API key de Resend
firebase functions:config:set resend.key="re_WQ5seSjE_MybXrHuYPkBaUZPLBsTGtd3A"

# O para SendGrid
firebase functions:config:set sendgrid.key="SG.YOUR_API_KEY"
```

#### 3. Crear Función de Email

**`functions/src/index.ts`**:

```typescript
import * as functions from "firebase-functions";
import { Resend } from "resend";

const resend = new Resend(functions.config().resend.key);

// Email cuando se crea una orden
export const onOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    try {
      await resend.emails.send({
        from: "José Vega Art <noreply@josevega.art>",
        to: order.shippingInfo.email,
        subject: `Confirmación de Pedido #${order.orderNumber}`,
        html: `
          <h1>¡Gracias por tu compra!</h1>
          <p>Hemos recibido tu pedido <strong>${order.orderNumber}</strong></p>

          <h2>Resumen:</h2>
          <ul>
            ${order.items.map((item: any) =>
              `<li>${item.painting.title} - $${item.painting.price}</li>`
            ).join('')}
          </ul>

          <p><strong>Total: $${order.total.toLocaleString('es-CL')}</strong></p>

          ${order.paymentInfo.method === 'transferencia' ? `
            <h3>Datos para Transferencia:</h3>
            <p>Banco: ${process.env.BANK_NAME}</p>
            <p>Cuenta: ${process.env.BANK_ACCOUNT}</p>
            <p>RUT: ${process.env.BANK_RUT}</p>
          ` : ''}

          <a href="${process.env.NEXT_PUBLIC_URL}/order-confirmation/${orderId}?token=${order.publicAccessToken}">
            Ver Detalle del Pedido
          </a>
        `,
      });

      console.log(`Email sent to ${order.shippingInfo.email} for order ${orderId}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  });

// Email cuando cambia el estado del pedido
export const onOrderStatusUpdated = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // Solo enviar si cambió el estado
    if (before.status === after.status) return;

    const statusMessages: Record<string, string> = {
      confirmed: "Tu pedido ha sido confirmado y está en proceso",
      processing: "Estamos preparando tu pedido",
      shipped: "Tu pedido ha sido enviado",
      delivered: "Tu pedido ha sido entregado",
    };

    try {
      await resend.emails.send({
        from: "José Vega Art <noreply@josevega.art>",
        to: after.shippingInfo.email,
        subject: `Actualización de Pedido #${after.orderNumber}`,
        html: `
          <h1>Actualización de tu Pedido</h1>
          <p>${statusMessages[after.status] || 'Tu pedido ha sido actualizado'}</p>
          <p><strong>Estado actual:</strong> ${after.status}</p>

          <a href="${process.env.NEXT_PUBLIC_URL}/order-confirmation/${orderId}?token=${after.publicAccessToken}">
            Ver Detalle del Pedido
          </a>
        `,
      });
    } catch (error) {
      console.error("Error sending status update email:", error);
    }
  });
```

#### 4. Desplegar Functions

```bash
firebase deploy --only functions
```

---

## 📊 ¿Cómo Ver los Logs de Emails?

### 1. **Firebase Console Logs**

```bash
# Ver logs en tiempo real
firebase functions:log

# O en Firebase Console
https://console.firebase.google.com/project/bruisedartrash-f7384/functions/logs
```

### 2. **Resend Dashboard**

- Ir a: https://resend.com/emails
- Ver todos los emails enviados
- Estado: Enviado, Abierto, Rebotado, etc.
- Logs completos de cada email

### 3. **SendGrid Dashboard**

- Ir a: https://app.sendgrid.com/statistics
- Activity Feed muestra todos los eventos
- Filtrar por: Enviado, Entregado, Abierto, Clickeado, Rebotado

---

## 🎨 Plantillas de Email

### Opción A: HTML Inline (Simple)

```typescript
const emailHTML = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #5B7F2D;">¡Gracias por tu compra!</h1>
    <p>Tu pedido ha sido recibido.</p>
  </div>
`;
```

### Opción B: React Email (RECOMENDADO)

```bash
npm install @react-email/components
```

**`emails/OrderConfirmation.tsx`**:

```tsx
import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components';

export default function OrderConfirmation({ orderNumber, total, items, detailUrl }: any) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#F2F4E9', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Heading style={{ color: '#5B7F2D' }}>
            ¡Gracias por tu compra!
          </Heading>
          <Text>Pedido: <strong>{orderNumber}</strong></Text>

          {items.map((item: any) => (
            <div key={item.painting.id} style={{ marginBottom: '10px' }}>
              <Text>{item.painting.title} - ${item.painting.price.toLocaleString('es-CL')}</Text>
            </div>
          ))}

          <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
            Total: ${total.toLocaleString('es-CL')}
          </Text>

          <Button
            href={detailUrl}
            style={{
              backgroundColor: '#5B7F2D',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '5px',
              textDecoration: 'none',
            }}
          >
            Ver Detalle del Pedido
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## 🔧 Testing de Emails

### 1. **Local Testing**

```bash
# Instalar emulador de Functions
firebase emulators:start --only functions,firestore

# Crear orden de prueba y ver logs
```

### 2. **Mailtrap (Para Testing)**

- Servicio que captura emails sin enviarlos realmente
- Perfecto para desarrollo
- URL: https://mailtrap.io

```typescript
// Configuración para testing
const testConfig = {
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "your_mailtrap_user",
    pass: "your_mailtrap_pass"
  }
};
```

---

## ❓ Preguntas Frecuentes

### ¿Firebase maneja las plantillas de email?

**NO.** Firebase solo maneja:
- ✅ Email de verificación (automático)
- ✅ Email de recuperación de contraseña (automático)

Para emails personalizados (confirmación de compra, etc.), necesitas:
- Firebase Functions + SendGrid/Resend
- O un servicio de terceros como Mailgun, Postmark, etc.

### ¿Dónde puedo editar las plantillas?

**En el código de las Functions.**

Las plantillas NO se editan desde Firebase Console. Debes:
1. Modificar `functions/src/index.ts`
2. Redesplegar: `firebase deploy --only functions`

### ¿Cómo sé si llegó el email?

**3 formas:**

1. **Firebase Functions Logs**: Ver si se ejecutó la función
2. **Resend/SendGrid Dashboard**: Ver estado de entrega
3. **Testing**: Enviar email de prueba a ti mismo

---

## 📈 Logs de Actividad en Admin Panel

**Estado:** ❌ No implementado

Para implementar un sistema de logs de actividad del admin:

### Opción 1: Colección `adminLogs` en Firestore

```typescript
// Al actualizar una orden
await addDoc(collection(db, "adminLogs"), {
  action: "order_status_updated",
  orderId: order.id,
  oldStatus: "pending",
  newStatus: "confirmed",
  adminEmail: user.email,
  timestamp: serverTimestamp(),
});
```

### Opción 2: Firebase Analytics

- Eventos personalizados en Firebase Analytics
- Dashboard en Firebase Console
- Métricas en tiempo real

---

## 🚀 Resumen de Implementación

### Para empezar HOY:

1. **Crear cuenta en Resend** (gratis): https://resend.com
2. **Obtener API Key**
3. **Configurar Functions** con el código de arriba
4. **Deploy**: `firebase deploy --only functions`

### Tiempo estimado: **2-3 horas**

### Costo mensual: **$0-5** (con bajo volumen de emails)

---

## 📞 Soporte

Si necesitas ayuda:
1. Documentación de Resend: https://resend.com/docs
2. Documentación de Firebase Functions: https://firebase.google.com/docs/functions
3. React Email: https://react.email

---

**Última actualización**: Noviembre 2025
