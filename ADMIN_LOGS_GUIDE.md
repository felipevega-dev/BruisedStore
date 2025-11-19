# 📋 Sistema de Logs de Actividad de Administradores

## 📌 ¿Qué es?

Un sistema de auditoría que registra **todas las acciones importantes** realizadas por administradores en el panel de administración. Esto permite:

- ✅ Rastrear quién hizo qué y cuándo
- ✅ Auditar cambios en pedidos, productos y configuración
- ✅ Identificar problemas o errores
- ✅ Cumplir con requisitos de auditoría

---

## 🎯 Acciones Registradas

### Pedidos
- `order_status_updated` - Cambio de estado de pedido normal
- `order_deleted` - Eliminación de pedido normal
- `custom_order_status_updated` - Cambio de estado de obra personalizada
- `custom_order_deleted` - Eliminación de obra personalizada

### Obras
- `painting_created` - Nueva obra agregada al catálogo
- `painting_updated` - Obra existente actualizada
- `painting_deleted` - Obra eliminada del catálogo

### Reseñas
- `review_approved` - Reseña aprobada para publicación
- `review_rejected` - Reseña rechazada
- `review_deleted` - Reseña eliminada

### Cupones
- `coupon_created` - Nuevo cupón creado
- `coupon_updated` - Cupón existente actualizado
- `coupon_deleted` - Cupón eliminado

### Blog
- `blog_post_created` - Nuevo post creado
- `blog_post_updated` - Post existente actualizado
- `blog_post_deleted` - Post eliminado
- `blog_post_published` - Post publicado
- `blog_post_unpublished` - Post despublicado

### Configuración
- `home_settings_updated` - Configuración de la página principal actualizada
- `music_settings_updated` - Configuración de música actualizada
- `general_settings_updated` - Configuración general del sitio actualizada

---

## 🚀 Cómo Usar

### 1. Ver los Logs

Los logs se pueden visualizar en:

```
/admin/activity-logs
```

**Características:**
- Muestra las últimas 100 acciones
- Filtros por categoría (Pedidos, Obras, Reseñas, etc.)
- Filtros por administrador
- Información detallada de cada acción
- Timestamps relativos ("hace 2 horas")

### 2. Registrar Acciones Manualmente

Importa las utilidades de logs:

```typescript
import { AdminLogHelpers } from '@/lib/adminLogs';
import { useAuth } from '@/contexts/AuthContext';
```

Usa los helpers predefinidos:

```typescript
const { user } = useAuth();

// Ejemplo: Cambio de estado de pedido
await AdminLogHelpers.logOrderStatusChange(
  user.email!,
  user.uid,
  order.id,
  order.orderNumber,
  'pending',    // Estado anterior
  'confirmed'   // Estado nuevo
);

// Ejemplo: Obra creada
await AdminLogHelpers.logPaintingCreated(
  user.email!,
  user.uid,
  paintingId,
  'Título de la Obra'
);

// Ejemplo: Reseña aprobada
await AdminLogHelpers.logReviewApproved(
  user.email!,
  user.uid,
  reviewId,
  'Nombre del Cliente'
);
```

### 3. Registrar Acciones Personalizadas

Si necesitas registrar una acción no incluida en los helpers:

```typescript
import { logAdminAction } from '@/lib/adminLogs';

await logAdminAction(
  'painting_updated',  // Tipo de acción
  user.email!,         // Email del admin
  user.uid,            // UID del admin
  {                    // Metadata opcional
    paintingId: painting.id,
    paintingTitle: painting.title,
    description: 'Actualizado precio y disponibilidad',
  }
);
```

---

## 📦 Estructura de un Log

```typescript
interface AdminLog {
  id: string;
  action: AdminAction;           // Tipo de acción
  adminEmail: string;            // Email del admin que ejecutó la acción
  adminUid: string;              // UID del admin
  timestamp: Date;               // Cuándo ocurrió
  
  metadata?: {                   // Información adicional
    orderId?: string;
    orderNumber?: string;
    oldStatus?: string;
    newStatus?: string;
    paintingId?: string;
    paintingTitle?: string;
    reviewId?: string;
    reviewerName?: string;
    couponId?: string;
    couponCode?: string;
    postId?: string;
    postTitle?: string;
    postSlug?: string;
    description?: string;        // Descripción legible
  };
}
```

---

## 🔧 Dónde Agregar Logs

### En `app/admin/orders-store/page.tsx`

```typescript
// Al cambiar estado de pedido
const handleStatusUpdate = async (orderId: string, newStatus: string) => {
  const order = orders.find(o => o.id === orderId);
  const oldStatus = order?.status;

  // Actualizar en Firestore
  await updateDoc(doc(db, 'orders', orderId), { status: newStatus });

  // Registrar log
  await AdminLogHelpers.logOrderStatusChange(
    user.email!,
    user.uid,
    orderId,
    order.orderNumber,
    oldStatus,
    newStatus
  );
};
```

### En `app/admin/paintings/page.tsx`

```typescript
// Al crear obra
const handleCreatePainting = async (paintingData: Painting) => {
  const docRef = await addDoc(collection(db, 'paintings'), paintingData);

  // Registrar log
  await AdminLogHelpers.logPaintingCreated(
    user.email!,
    user.uid,
    docRef.id,
    paintingData.title
  );
};

// Al actualizar obra
const handleUpdatePainting = async (paintingId: string, updates: Partial<Painting>) => {
  await updateDoc(doc(db, 'paintings', paintingId), updates);

  // Registrar log
  await AdminLogHelpers.logPaintingUpdated(
    user.email!,
    user.uid,
    paintingId,
    updates.title || 'Obra actualizada'
  );
};
```

### En `app/admin/reviews/page.tsx`

