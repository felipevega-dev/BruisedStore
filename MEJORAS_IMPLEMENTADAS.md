# Mejoras Implementadas - BruisedStore

## 1. 🎨 Efecto de Volteo en Foto de Perfil

### Descripción
Se ha implementado un elegante efecto 3D de volteo (flip) en la foto de perfil del banner principal de la página de inicio.

### Características
- **Interacción en PC**: Al pasar el mouse sobre la foto, esta se voltea mostrando el reverso
- **Interacción en Mobile**: Al tocar la foto, se activa el efecto de volteo
- **Filtro "Bruised"**: La cara posterior muestra la imagen con un filtro visual que simula un efecto infrarrojo/experimental
- **Bordes dinámicos**: La cara frontal tiene borde blanco, la posterior tiene borde rojo
- **Animación suave**: Transición de 0.6 segundos con perspectiva 3D

### Filtro Visual
El filtro aplicado usa las siguientes transformaciones CSS:
```css
filter: 
  hue-rotate(280deg)    /* Cambia los colores hacia tonos púrpura/magenta */
  saturate(180%)        /* Aumenta la saturación */
  contrast(130%)        /* Aumenta el contraste */
  brightness(110%)      /* Aumenta el brillo */
  sepia(30%);          /* Añade un toque de sepia */
```

### Variantes Disponibles
En el código CSS se incluyen comentarios con variantes alternativas del filtro:
- **Red-dominant bruised look**: Efecto de moretones rojizos
- **Purple bruised look**: Efecto de moretones púrpura
- **Infrared look**: Efecto de cámara infrarroja
- **Dark moody look**: Efecto oscuro y dramático

Para cambiar el filtro, simplemente descomenta la variante deseada en `AnimatedBanner.tsx`.

### Ubicación del Código
- Componente: `components/AnimatedBanner.tsx`
- Estilos CSS: Dentro del mismo componente usando `<style jsx>`

---

## 2. 🔔 Sistema de Notificaciones Inteligente para Admin (MEJORADO v2)

### Problema Anterior
Las notificaciones del panel de administración mostraban siempre todas las órdenes pendientes, sin distinguir cuáles ya había visto el admin. Además, no había indicadores visuales de cuáles órdenes eran nuevas.

### Solución Implementada v2
Sistema completo de tracking individual de órdenes vistas con indicadores visuales:

#### 1. **Badge "NUEVO" en Órdenes No Vistas**
- Cada orden pendiente que no ha sido vista muestra un badge amarillo animado con el texto "NUEVO"
- El badge incluye un ícono de campana y animación de pulso
- Se posiciona en la esquina superior derecha de cada tarjeta de orden

#### 2. **Marcado Individual de Órdenes**
- Al hacer clic en una orden, se marca automáticamente como vista
- El badge "NUEVO" desaparece inmediatamente
- El contador de pendientes se actualiza en tiempo real

#### 3. **Persistencia Separada por Tipo**
- Órdenes de compra: `viewedOrderIds` en localStorage
- Órdenes personalizadas: `viewedCustomOrderIds` en localStorage
- Cada tipo mantiene su propio historial de vistas

#### 4. **Sincronización en Tiempo Real**
- El Header se actualiza automáticamente cuando se marca una orden como vista
- Usa eventos personalizados del navegador para comunicación entre componentes
- Los Firestore listeners filtran solo órdenes no vistas

### Funcionamiento Técnico

#### Almacenamiento
```typescript
// Formato en localStorage
{
  "viewedOrderIds": ["order123", "order456", ...],
  "viewedCustomOrderIds": ["custom789", "custom012", ...]
}
```

#### Verificación de Orden Nueva
```typescript
const isOrderNew = (order: Order): boolean => {
  return !viewedOrderIds.has(order.id!) && order.status === "pending";
};
```

#### Marcado Como Vista
```typescript
const markOrderAsViewed = (orderId: string) => {
  // Agregar a Set
  viewedOrderIds.add(orderId);
  // Guardar en localStorage
  localStorage.setItem("viewedOrderIds", JSON.stringify([...viewedOrderIds]));
  // Notificar al Header
  window.dispatchEvent(new Event("ordersViewed"));
  // Actualizar contador local
  setPendingCount((prev) => Math.max(0, prev - 1));
};
```

#### Sincronización del Header
```typescript
// Escucha cambios en localStorage y eventos personalizados
window.addEventListener("ordersViewed", handleCustomStorageChange);

// Filtra órdenes no vistas en tiempo real
ordersCount = snapshot.docs.filter((doc) => !viewedOrderIds.has(doc.id)).length;
```

### Características del Badge "NUEVO"

