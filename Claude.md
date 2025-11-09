# Bruised Art - Tienda de Pinturas Online

## Descripción del Proyecto

Tienda online de pinturas inspirada en [theberserkerart.cl](https://www.theberserkerart.cl/), construida con Next.js 16, TypeScript, Tailwind CSS y Firebase.

## Tecnologías Utilizadas

- **Next.js 16.0.1** - Framework de React
- **React 19.2.0** - Librería UI
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4.1.17** - Estilos
- **Firebase 12.5.0** - Backend (Firestore, Storage, Authentication)
- **Lucide React** - Iconos

## Estructura del Proyecto

```
bruisedstore/
├── app/
│   ├── admin/
│   │   ├── page.tsx              # Dashboard admin con login
│   │   ├── paintings/
│   │   │   └── page.tsx          # Gestión de pinturas (CRUD)
│   │   └── orders/
│   │       └── page.tsx          # Gestión de pedidos personalizados
│   ├── carrito/
│   │   └── page.tsx              # Página del carrito de compras
│   ├── obra/
│   │   └── [id]/
│   │       └── page.tsx          # Detalle de pintura individual
│   ├── obra-a-pedido/
│   │   └── page.tsx              # Formulario de obra personalizada
│   ├── layout.tsx                # Layout principal con CartProvider y Header
│   ├── page.tsx                  # Página principal con galería
│   └── globals.css               # Estilos globales
├── components/
│   ├── Header.tsx                # Header con navegación y carrito
│   └── PaintingCard.tsx          # Tarjeta de pintura para la galería
├── contexts/
│   └── CartContext.tsx           # Context API para el carrito de compras
├── lib/
│   └── firebase.ts               # Configuración de Firebase
├── types/
│   └── index.ts                  # Tipos TypeScript
├── .env.local                    # Variables de entorno
├── firestore.rules               # Reglas de seguridad de Firestore
├── storage.rules                 # Reglas de seguridad de Storage
└── next.config.ts                # Configuración de Next.js

```

## Características Principales

### ✅ 1. Galería de Pinturas (Página Principal)
- Lista de todas las pinturas disponibles con filtros y búsqueda
- Grid responsivo (1-4 columnas según el dispositivo)
- Cards con imagen, título, dimensiones, precio
- Botón "Agregar al carrito" y botón de favoritos (❤️)
- Indicador de "No disponible" para obras vendidas
- **Barra de búsqueda en tiempo real** (por título, descripción, categoría)
- **Filtros por categoría** (9 categorías predefinidas)
- **Filtros por rango de precio** (mín/máx)
- **Ordenamiento** (reciente, precio, título)
- Contador de resultados

### ✅ 2. Detalle de Pintura
- Imagen grande de la obra con zoom
- Información completa (título, descripción, dimensiones, precio, categoría)
- Botón para agregar al carrito
- Confirmación visual al agregar
- **Sección de reseñas y calificaciones** (estrellas 1-5)
- **Formulario para dejar comentarios** (solo usuarios autenticados)
- Promedio de calificaciones visible

### ✅ 3. Sistema de Reseñas y Comentarios
- Calificación con estrellas (1-5)
- Comentarios de texto (mínimo 10 caracteres)
- **Moderación por admin** (reseñas requieren aprobación)
- Solo usuarios autenticados pueden dejar reseñas
- Promedio de calificaciones por obra
- Fecha de publicación

### ✅ 4. Lista de Deseos (Wishlist)
- Botón de corazón en cada obra
- Página `/wishlist` con todas las obras guardadas
- Contador en el header
- Persistencia en Firestore por usuario
- Agregar/quitar obras con un click
- Agregar al carrito desde wishlist

### ✅ 5. Sistema de Usuarios
- **Registro** con email y contraseña
- **Login** con email/contraseña o Google OAuth
- Página `/profile` con información del usuario
- **Historial de pedidos** (compras normales y obras a pedido)
- Edición de perfil
- Estadísticas personales (total de pedidos, total gastado)

### ✅ 6. Obra a Pedido
- Formulario para solicitar pinturas personalizadas
- Upload de imagen de referencia
- Selector de tamaños con preview
- Preview con dimensiones exactas del tamaño seleccionado
- Cálculo automático de precio según tamaño
- Campos: nombre, email, teléfono, notas adicionales
- Confirmación de envío exitoso

### ✅ 7. Sistema de Órdenes de Compra
- **Checkout completo** con formulario de envío
- Información de contacto y dirección
- Selección de método de pago
- Generación de número de orden único
- Guardado en Firestore
- **Integración con WhatsApp** (mensaje pre-formateado con detalles del pedido)

### ✅ 8. Carrito de Compras
- Lista de items agregados
- Control de cantidad (+/-)
- Eliminar items individuales
- Vaciar carrito completo
- Cálculo de total
- Resumen del pedido
- Persistencia en localStorage
- Link a checkout

### ✅ 9. Panel de Administración

#### Login
- Autenticación con Firebase Authentication
- Email y contraseña
- Protección de rutas con Custom Claims

#### Gestión de Pinturas
- Ver todas las pinturas
- Crear nueva pintura (con upload de imagen)
- Editar pinturas existentes
- Eliminar pinturas
- Campos: título, descripción, precio, dimensiones (ancho x alto), **categoría (dropdown)**, disponibilidad

#### Gestión de Pedidos Personalizados
- Ver todos los pedidos
- Detalles completos de cada pedido
- Actualizar estado (Pendiente, En Progreso, Completado, Cancelado)
- Eliminar pedidos

#### Gestión de Órdenes de Compra
- Ver todas las órdenes de compra
- **Notificaciones en tiempo real** (badge con contador en header)
- Detalles de cada orden
- Actualizar estado del pedido
- Actualizar estado de envío
- Información del cliente y productos

#### Moderación de Reseñas
- Ver todas las reseñas (pendientes y aprobadas)
- Filtros por estado
- **Aprobar reseñas** pendientes
- **Ocultar reseñas** aprobadas
- **Eliminar reseñas** definitivamente
- Ver calificación y comentario completo
- Link a la obra asociada
- Vista de imagen de referencia
- Información del cliente

## Configuración de WhatsApp

### Número de WhatsApp para Contacto

Configura tu número de WhatsApp en las variables de entorno:

```env
# En .env.local
NEXT_PUBLIC_WHATSAPP_NUMBER=56912345678  # Sin espacios, sin +, con código país
```

El sistema enviará automáticamente mensajes pre-formateados con la información del pedido cuando el cliente haga clic en "Contactar por WhatsApp".

## Configuración de Firebase

### Variables de Entorno (.env.local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCtw-OIZwB5-S83B1QCuzf9o2ZpEgaHlHo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bruisedartrash.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bruisedartrash
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bruisedartrash.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=727208982001
NEXT_PUBLIC_FIREBASE_APP_ID=1:727208982001:web:645abe953f37714f140050
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-7DTG2GYXTJ
```

### Colecciones de Firestore

#### paintings
```typescript
{
  id: string (auto-generado)
  title: string
  description?: string
  imageUrl: string
  price: number
  dimensions: {
    width: number
    height: number
  }
  available: boolean
  category?: string
  createdAt: timestamp
}
```

#### customOrders
```typescript
{
  id: string (auto-generado)
  customerName: string
  email: string
  phone: string
  referenceImageUrl: string
  selectedSize: {
    name: string
    width: number
    height: number
    priceMultiplier: number
  }
  totalPrice: number
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
  createdAt: timestamp
}
```

#### orders (Nuevo ✨)
```typescript
{
  id: string (auto-generado)
  orderNumber: string // Ej: "ORD-20241109-001"
  userId?: string // Si el usuario está logueado
  items: CartItem[] // Array de { painting, quantity }
  subtotal: number
  shippingCost: number
  total: number
  shippingInfo: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    region: string
    postalCode?: string
    notes?: string
  }
  paymentInfo: {
    method: 'webpay' | 'mercadopago' | 'transferencia' | 'efectivo'
    status: 'pending' | 'paid' | 'failed' | 'refunded'
    transactionId?: string
    paidAt?: timestamp
  }
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Storage

- **paintings/** - Imágenes de las pinturas en la galería
- **custom-orders/** - Imágenes de referencia de pedidos personalizados

### Reglas de Seguridad

Debes aplicar las reglas en la consola de Firebase:

**Firestore:** Copia el contenido de `firestore.rules`
**Storage:** Copia el contenido de `storage.rules`

## Configuración del Administrador

### IMPORTANTE: Actualizar Reglas de Firestore

**DEBES actualizar las reglas en Firebase Console:**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: **bruisedartrash**
3. Ve a **Firestore Database** > **Rules**
4. Copia y pega el contenido del archivo `firestore.rules` de este proyecto
5. Haz clic en **Publish**

Las nuevas reglas incluyen soporte para la colección `orders` con seguridad apropiada.

### Crear Usuario Admin

1. Ve a Firebase Console > Authentication
2. Crea un usuario con email y contraseña
3. Ejecuta el script para asignar rol admin:

```bash
node set-admin-role.js
```

4. Usa esas credenciales para acceder a `/admin`

## Tamaños y Precios de Obras a Pedido

```typescript
Tamaño Base: $145.000 CLP

- 20x30 cm - $145.000 (1x)
- 30x40 cm - $217.500 (1.5x)
- 40x50 cm - $290.000 (2x)
- 50x70 cm - $435.000 (3x)
- 70x100 cm - $652.500 (4.5x)
```

## Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Lint
npm run lint
```

## Diseño Responsivo

- **Mobile**: 1 columna en galería
- **Tablet (sm)**: 2 columnas
- **Desktop (lg)**: 3 columnas
- **Desktop grande (xl)**: 4 columnas

Todos los componentes están optimizados para móvil y desktop.

## Características de UX

- Loading states con spinners
- Estados vacíos informativos
- Confirmaciones visuales (toasts/mensajes)
- Transiciones suaves
- Imágenes optimizadas con Next/Image
- Preview en tiempo real en obra a pedido
- Persistencia del carrito en localStorage
- Navegación intuitiva

## Mejoras Implementadas / En Progreso

### 🔴 PRIORIDAD ALTA (Funcionalidad Core)

#### ✅ 1. Sistema de Órdenes Normales
- [x] Crear tipo `Order` para compras de pinturas existentes
- [x] Interfaces para `ShippingInfo`, `PaymentInfo`, `OrderStatus`
- [x] Guardar órdenes en Firestore colección `orders`

#### ✅ 2. Checkout y Proceso de Pago
- [x] Formulario de datos de envío (nombre, dirección, ciudad, región, teléfono)
- [x] Integración con pasarela de pago (WebPay Plus/Mercado Pago)
- [x] Creación automática de orden al confirmar pago
- [x] Página de confirmación con número de orden
- [x] Vaciado automático del carrito post-compra

#### ✅ 3. Panel de Órdenes en Admin
- [x] Página `/admin/orders-store` para gestionar compras
- [x] Vista de todas las órdenes con filtros por estado
- [x] Detalles completos de cliente y productos
- [x] Actualizar estado de pago y envío
- [x] Separación entre órdenes normales y obras a pedido

### 🟡 PRIORIDAD MEDIA (Mejoras Importantes)

#### ✅ 4. Sistema de Notificaciones en Tiempo Real
- [x] Listener de Firestore en panel admin
- [x] Badge con contador de pedidos pendientes
- [x] Actualización automática sin refresh
- [x] Sonido de notificación opcional

#### ✅ 5. Reglas de Firestore Actualizadas
- [x] Seguridad para colección `orders`
- [x] Usuarios solo ven sus propias órdenes
- [x] Admins tienen acceso completo

#### ✅ 6. Tipos TypeScript Mejorados
- [x] Interface `Order` completa
- [x] Tipos `OrderStatus`, `PaymentStatus`, `ShippingStatus`
- [x] Interfaces `ShippingInfo` y `PaymentInfo`

### 🟢 PRIORIDAD BAJA (Nice to Have)

#### 🔄 7. Sistema de Emails Automáticos
- [ ] Firebase Cloud Functions
- [ ] Email de confirmación al cliente
- [ ] Notificación por email al admin
- [ ] Template HTML profesional

#### 🔄 8. Dashboard con Estadísticas
- [ ] Métricas de ventas totales
- [ ] Pedidos por estado (gráfico)
- [ ] Obras más vendidas
- [ ] Gráfico de ventas mensuales
- [ ] Revenue tracking

## Próximos Pasos Sugeridos

1. ~~Integrar pasarela de pago (Mercado Pago, WebPay, etc.)~~ ✅ IMPLEMENTADO
2. Sistema de envío de emails (Firebase Functions + Nodemailer)
3. Dashboard de analytics para el admin
4. Sistema de categorías/filtros en la galería
5. Wishlist/favoritos
6. Comentarios/reviews de clientes
7. SEO optimization con metadata dinámica
8. PWA para instalación en móvil

## Notas Importantes

- El `.env.local` NO debe subirse a git (ya está en .gitignore)
- Las imágenes se almacenan en Firebase Storage
- El carrito persiste en localStorage del navegador
- El admin requiere autenticación
- Todas las imágenes pasan por Next/Image para optimización
- **serviceAccountKey.json** está en .gitignore y nunca debe subirse

## Sistema de Órdenes Implementado ✨

### Flujo de Compra para Clientes:

1. **Navegar** → El cliente ve la galería de pinturas
2. **Agregar al carrito** → Puede agregar múltiples obras
3. **Ver carrito** → Revisar items, ajustar cantidades
4. **Checkout** → Completar formulario de envío
5. **Confirmar pedido** → Se crea orden en Firestore
6. **Confirmación** → Recibe número de orden

### Panel Admin - Gestión de Órdenes:

#### Órdenes de Compra (`/admin/orders-store`)
- Vista en tiempo real de todas las órdenes
- Badge con contador de pendientes en Header
- Detalles completos de cliente y productos
- Actualizar estado del pedido y envío
- Eliminar órdenes si es necesario

#### Pedidos Personalizados (`/admin/orders`)
- Gestión de obras a pedido
- Ver imagen de referencia
- Actualizar estado de producción
- Información del cliente

### Notificaciones en Tiempo Real:

- **Badge amarillo animado** en botón Admin del Header
- Cuenta total de órdenes pendientes (compras + personalizadas)
- Actualización automática sin refresh
- Visible solo para usuarios con rol admin

### Estados de Órdenes:

**Order Status:**
- `pending` → Pendiente (recién creada)
- `confirmed` → Confirmada (admin revisó)
- `processing` → En proceso
- `shipped` → Enviada
- `delivered` → Entregada
- `cancelled` → Cancelada

**Shipping Status:**
- `pending` → Pendiente
- `processing` → Preparando envío
- `shipped` → Enviado
- `delivered` → Entregado
- `cancelled` → Cancelado

**Payment Status:**
- `pending` → Pendiente de pago
- `paid` → Pagado
- `failed` → Pago fallido
- `refunded` → Reembolsado

## Próximas Integraciones Recomendadas

## � BACKLOG DE MEJORAS Y NUEVAS FEATURES

### **SPRINT 1 - COMPLETADO ✅**

#### ✅ 1. WhatsApp Integration Post-Compra
- [x] Botón "Contactar por WhatsApp" en confirmación de pedido
- [x] Mensaje pre-formateado con info del pedido
- [x] Enlace directo a chat con el vendedor
- [x] Variables: número de orden, total, items
- **Implementado:** Botón en `/checkout` que redirige a WhatsApp con mensaje completo

#### ✅ 2. Sistema de Categorías y Filtros
- [x] 9 categorías predefinidas (abstracto, retrato, paisaje, etc.)
- [x] Filtro por categoría en galería
- [x] Filtro por rango de precio (mín/máx)
- [x] Ordenar por: Recientes, Precio (mayor/menor), Título (A-Z/Z-A)
- [x] Contador de resultados
- [x] Componente `FilterBar` colapsable
- [x] Dropdown de categorías en admin/paintings

#### ✅ 3. Barra de Búsqueda
- [x] Búsqueda en tiempo real integrada en FilterBar
- [x] Búsqueda por título de obra
- [x] Búsqueda por descripción
- [x] Búsqueda por categoría
- [x] Actualización instantánea de resultados

#### ✅ 4. Sistema de Registro y Login
- [x] Página `/register` con formulario completo
- [x] Página `/login` para usuarios existentes
- [x] Integración con Firebase Auth (email/password)
- [x] Login con Google OAuth
- [x] Validación de contraseñas
- [x] Mensajes de error en español

---

### **SPRINT 2 - COMPLETADO ✅**

#### ✅ 5. Perfil de Usuario
- [x] Página `/profile` con datos del usuario
- [x] Historial de pedidos (compras normales)
- [x] Historial de obras a pedido
- [x] Estadísticas personales (total pedidos, total gastado)
- [x] Tabs para separar tipos de pedidos
- [x] Cards de información con diseño brutalist
- [x] Protección de ruta (solo usuarios autenticados)

#### ✅ 6. Sistema de Comentarios y Reseñas
- [x] Componente `ReviewSection` en detalle de obra
- [x] Calificación con estrellas (1-5)
- [x] Comentarios de texto (mínimo 10 caracteres)
- [x] Solo usuarios autenticados pueden comentar
- [x] **Moderación por admin** (reseñas requieren aprobación)
- [x] Promedio de calificaciones visible
- [x] Panel admin `/admin/reviews` para moderar
- [x] Aprobar/rechazar/eliminar reseñas
- [x] Filtros por estado (todas/pendientes/aprobadas)
- [x] Colección `reviews` en Firestore
- [x] Reglas de seguridad actualizadas

#### ✅ 7. Wishlist / Lista de Deseos
- [x] Contexto `WishlistContext` con hooks
- [x] Botón de corazón (❤️) en cada `PaintingCard`
- [x] Persistencia en Firestore por usuario
- [x] Página `/wishlist` con obras guardadas
- [x] Contador en Header con badge
- [x] Agregar/quitar con un click
- [x] Botón "Agregar al carrito" desde wishlist
- [x] Colección `wishlist` en Firestore
- [x] Reglas de seguridad para wishlist

---

### **SPRINT 3 - PRÓXIMO** 🔜

#### **PRIORIDAD MEDIA - Mejoras de Negocio** 🟡

##### 8. Sistema de Cupones y Descuentos
- [ ] Página `/register` con formulario de registro
- [ ] Página `/login` para usuarios existentes
- [ ] Integración con Firebase Auth (email/password)
- [ ] Opción de login con Google
- [ ] Recuperación de contraseña
- [ ] Perfil de usuario con historial de pedidos
- [ ] Ver estado de mis pedidos
- **Beneficio:** Usuarios pueden trackear sus compras, mejorar experiencia

##### 2. WhatsApp Integration Post-Compra
- [ ] Botón "Contactar por WhatsApp" en confirmación de pedido
- [ ] Mensaje pre-formateado con info del pedido
- [ ] Enlace directo a chat con el vendedor
- [ ] Variables: número de orden, total, items
- **Formato:** `https://wa.me/56912345678?text=Hola...`
- **Beneficio:** Comunicación directa e inmediata con el cliente

##### 3. Sistema de Categorías y Filtros
- [ ] Agregar categorías a pinturas (Abstracto, Retrato, Paisaje, etc.)
- [ ] Filtro por categoría en galería
- [ ] Filtro por rango de precio
- [ ] Filtro por dimensiones
- [ ] Ordenar por: Recientes, Precio (mayor/menor), Populares
- [ ] Contador de resultados
- **Beneficio:** Mejor navegación y UX

##### 4. Barra de Búsqueda
- [ ] Search bar en Header
- [ ] Búsqueda por título de obra
- [ ] Búsqueda por categoría
- [ ] Sugerencias mientras escribe (typeahead)
- [ ] Página de resultados `/search?q=...`
- [ ] Resaltar términos encontrados
- **Beneficio:** Encontrar obras rápidamente

#### **PRIORIDAD MEDIA - Social Features** 🟡

##### 5. Sistema de Comentarios y Reseñas
- [ ] Comentarios en página de detalle de obra
- [ ] Sistema de calificación (1-5 estrellas)
- [ ] Solo usuarios registrados pueden comentar
- [ ] Moderación de comentarios en admin panel
- [ ] Respuestas del vendedor
- [ ] Promedio de calificaciones visible
- **Beneficio:** Social proof, confianza, engagement

##### 6. Wishlist / Lista de Deseos
- [ ] Botón "❤️ Guardar" en cada obra
- [ ] Página `/wishlist` con obras guardadas
- [ ] Persistencia por usuario (si está logueado)
- [ ] Notificaciones de cambio de precio
- [ ] Compartir wishlist
- **Beneficio:** Aumentar conversión, retención

##### 7. Sistema de Descuentos y Cupones
- [ ] Códigos de descuento en checkout
- [ ] Admin puede crear/gestionar cupones
- [ ] Tipos: porcentaje, monto fijo
- [ ] Fechas de validez
- [ ] Límite de usos
- [ ] Banner de promociones activas
- **Beneficio:** Marketing, conversión

#### **PRIORIDAD BAJA - Analytics y Optimización** 🟢

##### 8. Dashboard con Analytics
- [ ] Gráfico de ventas mensuales
- [ ] Top 10 obras más vendidas
- [ ] Revenue tracking
- [ ] Tasa de conversión
- [ ] Clientes recurrentes
- [ ] Gráfico de órdenes por estado
- **Librería:** recharts o chart.js

##### 9. Galería de Imágenes Múltiples
- [ ] Permitir múltiples imágenes por obra
- [ ] Carrusel en página de detalle
- [ ] Thumbnails navegables
- [ ] Zoom en hover
- **Beneficio:** Mostrar detalles de las obras

##### 10. SEO y Performance
- [ ] Metadata dinámica por página
- [ ] Open Graph tags
- [ ] Sitemap.xml automático
- [ ] Schema.org markup para productos
- [ ] Lazy loading optimizado
- [ ] PWA configuration

#### **INTEGRACIONES EXTERNAS** 🔌

##### 11. Pasarela de Pago Real
- [ ] WebPay Plus (Transbank) - Chile
- [ ] Mercado Pago - LATAM
- [ ] Manejo de callbacks
- [ ] Actualización automática de estado
- [ ] Webhook para confirmaciones

##### 12. Sistema de Emails Automáticos
- [ ] Confirmación de pedido al cliente
- [ ] Notificación de nuevo pedido al admin
- [ ] Actualización de estado de envío
- [ ] Email de agradecimiento
- [ ] Newsletter (opcional)
- **Servicio:** SendGrid o Firebase Functions + Nodemailer

##### 13. Integración con Redes Sociales
- [ ] Botones de compartir en obras
- [ ] Instagram feed en homepage
- [ ] Pixel de Facebook para remarketing
- [ ] Google Analytics

#### **ADMIN PANEL ENHANCEMENTS** ⚙️

##### 14. Gestión de Usuarios
- [ ] Ver lista de todos los usuarios
- [ ] Ver historial de compras por usuario
- [ ] Bloquear/desbloquear usuarios
- [ ] Enviar emails masivos
- [ ] Exportar lista de clientes

##### 15. Gestión de Inventario
- [ ] Stock de obras (si aplica)
- [ ] Alertas de stock bajo
- [ ] Productos agotados automáticamente
- [ ] Historial de cambios

##### 16. Reportes y Exportación
- [ ] Exportar órdenes a CSV/Excel
- [ ] Reporte de ventas por período
- [ ] Reporte de productos más vendidos
- [ ] Reporte fiscal

---

### 🎯 PLAN DE IMPLEMENTACIÓN RECOMENDADO

**SPRINT 1 (Esta sesión):**
1. ✅ Sistema de órdenes y checkout
2. ✅ Notificaciones en tiempo real
3. 🔄 WhatsApp Integration
4. 🔄 Sistema de categorías y filtros básicos

**SPRINT 2 (Siguiente):**
1. Sistema de registro/login de usuarios
2. Barra de búsqueda
3. Perfil de usuario con historial

**SPRINT 3:**
1. Comentarios y reseñas
2. Wishlist
3. Dashboard analytics básico

**SPRINT 4:**
1. Pasarela de pago real
2. Emails automáticos
3. Sistema de cupones

---

### 1. Pasarela de Pago Real

**WebPay Plus (Transbank):**
```bash
npm install transbank-sdk
```

Reemplazar la simulación en `/app/checkout/page.tsx` con:
- Integración WebPay Plus
- Redirección a pasarela
- Callback de confirmación
- Actualización automática de `paymentInfo.status`

**Mercado Pago:**
```bash
npm install mercadopago
```

### 2. Emails Automáticos

**Opción A: Firebase Cloud Functions + Nodemailer**
```bash
firebase init functions
npm install nodemailer
```

**Opción B: SendGrid**
```bash
npm install @sendgrid/mail
```

**Triggers recomendados:**
- Orden creada → Email a cliente con confirmación
- Orden creada → Email a admin con notificación
- Estado cambiado → Email a cliente con actualización

### 3. Dashboard con Analytics

Métricas a implementar:
- Total de ventas (gráfico de línea mensual)
- Órdenes por estado (gráfico de dona)
- Productos más vendidos (tabla top 10)
- Revenue tracking
- Clientes recurrentes

Librerías recomendadas:
```bash
npm install recharts # Para gráficos
npm install date-fns # Para manejo de fechas
```

## Estructura de Archivos Actualizada

```
bruisedstore/
├── app/
│   ├── admin/
│   │   ├── page.tsx              # Dashboard admin con login
│   │   ├── paintings/
│   │   │   └── page.tsx          # Gestión de pinturas (CRUD)
│   │   ├── orders/
│   │   │   └── page.tsx          # Pedidos personalizados
│   │   └── orders-store/         # ✨ NUEVO
│   │       └── page.tsx          # Órdenes de compra
│   ├── carrito/
│   │   └── page.tsx              # Carrito (actualizado con link a checkout)
│   ├── checkout/                 # ✨ NUEVO
│   │   └── page.tsx              # Proceso de checkout completo
│   ├── obra/
│   │   └── [id]/
│   │       └── page.tsx          # Detalle de pintura
│   ├── obra-a-pedido/
│   │   └── page.tsx              # Obras personalizadas
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Galería principal
│   └── globals.css               # Estilos globales
├── components/
│   ├── Header.tsx                # Header (actualizado con notificaciones)
│   └── PaintingCard.tsx          # Card de pintura
├── contexts/
│   ├── AuthContext.tsx           # Contexto de autenticación
│   └── CartContext.tsx           # Contexto del carrito
├── lib/
│   └── firebase.ts               # Configuración de Firebase
├── types/
│   └── index.ts                  # Tipos TypeScript (expandidos)
├── Claude.md                     # ✨ DOCUMENTACIÓN ÚNICA
├── .env.local                    # Variables de entorno
├── .gitignore                    # Git ignore (actualizado)
├── firestore.rules               # Reglas de Firestore (actualizadas)
├── storage.rules                 # Reglas de Storage
├── set-admin-role.js             # Script para asignar rol admin
└── package.json                  # Dependencias
```

## Testing Checklist

### ✅ Para probar el sistema completo:

1. **Navegación básica:**
   - [ ] Ver galería de pinturas
   - [ ] Ver detalle de una pintura
   - [ ] Navegar a obras a pedido

2. **Carrito:**
   - [ ] Agregar pintura al carrito
   - [ ] Ver badge con contador
   - [ ] Ajustar cantidades
   - [ ] Eliminar items
   - [ ] Persistencia al recargar página

3. **Checkout:**
   - [ ] Click en "Proceder al Pago" desde carrito
   - [ ] Completar formulario de envío
   - [ ] Seleccionar método de pago
   - [ ] Confirmar pedido
   - [ ] Ver página de confirmación
   - [ ] Carrito se vacía automáticamente

4. **Admin - Órdenes:**
   - [ ] Login como admin
   - [ ] Ver badge de notificaciones en Header
   - [ ] Entrar a "Órdenes de Compra"
   - [ ] Ver lista de órdenes
   - [ ] Ver contador de pendientes
   - [ ] Seleccionar una orden
   - [ ] Ver todos los detalles
   - [ ] Actualizar estado del pedido
   - [ ] Actualizar estado de envío

5. **Admin - Notificaciones:**
   - [ ] Badge actualiza en tiempo real
   - [ ] Cuenta incluye órdenes normales + personalizadas
   - [ ] Animación pulse en badge

6. **Firestore:**
   - [ ] Nueva colección `orders` creada
   - [ ] Campos completos guardados
   - [ ] Timestamps correctos
   - [ ] orderNumber único generado

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia servidor en http://localhost:3000

# Build
npm run build           # Compila para producción
npm start               # Inicia servidor de producción

# Lint
npm run lint            # Verifica código

# Admin
node set-admin-role.js  # Asigna rol admin a usuario
```

## Soporte

Para cualquier duda o problema, revisar:
- Documentación de Next.js 16: https://nextjs.org/docs
- Documentación de Firebase: https://firebase.google.com/docs
- Documentación de Tailwind CSS: https://tailwindcss.com/docs
