# 🚀 Funcionalidades Pendientes - BruisedStore

**Fecha:** Noviembre 2025
**Status:** ✅ Base completada | 🔄 Features avanzadas pendientes

---

## ✅ Completado en Esta Sesión

### 1. Migración de Colores Completa
- ✅ 45+ archivos migrados a paleta verde/azul naturaleza
- ✅ Todos los componentes y páginas actualizados
- ✅ Tailwind v4 compliance (bg-linear-to-*)
- ✅ Configuración (manifest.json, layout.tsx, types/index.ts)

### 2. Sistema de Datos Bancarios
- ✅ Tipos actualizados (`PaymentInfo` con `transferProofUrl`)
- ✅ `GeneralSettings` con campos bancarios:
  - `bankName`, `bankAccountType`, `bankAccountNumber`
  - `bankAccountHolder`, `bankRut`, `bankEmail`
- ✅ Interfaz admin en `/admin/general-settings` para configurar datos
- ✅ Validación y persistencia en Firestore

### 3. Seguridad Mejorada
- ✅ `firestore.rules` actualizado con regla para `generalSettings`
- ✅ `storage.rules` con bucket `/payment-proofs/` para comprobantes
  - Máx 5MB por archivo
  - Solo imágenes
  - Lectura para admin o usuario autenticado
  - Creación pública controlada

---

## 🔄 Funcionalidades Pendientes (Requieren Implementación)

### 🟡 Priority 1: Checkout con Transferencia y Comprobante

#### A. Mostrar Datos Bancarios en Checkout
**Ubicación:** `app/checkout/page.tsx`
**Descripción:** Cuando el usuario selecciona "Transferencia", mostrar los datos bancarios configurados en General Settings.

**Implementación:**
```typescript
// En app/checkout/page.tsx
import { doc, getDoc } from 'firebase/firestore';
import { GeneralSettings } from '@/types';

// Fetch general settings
const [bankInfo, setBankInfo] = useState<GeneralSettings | null>(null);

useEffect(() => {
  const fetchBankInfo = async () => {
    const docRef = doc(db, 'generalSettings', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setBankInfo(docSnap.data() as GeneralSettings);
    }
  };
  fetchBankInfo();
}, []);

// En el JSX, cuando paymentMethod === 'transferencia':
{paymentMethod === 'transferencia' && bankInfo && (
  <div className="mt-4 rounded-lg border-2 border-azure-500 bg-azure-50 p-4">
    <h3 className="mb-3 text-lg font-bold text-azure-900">
      💳 Datos para Transferencia
    </h3>
    <div className="space-y-2 text-sm">
      <p><strong>Banco:</strong> {bankInfo.bankName}</p>
      <p><strong>Tipo:</strong> {bankInfo.bankAccountType}</p>
      <p><strong>Cuenta:</strong> {bankInfo.bankAccountNumber}</p>
      <p><strong>Titular:</strong> {bankInfo.bankAccountHolder}</p>
      <p><strong>RUT:</strong> {bankInfo.bankRut}</p>
    </div>
    <p className="mt-3 text-xs text-azure-700">
      ⚠️ Realiza la transferencia y luego sube tu comprobante en la siguiente pantalla
    </p>
  </div>
)}
```

#### B. Página de Upload de Comprobante
**Ubicación:** Nueva página `app/order-confirmation/[orderId]/upload-proof/page.tsx`
**Descripción:** Después de crear la orden, redirigir al usuario a una página donde puede subir el comprobante de transferencia.

**Implementación:**
1. Crear componente de upload con drag & drop
2. Subir imagen a Firebase Storage: `/payment-proofs/{orderId}/{filename}`
3. Actualizar orden en Firestore con `paymentInfo.transferProofUrl`
4. Notificar al admin vía email (si se implementa sistema de emails)

**Código base:**
```typescript
// app/order-confirmation/[orderId]/upload-proof/page.tsx
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

const handleUpload = async (file: File, orderId: string) => {
  try {
    // Upload a storage
    const storageRef = ref(storage, `payment-proofs/${orderId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Actualizar orden
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      'paymentInfo.transferProofUrl': downloadURL,
      'paymentInfo.transferProofUploadedAt': serverTimestamp(),
      'paymentInfo.status': 'pending', // Cambiar a pending hasta que admin confirme
    });

    showToast('Comprobante subido exitosamente', 'success');
  } catch (error) {
    showToast('Error al subir comprobante', 'error');
  }
};
```

---

### 🟡 Priority 2: Botones WhatsApp en Panel Admin

#### A. Botón WhatsApp Directo en Órdenes
**Ubicación:** `app/admin/orders-store/page.tsx` y `app/admin/orders/page.tsx`
**Descripción:** Añadir botón de WhatsApp para contactar directamente al cliente desde el panel.

**Implementación:**
```typescript
// Función helper para generar link de WhatsApp
const getWhatsAppLink = (phone: string, orderNumber: string, customerName: string) => {
  const cleanPhone = phone.replace(/\D/g, ''); // Remover todo excepto números
  const message = encodeURIComponent(
    `Hola ${customerName}, te contacto sobre tu pedido ${orderNumber}. ¿Cómo puedo ayudarte?`
  );
  return `https://wa.me/${cleanPhone}?text=${message}`;
};

