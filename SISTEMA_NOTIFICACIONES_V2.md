# 🔔 Sistema de Notificaciones V2 - Guía Rápida

## Resumen del Sistema

El sistema de notificaciones ahora marca **individualmente cada orden** cuando el admin hace clic en ella, no cuando visita la página completa.

---

## 🎯 Características Principales

### 1. Badge "NUEVO" Visual
- **Color**: Amarillo brillante con animación de pulso
- **Ubicación**: Esquina superior derecha de cada tarjeta
- **Aparece cuando**: La orden es pendiente Y no ha sido vista
- **Desaparece cuando**: El admin hace clic en la orden

### 2. Contador Inteligente en Header
- Muestra solo órdenes pendientes **no vistas**
- Se actualiza automáticamente al hacer clic en órdenes
- Combina órdenes de compra + órdenes personalizadas
- Sincronización en tiempo real entre componentes

### 3. Almacenamiento Separado
```
localStorage:
├── viewedOrderIds          → ["order1", "order2", ...]
└── viewedCustomOrderIds    → ["custom1", "custom2", ...]
```

---

## 📊 Flujo de Trabajo

```
[Header muestra: 3 pendientes]
           ↓
[Admin entra a Orders Store]
           ↓
[Ve 2 órdenes con badge "NUEVO"]
[Ve 1 orden pendiente sin badge (ya vista antes)]
           ↓
[Hace clic en orden con badge]
           ↓
[✓ Badge desaparece]
[✓ Contador baja a 2]
[✓ Header se actualiza automáticamente]
```

---

## 🔧 Implementación Técnica

### Componentes Modificados

#### 1. `components/Header.tsx`
```typescript
// Obtiene IDs de órdenes vistas
const viewedOrderIds = JSON.parse(localStorage.getItem("viewedOrderIds"));

// Filtra solo no vistas
ordersCount = snapshot.docs.filter(doc => !viewedOrderIds.has(doc.id)).length;

// Escucha eventos de cambio
window.addEventListener("ordersViewed", updateCounts);
```

#### 2. `app/admin/orders-store/page.tsx`
```typescript
// Estado local
const [viewedOrderIds, setViewedOrderIds] = useState<Set<string>>(new Set());

// Verifica si es nueva
const isOrderNew = (order) => !viewedOrderIds.has(order.id) && order.status === "pending";

// Al hacer clic
onClick={() => {
  markOrderAsViewed(order.id);  // Marca como vista
  setPendingCount(prev => prev - 1);  // Actualiza contador local
}}

// Badge en UI
{isNew && (
  <span className="badge-nuevo">
    <Bell /> NUEVO
  </span>
)}
```

#### 3. `app/admin/orders/page.tsx`
- Misma estructura que orders-store
- Usa `viewedCustomOrderIds` en lugar de `viewedOrderIds`

---

## 🎨 Estilos del Badge

```tsx
<div className="absolute -right-2 -top-2 z-10 animate-pulse">
  <span className="inline-flex items-center gap-1 rounded-full border-2 border-yellow-400 bg-yellow-500 px-2 py-1 text-xs font-black text-black shadow-lg">
    <Bell className="h-3 w-3" />
    NUEVO
  </span>
</div>
```

**Propiedades CSS:**
- `absolute -right-2 -top-2`: Posición esquina superior derecha
- `z-10`: Por encima de la tarjeta
- `animate-pulse`: Animación de pulsación
- `rounded-full`: Bordes redondeados
- `border-2 border-yellow-400`: Borde amarillo
- `bg-yellow-500`: Fondo amarillo brillante
- `shadow-lg`: Sombra grande

---

## 🧪 Casos de Prueba

### Caso 1: Primera Visita
1. Admin inicia sesión
2. Header muestra "3 pendientes"
3. Todas las órdenes pendientes tienen badge "NUEVO"

### Caso 2: Orden Ya Vista
1. Admin hace clic en orden
2. Badge desaparece inmediatamente
3. Contador baja a 2
4. Si recarga la página, la orden sigue sin badge