```typescript
// Al aprobar reseña
const handleApproveReview = async (reviewId: string, reviewerName: string) => {
  await updateDoc(doc(db, 'reviews', reviewId), { approved: true });

  // Registrar log
  await AdminLogHelpers.logReviewApproved(
    user.email!,
    user.uid,
    reviewId,
    reviewerName
  );
};
```

### En `app/admin/coupons/page.tsx`

```typescript
// Al crear cupón
const handleCreateCoupon = async (couponData: Coupon) => {
  const docRef = await addDoc(collection(db, 'coupons'), couponData);

  // Registrar log
  await AdminLogHelpers.logCouponCreated(
    user.email!,
    user.uid,
    docRef.id,
    couponData.code
  );
};
```

### En `app/admin/general-settings/page.tsx`

```typescript
// Al guardar configuración
const handleSaveSettings = async () => {
  await updateDoc(doc(db, 'generalSettings', 'main'), settings);

  // Registrar log
  await AdminLogHelpers.logGeneralSettingsUpdated(
    user.email!,
    user.uid
  );
};
```

---

## 🔒 Seguridad

### Reglas de Firestore

Los logs están protegidos con las siguientes reglas:

```javascript
match /adminLogs/{logId} {
  // Solo administradores pueden leer
  allow read: if isAdmin();

  // Solo administradores pueden crear
  allow create: if isAdmin();

  // NADIE puede actualizar o eliminar (inmutables)
  allow update, delete: if false;
}
```

**Importante:**
- Los logs son **inmutables** (no se pueden editar ni eliminar)
- Solo los administradores pueden leer y crear logs
- Esto garantiza la integridad de la auditoría

---

## 📊 Consultas Útiles

### Ver logs de un administrador específico

```typescript
const logsRef = collection(db, 'adminLogs');
const q = query(
  logsRef,
  where('adminEmail', '==', 'admin@example.com'),
  orderBy('timestamp', 'desc'),
  limit(50)
);
const snapshot = await getDocs(q);
```

### Ver logs de una categoría

```typescript
const orderLogs = query(
  collection(db, 'adminLogs'),
  where('action', 'in', [
    'order_status_updated',
    'order_deleted',
    'custom_order_status_updated'
  ]),
  orderBy('timestamp', 'desc')
);
```

### Ver logs de las últimas 24 horas

```typescript
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const recentLogs = query(
  collection(db, 'adminLogs'),
  where('timestamp', '>=', Timestamp.fromDate(yesterday)),
  orderBy('timestamp', 'desc')
);
```

---

## 📈 Métricas y Reportes

### Acciones por Administrador

```typescript
const logsSnapshot = await getDocs(collection(db, 'adminLogs'));
const actionsByAdmin: Record<string, number> = {};

logsSnapshot.forEach((doc) => {
  const data = doc.data();
  actionsByAdmin[data.adminEmail] = (actionsByAdmin[data.adminEmail] || 0) + 1;
});

console.log(actionsByAdmin);
// { "admin1@example.com": 45, "admin2@example.com": 23 }
```

### Acciones por Tipo

```typescript
const actionsByType: Record<string, number> = {};

logsSnapshot.forEach((doc) => {
  const data = doc.data();
  actionsByType[data.action] = (actionsByType[data.action] || 0) + 1;
});

console.log(actionsByType);
// { "order_status_updated": 120, "painting_created": 15, ... }
```

---

## 🛠️ Mantenimiento

### Limpieza de Logs Antiguos

Para mantener el rendimiento, considera limpiar logs antiguos periódicamente:

```typescript
// Eliminar logs de más de 6 meses (ejecutar manualmente o con Cloud Function)
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

const oldLogsQuery = query(
  collection(db, 'adminLogs'),
  where('timestamp', '<', Timestamp.fromDate(sixMonthsAgo))
);

const oldLogsSnapshot = await getDocs(oldLogsQuery);
const batch = writeBatch(db);

oldLogsSnapshot.forEach((doc) => {
  batch.delete(doc.ref);
});

await batch.commit();
console.log(`Eliminados ${oldLogsSnapshot.size} logs antiguos`);
```

### Exportar Logs a CSV

```typescript
import { Parser } from 'json2csv';

const logsSnapshot = await getDocs(collection(db, 'adminLogs'));
const logsData = logsSnapshot.docs.map(doc => ({
  ...doc.data(),
  id: doc.id,
  timestamp: doc.data().timestamp.toDate().toISOString(),
}));

const parser = new Parser();
const csv = parser.parse(logsData);

// Descargar CSV
const blob = new Blob([csv], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `admin-logs-${new Date().toISOString()}.csv`;
a.click();
```

---

## ❓ FAQ

### ¿Los logs afectan el rendimiento?

No. Los logs se escriben de forma asíncrona y no bloquean la operación principal. Si hay un error al registrar el log, la operación principal continuará normalmente.

### ¿Puedo editar o eliminar logs?

No. Los logs son inmutables por diseño para garantizar la integridad de la auditoría.

### ¿Cuánto espacio ocupan los logs?

Cada log ocupa aproximadamente 500 bytes. Con 1000 logs, usarías ~0.5 MB de Firestore.

### ¿Los logs se sincronizan en tiempo real?

Sí. La página `/admin/activity-logs` puede actualizarse para escuchar cambios en tiempo real usando `onSnapshot()` en lugar de `getDocs()`.

---

## 🚀 Próximos Pasos

1. **Agregar logs en todas las páginas del admin panel**
2. **Implementar notificaciones por email para acciones críticas**
3. **Crear dashboard de métricas y estadísticas**
4. **Exportar logs a Google Sheets automáticamente**
5. **Integrar con Firebase Analytics para insights avanzados**

---

**Última actualización**: Noviembre 2025