**Diseño Visual:**
- Color: Amarillo brillante (`bg-yellow-500`)
- Borde: 2px amarillo (`border-yellow-400`)
- Texto: Negro y negrita (`text-black font-black`)
- Tamaño: Extra pequeño (`text-xs`)
- Animación: Pulso continuo (`animate-pulse`)
- Posición: Absoluta en esquina superior derecha
- Z-index: 10 (sobre la tarjeta)

**Responsivo:**
- Se adapta automáticamente al tamaño de la tarjeta
- Mantiene visibilidad en móvil y desktop
- No interfiere con la interacción de la tarjeta

### Flujo de Usuario

1. **Admin ve el badge en Header**: "3 nuevos pedidos"
2. **Navega a Órdenes de Compra**:
   - Ve 2 tarjetas con badge "NUEVO" amarillo
   - Las otras órdenes pendientes no tienen badge (ya vistas)
3. **Hace clic en una orden con badge**:
   - El badge desaparece inmediatamente
   - El contador en Header baja de 3 a 2
   - La orden permanece visible pero sin badge
4. **Navega a Pedidos Personalizados**:
   - Ve 1 tarjeta con badge "NUEVO"
5. **Hace clic en la orden**:
   - Badge desaparece
   - Contador en Header baja a 0

### Beneficios
- ✅ Indicador visual claro de qué órdenes son nuevas
- ✅ Marcado individual por clic (no por visita a página)
- ✅ Contador refleja exactamente órdenes no vistas
- ✅ Sincronización instantánea entre componentes
- ✅ Separación entre órdenes de compra y personalizadas
- ✅ No requiere modificaciones en Firestore
- ✅ Funciona offline (localStorage)
- ✅ UX intuitiva y profesional

### Ubicación del Código
- Header: `components/Header.tsx` (useEffect con listeners y eventos)
- Admin Órdenes Compra: `app/admin/orders-store/page.tsx` 
  - Estado `viewedOrderIds` y función `markOrderAsViewed`
  - Badge "NUEVO" en el map de órdenes
  - Evento `ordersViewed` disparado al marcar como vista
- Admin Órdenes Personalizadas: `app/admin/orders/page.tsx`
  - Estado `viewedCustomOrderIds` y función `markOrderAsViewed`
  - Badge "NUEVO" en el map de órdenes
  - Evento `ordersViewed` disparado al marcar como vista

---

## Cómo Probar las Mejoras

### Efecto de Volteo
1. Navega a la página principal
2. En PC: Pasa el mouse sobre la foto de perfil del banner
3. En Mobile: Toca la foto de perfil
4. Observa el efecto 3D y el cambio de filtro

### Notificaciones
1. **Admin ve el Header**: Observa el número en el badge del botón "Admin" (ej: 3)
2. **Visita `/admin/orders-store`**: 
   - Verá las órdenes con badge "NUEVO" amarillo brillante
   - Haz clic en una orden con badge
   - Observa cómo el badge desaparece
   - El contador en el Header disminuye automáticamente
3. **Regresa a cualquier página**: El contador debe reflejar solo órdenes no vistas
4. **Visita `/admin/orders`**: Verá órdenes personalizadas con sus propios badges "NUEVO"
5. **Crea una nueva orden de prueba**: 
   - El badge aparece automáticamente en la nueva orden
   - El contador se incrementa en tiempo real
6. **Prueba en múltiples pestañas**: Los cambios se sincronizan entre pestañas

---

## Notas Técnicas

### Compatibilidad del Efecto Flip
- Funciona en todos los navegadores modernos
- Usa `transform: rotateY()` con `preserve-3d`
- Responsive: Ajusta tamaños entre mobile y desktop
- Performance: Usa aceleración por GPU

### Almacenamiento de Notificaciones
- Se usa `localStorage` en lugar de Firestore para evitar llamadas extra a la DB
- El timestamp es un número (Date.now())
- Se resetea cada vez que el admin visita una página de órdenes
- Compatible con modo incógnito (se limpia al cerrar)

### Filtros CSS Adicionales
Si quieres experimentar con otros filtros, puedes usar herramientas como:
- [CSS Filter Generator](https://www.cssfiltergenerator.com/)
- Chrome DevTools > Elements > Styles > Editar filter property

---

## Próximas Mejoras Sugeridas

1. **Efecto de Volteo**:
   - Añadir sonido al voltear
   - Permitir al admin cambiar el filtro desde el panel
   - Añadir más variantes de filtros con un selector

2. **Notificaciones**:
   - Añadir notificaciones de escritorio (Push API)
   - Sonido al recibir nueva orden
   - Panel de historial de notificaciones
   - Filtros por tipo de orden (compra vs personalizada)

3. **General**:
   - Dashboard con gráficas de órdenes nuevas vs vistas
   - Sistema de comentarios internos en órdenes
   - Exportación de reportes de órdenes