// En cada fila de orden, añadir:
<a
  href={getWhatsAppLink(order.shippingInfo.phone, order.orderNumber, order.shippingInfo.fullName)}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700"
>
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    {/* WhatsApp icon path */}
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
  WhatsApp
</a>
```

#### B. Mostrar Comprobante de Pago en Admin
**Descripción:** Si el cliente subió comprobante, mostrarlo en la vista de detalle de la orden.

```typescript
{order.paymentInfo.transferProofUrl && (
  <div className="mt-4">
    <h4 className="mb-2 font-bold">Comprobante de Transferencia:</h4>
    <a
      href={order.paymentInfo.transferProofUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <img
        src={order.paymentInfo.transferProofUrl}
        alt="Comprobante"
        className="max-w-md rounded-lg border-2 border-azure-500"
      />
    </a>
    <p className="mt-2 text-xs text-gray-500">
      Subido el: {order.paymentInfo.transferProofUploadedAt?.toDate().toLocaleString('es-CL')}
    </p>
  </div>
)}
```

---

### 🟡 Priority 3: Sistema de Emails Automáticos

**⚠️ Requiere:** Firebase Cloud Functions + SendGrid/Resend

#### A. Setup Inicial
```bash
# Instalar Firebase Functions
npm install -g firebase-tools
firebase init functions

# Instalar dependencias en functions
cd functions
npm install @sendgrid/mail
# O usar Resend:
npm install resend
```

#### B. Function para Email de Confirmación de Orden
**Ubicación:** `functions/src/index.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';

admin.initializeApp();
sgMail.setApiKey(functions.config().sendgrid.key);

// Trigger cuando se crea una orden
export const sendOrderConfirmation = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    const msg = {
      to: order.shippingInfo.email,
      from: 'noreply@josevega.art', // Tu email verificado en SendGrid
      subject: `Orden Confirmada - ${order.orderNumber}`,
      html: `
        <h1>¡Gracias por tu compra, ${order.shippingInfo.fullName}!</h1>
        <p>Tu orden <strong>${order.orderNumber}</strong> ha sido recibida.</p>
        <h2>Detalles de tu pedido:</h2>
        <ul>
          ${order.items.map((item: any) => `
            <li>${item.painting.title} - ${item.quantity}x - $${item.painting.price.toLocaleString('es-CL')}</li>
          `).join('')}
        </ul>
        <p><strong>Total:</strong> $${order.total.toLocaleString('es-CL')}</p>

        ${order.paymentInfo.method === 'transferencia' ? `
          <h3>Datos para transferencia:</h3>
          <p>Banco: [DATOS DEL BANCO]</p>
          <p>No olvides subir tu comprobante en: [LINK]</p>
        ` : ''}

        <p>Puedes ver el estado de tu orden aquí: [LINK A ORDER-CONFIRMATION]</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email enviado a ${order.shippingInfo.email}`);
    } catch (error) {
      console.error('Error enviando email:', error);
    }
  });
```

#### C. Function para Cambios de Estado
```typescript
export const sendOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Solo enviar si el status cambió
    if (before.status !== after.status) {
      const statusMessages = {
        confirmed: '✅ Tu pedido ha sido confirmado',
        processing: '📦 Tu pedido está siendo preparado',
        shipped: '🚚 Tu pedido ha sido enviado',
        delivered: '🎉 Tu pedido ha sido entregado',
      };

      const msg = {
        to: after.shippingInfo.email,
        from: 'noreply@josevega.art',
        subject: `Actualización de Orden - ${after.orderNumber}`,
        html: `
          <h1>${statusMessages[after.status]}</h1>
          <p>Hola ${after.shippingInfo.fullName},</p>
          <p>Tu orden <strong>${after.orderNumber}</strong> ha sido actualizada.</p>
          <p><strong>Nuevo estado:</strong> ${after.status}</p>
          <p>Puedes ver los detalles completos aquí: [LINK]</p>
        `,
      };

      await sgMail.send(msg);
    }
  });