### Caso 3: Nueva Orden Llega
1. Cliente crea una orden
2. Badge "NUEVO" aparece automáticamente
3. Contador incrementa en tiempo real
4. Admin no necesita recargar

### Caso 4: Múltiples Pestañas
1. Admin abre dos pestañas
2. En pestaña A hace clic en orden
3. Badge desaparece en pestaña A
4. Contador se actualiza en ambas pestañas

### Caso 5: Órdenes de Diferentes Tipos
1. 2 órdenes de compra pendientes
2. 1 orden personalizada pendiente
3. Header muestra "3 pendientes"
4. Cada tipo mantiene su propio tracking

---

## 🐛 Solución de Problemas

### Problema: Badge no desaparece
**Causa**: El ID de la orden no se está guardando
**Solución**: Verificar que `order.id` existe y es string

### Problema: Contador no se actualiza en Header
**Causa**: Evento `ordersViewed` no se dispara
**Solución**: Verificar `window.dispatchEvent(new Event("ordersViewed"))`

### Problema: Badge reaparece al recargar
**Causa**: localStorage se borró
**Solución**: Verificar que el navegador permite localStorage

### Problema: Conteo incorrecto
**Causa**: Mezcla de tipos de órdenes
**Solución**: Verificar que cada tipo usa su propia key en localStorage

---

## 📈 Mejoras Futuras Sugeridas

1. **Notificaciones Push**
   - Usar Web Push API
   - Notificar incluso cuando la app está cerrada

2. **Sonido de Notificación**
   - Reproducir sonido al llegar nueva orden
   - Opción para silenciar en configuración

3. **Filtros de Notificaciones**
   - Ver solo órdenes de compra nuevas
   - Ver solo órdenes personalizadas nuevas
   - Ver todas las pendientes

4. **Historial de Notificaciones**
   - Panel de "Notificaciones recientes"
   - Marcar todas como vistas
   - Restaurar orden como no vista

5. **Prioridad de Órdenes**
   - Badges de diferentes colores por urgencia
   - Ordenar por fecha de creación
   - Destacar órdenes antiguas sin atender

6. **Analytics**
   - Tiempo promedio de respuesta
   - Órdenes atendidas por día
   - Gráfico de nuevas vs atendidas

---

## 🔑 Variables Clave de localStorage

```typescript
// Órdenes de compra vistas
"viewedOrderIds": ["order123", "order456"]

// Órdenes personalizadas vistas  
"viewedCustomOrderIds": ["custom789", "custom012"]

// (Ya no se usa) Timestamps antiguos
"adminLastViewedOrders"
"adminLastViewedOrdersPage"
"adminLastViewedCustomOrdersPage"
```

---

## 📝 Checklist de Implementación

- [x] Badge "NUEVO" en Orders Store
- [x] Badge "NUEVO" en Custom Orders
- [x] Marcado individual al hacer clic
- [x] localStorage separado por tipo
- [x] Sincronización con Header
- [x] Eventos personalizados
- [x] Actualización en tiempo real
- [x] Contador correcto en Header
- [x] Persistencia entre recargas
- [x] Documentación completa

---

## 🎓 Conceptos Aplicados

1. **React Hooks**: `useState`, `useEffect`
2. **localStorage**: Persistencia del navegador
3. **Firestore Listeners**: `onSnapshot` para tiempo real
4. **Custom Events**: Comunicación entre componentes
5. **Set Data Structure**: Evitar duplicados
6. **Conditional Rendering**: Badge aparece solo si es nuevo
7. **Event Handling**: onClick para marcar como vista
8. **State Management**: Estado local y sincronización

---

## 📞 Soporte

Si tienes problemas con el sistema de notificaciones:

1. Abre las DevTools (F12)
2. Ve a la pestaña "Application" > "Local Storage"
3. Verifica que existen las keys `viewedOrderIds` y `viewedCustomOrderIds`
4. Ve a la pestaña "Console" y busca errores
5. Verifica que Firestore tiene las colecciones `orders` y `customOrders`

---

**Última actualización**: 11 de noviembre de 2025
**Versión**: 2.0
**Estado**: ✅ Implementado y funcionando
