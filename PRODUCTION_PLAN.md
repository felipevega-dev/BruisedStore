# 🚀 Plan de Producción - BruisedStore

Este documento detalla la hoja de ruta para llevar la aplicación a un estado de producción robusto y profesional.

## 📅 Estado Actual
**Fecha:** Noviembre 2025
**Versión:** 1.0.0-beta
**Stack:** Next.js 16, Firebase 12, Tailwind 4

---

## 🔴 Prioridad Crítica (Bloqueantes para Producción)

Estas funcionalidades son esenciales para operar la tienda.

### 1. Checkout con Transferencia Bancaria
Actualmente, el checkout permite seleccionar "Transferencia" pero no muestra los datos ni permite subir el comprobante.

- [ ] **Mostrar Datos Bancarios:** En el checkout, mostrar la info configurada en `GeneralSettings` cuando se elige transferencia.
- [ ] **Subida de Comprobante:** Crear una vista post-compra (`/order-confirmation/[id]/upload`) para que el usuario suba la foto de la transferencia.
- [ ] **Validación Admin:** Permitir al admin ver el comprobante en el detalle de la orden y aprobar/rechazar.

### 2. Sistema de Emails Transaccionales
No hay confirmación por correo, lo cual genera desconfianza.

- [ ] **Infraestructura:** Configurar Firebase Cloud Functions + Resend (o SendGrid).
- [ ] **Emails Clave:**
    - Confirmación de Compra (con detalle de productos y total).
    - Instrucciones de Transferencia (si aplica).
    - Actualización de Estado (Enviado, Entregado).
- [ ] **Diseño:** Plantillas HTML limpias y profesionales con el branding de la tienda.

---

## 🟡 Prioridad Alta (Mejoras de UX y Operación)

Mejoras significativas para la experiencia del cliente y la gestión del administrador.

### 1. Integración WhatsApp en Admin
Facilitar la comunicación directa con clientes.

- [ ] **Botones Directos:** Agregar botón de WhatsApp en la tabla de órdenes (`/admin/orders-store`) y detalle.
- [ ] **Mensajes Pre-llenados:** "Hola [Nombre], te escribo por tu pedido #[Orden]..."

### 2. Panel de Analítica de Transferencias
Mejor control del flujo de caja manual.

- [ ] **Dashboard:** Ver órdenes pendientes de validación de pago.
- [ ] **Métricas:** Tiempo promedio de validación, tasa de conversión de transferencias.

---

## 🔵 Prioridad Media (Optimizaciones)

### 1. Tracking de Envíos
- [ ] **Campo de Tracking:** Agregar campo `trackingNumber` y `courier` a la orden.
- [ ] **Vista de Cliente:** Mostrar el número de seguimiento en el detalle de la orden y en el correo de "Enviado".

### 2. Notificaciones Push (Admin)
- [ ] **Alertas:** Notificar al admin (móvil/desktop) cuando entra una nueva orden o se sube un comprobante.

---

## 🧹 Mantenimiento y Limpieza

- [ ] **Logs:** Implementar limpieza automática de logs antiguos (> 6 meses).
- [ ] **Storage:** Reglas de ciclo de vida para borrar imágenes temporales o comprobantes rechazados antiguos.

---

## 📝 Notas de Implementación

### Datos Bancarios
Se obtienen de la colección `generalSettings` (doc `main`).

### Emails
Se recomienda usar **Resend** por su facilidad de uso y tier gratuito generoso.
Las Cloud Functions deben escuchar triggers de Firestore (`onCreate` para órdenes, `onUpdate` para cambios de estado).

### Comprobantes
Almacenar en `payment-proofs/{orderId}/{filename}`.
Solo acceso de lectura para admins y el creador de la orden.