```

#### D. Deployment
```bash
# Configurar API key de SendGrid
firebase functions:config:set sendgrid.key="TU_API_KEY_AQUI"

# Deploy functions
firebase deploy --only functions
```

---

### 🔵 Priority 4: Mejoras Adicionales Recomendadas

#### A. Panel de Analítica de Transferencias
**Ubicación:** Nueva sección en `/admin/analytics`
**Descripción:**
- Mostrar órdenes pendientes de confirmación (con comprobante subido)
- Estadísticas de conversión por método de pago
- Tiempo promedio de confirmación de transferencias

#### B. Notificaciones Push para Admin
**Descripción:** Notificar al admin cuando:
- Se sube un comprobante de transferencia nuevo
- Se crea una orden nueva
- Una orden lleva más de 24h sin confirmar

**Implementación:** Usar Firebase Cloud Messaging (FCM)

#### C. Sistema de Tracking de Envío
**Descripción:**
- Añadir campo `trackingNumber` a Order
- Integrar con API de Correos de Chile / Chilexpress
- Permitir al cliente ver tracking en tiempo real

---

## 📋 Checklist de Implementación

### Fase 1: Checkout con Transferencia (2-3 horas)
- [ ] Fetch general settings en checkout
- [ ] Mostrar datos bancarios cuando método = transferencia
- [ ] Crear página upload-proof
- [ ] Implementar upload de comprobante a Storage
- [ ] Actualizar orden con URL del comprobante
- [ ] Redireccionar después de checkout

### Fase 2: Panel Admin Mejorado (1-2 horas)
- [ ] Añadir botón WhatsApp en orders-store
- [ ] Añadir botón WhatsApp en orders (custom)
- [ ] Mostrar comprobante de pago si existe
- [ ] Añadir filtro para ver solo órdenes con comprobante pendiente
- [ ] Badge visual para órdenes que necesitan revisión

### Fase 3: Sistema de Emails (3-4 horas)
- [ ] Setup Firebase Functions
- [ ] Configurar SendGrid o Resend
- [ ] Implementar function de confirmación de orden
- [ ] Implementar function de actualización de estado
- [ ] Implementar function para notificar comprobante subido
- [ ] Crear templates HTML profesionales
- [ ] Testing en desarrollo
- [ ] Deploy a producción

### Fase 4: Testing y Refinamiento (1-2 horas)
- [ ] Test flujo completo de transferencia
- [ ] Test emails en diferentes clientes
- [ ] Verificar security rules
- [ ] Optimizar performance
- [ ] Documentar proceso para futuro

---

## 🔧 Configuración Requerida

### SendGrid (Recomendado)
1. Crear cuenta en [SendGrid](https://sendgrid.com)
2. Verificar dominio (josevega.art)
3. Crear API Key
4. Configurar en Firebase Functions

### Firebase Functions
```bash
# En directorio functions
npm install firebase-functions firebase-admin @sendgrid/mail

# Configurar
firebase functions:config:set sendgrid.key="SG.xxxxx"
firebase functions:config:set app.domain="https://bruisedart.com"
```

### Variables de Entorno
Añadir a `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://bruisedart.com
SENDGRID_API_KEY=SG.xxxxx (solo para functions)
```

---

## 💰 Costos Estimados

### SendGrid
- **Free Tier:** 100 emails/día (suficiente para empezar)
- **Essentials:** $19.95/mes - 50,000 emails
- **Recomendación:** Empezar con Free

### Firebase Functions
- **Free Tier:** 2M invocaciones/mes
- **Costo real:** ~$0.40 por cada 1M invocaciones adicionales
- **Estimado:** < $5/mes con tráfico moderado

### Total: $0 - $25/mes (depende del volumen)

---

## 📚 Recursos Útiles

- [SendGrid Docs](https://docs.sendgrid.com/)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Resend (alternativa a SendGrid)](https://resend.com/)

---

## ✅ Próximos Pasos Inmediatos

1. **Ahora mismo:** Deploy de las reglas actualizadas
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

2. **En admin/general-settings:** Configurar datos bancarios

3. **Decidir:** ¿SendGrid o Resend para emails?

4. **Implementar:** Checkout con datos bancarios (Fase 1)

5. **Testing:** Flujo completo de transferencia

---

**Creado:** Noviembre 2025
**Última actualización:** Noviembre 2025
**Estado:** 🟡 Pendiente de implementación - Base completa
