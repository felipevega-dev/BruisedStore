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

## Mejoras Implementadas

### 🔴 FUNCIONALIDAD CORE - COMPLETADO ✅

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

#### ✅ 4. Sistema de Notificaciones en Tiempo Real
- [x] Listener de Firestore en panel admin
- [x] Badge con contador de pedidos pendientes
- [x] Actualización automática sin refresh
- [x] Sonido de notificación opcional

---

## 🎯 SPRINTS COMPLETADOS

### **SPRINT 1 - COMPLETADO ✅**

#### ✅ 1. WhatsApp Integration Post-Compra
- [x] Botón "Contactar por WhatsApp" en confirmación de pedido
- [x] Mensaje pre-formateado con info del pedido
- [x] Enlace directo a chat con el vendedor
- [x] Variables: número de orden, total, items

#### ✅ 2. Sistema de Categorías y Filtros
- [x] 9 categorías predefinidas (abstracto, retrato, paisaje, etc.)
- [x] Filtro por categoría en galería
- [x] Filtro por rango de precio (mín/máx)
- [x] Ordenar por: Recientes, Precio (mayor/menor), Título (A-Z/Z-A)
- [x] Contador de resultados
- [x] Componente `FilterBar` colapsable

#### ✅ 3. Barra de Búsqueda
- [x] Búsqueda en tiempo real integrada en FilterBar
- [x] Búsqueda por título, descripción y categoría
- [x] Actualización instantánea de resultados

#### ✅ 4. Sistema de Registro y Login
- [x] Páginas `/register` y `/login`
- [x] Firebase Auth (email/password)
- [x] Login con Google OAuth
- [x] Validación de contraseñas

---

### **SPRINT 2 - COMPLETADO ✅**

#### ✅ 5. Perfil de Usuario
- [x] Página `/profile` con datos del usuario
- [x] Historial de pedidos (compras normales + obras a pedido)
- [x] Estadísticas personales
- [x] Tabs para separar tipos de pedidos

#### ✅ 6. Sistema de Comentarios y Reseñas
- [x] Componente `ReviewSection` en detalle de obra
- [x] Calificación con estrellas (1-5)
- [x] Moderación por admin en `/admin/reviews`
- [x] Aprobar/rechazar/eliminar reseñas
- [x] Promedio de calificaciones visible

#### ✅ 7. Wishlist / Lista de Deseos
- [x] Contexto `WishlistContext` con hooks
- [x] Botón de corazón en cada obra
- [x] Página `/wishlist` con obras guardadas
- [x] Contador en Header con badge
- [x] Persistencia en Firestore por usuario

---

### **SPRINT 3 - COMPLETADO ✅**

#### ✅ 8. Sistema de Cupones y Descuentos
- [x] Colección `coupons` en Firestore
- [x] Página `/admin/coupons` para gestión completa
- [x] Tipos: percentage/fixed
- [x] Validación en checkout
- [x] Restricciones: minPurchase, maxDiscount, expiryDate
- [x] Límite de usos

#### ✅ 9. Galería de Imágenes Múltiples
- [x] Interface `Painting` con `images: string[]`
- [x] Componente `ImageGallery` con thumbnails
- [x] Upload múltiple en admin
- [x] Drag & drop para subir imágenes
- [x] Preview y eliminación individual

#### ✅ 10. Dashboard con Analytics
- [x] Página `/admin/analytics`
- [x] Métricas: Ventas totales, pedidos, obras, reseñas
- [x] Gráfico de órdenes por estado (recharts)
- [x] Top 5 obras más vendidas
- [x] Cards con iconos y diseño brutalist

---

### **SPRINT 4 - COMPLETADO ✅**

#### ✅ 11. SEO y Performance
- [x] Sistema completo en `lib/metadata.ts`
- [x] Metadata dinámica con Open Graph y Twitter Cards
- [x] JSON-LD Schema.org (Product + ArtGallery)
- [x] Sitemap.xml dinámico (`app/sitemap.ts`)
- [x] Robots.txt (`app/robots.ts`)
- [x] Viewport optimization
- [x] Font display swap
- [x] Documentación en `SEO_IMPLEMENTATION.md`

#### ✅ 12. Bug Fixes y UX
- [x] Fix dimensiones intuitivas (vertical: 25x20)
- [x] Redesign obra-a-pedido (fondo blanco, preview 8x)
- [x] Fix filtros (searchQuery → search)
- [x] Fix build TypeScript
- [x] Fix lógica de precio en filtros (0 no filtra)

---

## 🚀 SPRINT 5 - PRÓXIMAS OPCIONES

### **Opción A: PWA (Progressive Web App) 📱**
- [ ] Manifest.json con iconos y configuración
- [ ] Service Worker para funcionar offline
- [ ] Instalable en móviles y escritorio
- [ ] Caché inteligente de imágenes
- [ ] Notificaciones push (opcional)
- **Beneficio:** App instalable, funciona offline, experiencia nativa

### **Opción B: Sistema de Notificaciones por Email 📧**
- [ ] Firebase Cloud Functions + Nodemailer/SendGrid
- [ ] Email al cliente cuando se aprueba su pedido
- [ ] Email al admin cuando hay nuevo pedido
- [ ] Confirmación de registro
- [ ] Template HTML profesional
- **Beneficio:** Comunicación automática, profesionalismo

### **Opción C: Sistema de Descuentos Avanzado 🎯**
- [ ] Cupones de "primera compra" automáticos
- [ ] Descuentos por categoría específica
- [ ] Cupones de envío gratis
- [ ] Códigos acumulables
- [ ] Sistema de puntos de fidelidad
- **Beneficio:** Marketing avanzado, retención de clientes

### **Opción D: Chat en Vivo / WhatsApp Widget 💬**
- [ ] Widget de WhatsApp flotante mejorado
- [ ] Mensajes predefinidos por página
- [ ] Horario de atención visible
- [ ] Chat history en Firebase
- [ ] Respuestas automáticas
- **Beneficio:** Comunicación directa, mejor conversión

### **Opción E: Sistema de Blog/Noticias 📝**
- [ ] Blog posts con editor rich text
- [ ] Categorías y tags
- [ ] Comentarios en posts
- [ ] Compartir en redes sociales
- [ ] RSS feed
- **Beneficio:** SEO, engagement, comunidad

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ Features Implementados (Total: 12/16 base features)
1. ✅ Galería de pinturas con filtros y búsqueda
2. ✅ Sistema de autenticación completo
3. ✅ Carrito de compras funcional
4. ✅ Checkout y órdenes de compra
5. ✅ Obras a pedido personalizadas
6. ✅ Panel de administración completo
7. ✅ Sistema de reseñas con moderación
8. ✅ Wishlist/favoritos
9. ✅ Sistema de cupones
10. ✅ Galería múltiple de imágenes
11. ✅ Dashboard analytics
12. ✅ SEO completo

### 🔄 En Progreso
- Ninguno - Todo funcionando correctamente

### 📝 Próximo Sprint
- Elegir entre opciones A, B, C, D o E arriba

---

## 🐛 BUGS CONOCIDOS Y FIXES RECIENTES

### Resueltos ✅
- ✅ **Fix filtros no mostraban pinturas** (Nov 9, 2025)
  - Problema: `maxPrice: 0` filtraba todas las pinturas
  - Solución: Cambiar lógica a `if (minPrice > 0)` y `if (maxPrice > 0)`
  
- ✅ **Fix build TypeScript** (Nov 9, 2025)
  - Problema: `searchQuery` vs `search` en FilterOptions
  - Solución: Unificar a `search` en todos los componentes
  
- ✅ **Fix dimensiones intuitivas** (Nov 9, 2025)
  - Problema: Vertical mostraba 20x25 (confuso)
  - Solución: Mostrar 25x20 (alto x ancho) para vertical

### Pendientes 🔄
- Ninguno reportado

---

## 📚 ARCHIVOS CLAVE PARA SIGUIENTE SESIÓN

### Configuración
- `lib/firebase.ts` - Configuración de Firebase
- `.env.local` - Variables de entorno
- `firestore.rules` - Reglas de seguridad Firestore
- `storage.rules` - Reglas de Storage

### Tipos
- `types/index.ts` - Todas las interfaces TypeScript

### Contextos
- `contexts/AuthContext.tsx` - Autenticación y admin claims
- `contexts/CartContext.tsx` - Carrito de compras
- `contexts/WishlistContext.tsx` - Lista de deseos

### Componentes Principales
- `components/Header.tsx` - Navegación y notificaciones
- `components/FilterBar.tsx` - Filtros y búsqueda
- `components/PaintingCard.tsx` - Card de obra
- `components/ImageGallery.tsx` - Galería múltiple
- `components/ReviewSection.tsx` - Reseñas

### Páginas Admin
- `app/admin/page.tsx` - Dashboard admin
- `app/admin/paintings/page.tsx` - Gestión de obras
- `app/admin/orders/page.tsx` - Pedidos personalizados
- `app/admin/orders-store/page.tsx` - Órdenes de compra
- `app/admin/reviews/page.tsx` - Moderación de reseñas
- `app/admin/coupons/page.tsx` - Gestión de cupones
- `app/admin/analytics/page.tsx` - Dashboard analytics

### Páginas Cliente
- `app/page.tsx` - Galería principal
- `app/obra/[id]/page.tsx` - Detalle de obra
- `app/obra-a-pedido/page.tsx` - Obras personalizadas
- `app/carrito/page.tsx` - Carrito
- `app/checkout/page.tsx` - Checkout
- `app/profile/page.tsx` - Perfil de usuario
- `app/wishlist/page.tsx` - Lista de deseos

### SEO
- `lib/metadata.ts` - Sistema de metadata
- `app/sitemap.ts` - Generación de sitemap
- `app/robots.ts` - Configuración robots.txt
- `SEO_IMPLEMENTATION.md` - Documentación SEO

---

## 🎨 DISEÑO Y TEMA

### Estilo: Brutalist Design
- Bordes negros gruesos (4px)
- Sombras pronunciadas (`shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`)
- Contraste alto (negro sobre blanco)
- Acentos en rojo (#dc2626) y amarillo (#fef3c7)
- Sin gradientes suaves, solo bloques sólidos
- Tipografía bold y black

### Colores Principales
- **Negro:** `#000000` - Bordes y texto
- **Blanco:** `#FFFFFF` - Fondos
- **Rojo:** `#dc2626` (red-600) - CTAs y acentos
- **Amarillo:** `#fef3c7` (yellow-50) - Highlights
- **Gris:** `#6b7280` (gray-500) - Texto secundario

---

## 🔐 SEGURIDAD Y AUTENTICACIÓN

### Firebase Custom Claims
- **Admin:** Acceso completo al panel
- Script: `set-admin-role.js`
- Comando: `node set-admin-role.js`

### Reglas de Firestore
- `paintings`: Read público, Write solo admin
- `customOrders`: Read/Write usuario autenticado
- `orders`: Read/Write usuario autenticado (solo propias)
- `reviews`: Read todos, Write autenticados, Update solo admin
- `wishlist`: Read/Write solo propietario
- `coupons`: Read todos, Write solo admin

---

## 🚀 COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev              # http://localhost:3000

# Build y Deploy
npm run build           # Compilar producción
npm start               # Servidor producción

# Admin
node set-admin-role.js  # Asignar rol admin

# Git
git add .
git commit -m "mensaje"
git push origin main
```

---

## 📞 CONTACTO Y SOPORTE

- WhatsApp: Configurado en `.env.local`
- Firebase Project: bruisedartrash
- GitHub: felipevega-dev/BruisedStore

---

**ÚLTIMA ACTUALIZACIÓN:** 9 de Noviembre 2025
**ESTADO:** ✅ 4 Sprints completados - Listo para Sprint 5
**BUILD:** ✅ Compilación exitosa sin errores

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

### **SPRINT 3 - COMPLETADO ✅**

#### ✅ 8. Sistema de Cupones y Descuentos
- [x] Colección `coupons` en Firestore
- [x] Página `/admin/coupons` para gestión completa
- [x] Tipos: percentage/fixed
- [x] Validación en checkout con feedback visual
- [x] Restricciones: minPurchase, maxDiscount, expiryDate
- [x] Límite de usos con contador automático

#### ✅ 9. Galería de Imágenes Múltiples
- [x] Interface `Painting` con `images: string[]`
- [x] Componente `ImageGallery` con thumbnails
- [x] Upload múltiple en admin con drag & drop
- [x] Preview y eliminación individual de imágenes

#### ✅ 10. Dashboard con Analytics
- [x] Página `/admin/analytics` con métricas
- [x] Ventas totales, pedidos, obras, reseñas pendientes
- [x] Gráfico de órdenes por estado (recharts)
- [x] Top 5 obras más vendidas con revenue

---

### **SPRINT 4 - COMPLETADO ✅**

#### ✅ 11. SEO y Performance
- [x] Sistema `lib/metadata.ts` con Open Graph y Twitter Cards
- [x] JSON-LD Schema.org (Product + ArtGallery)
- [x] Sitemap.xml y robots.txt dinámicos
- [x] Viewport optimization y font display swap
- [x] Documentación en `SEO_IMPLEMENTATION.md`

#### ✅ 12. Bug Fixes
- [x] Fix filtros (maxPrice: 0 no filtra pinturas)
- [x] Fix build TypeScript (searchQuery → search)
- [x] Fix dimensiones intuitivas (vertical: 25x20)
- [x] Redesign obra-a-pedido (blanco, preview 8x)

---

## 📋 TESTING CHECKLIST

### Cliente
- [ ] Ver galería y filtrar por categoría/precio
- [ ] Buscar obras por título
- [ ] Agregar obras al carrito
- [ ] Aplicar cupón de descuento en checkout
- [ ] Completar compra y recibir confirmación
- [ ] Ver historial en perfil
- [ ] Agregar/quitar de wishlist
- [ ] Dejar reseña en una obra

### Admin
- [ ] Login como admin
- [ ] Ver notificaciones en tiempo real
- [ ] Gestionar pinturas (CRUD + múltiples imágenes)
- [ ] Ver y actualizar órdenes de compra
- [ ] Ver y actualizar pedidos personalizados
- [ ] Moderar reseñas (aprobar/ocultar/eliminar)
- [ ] Crear y gestionar cupones
- [ ] Ver analytics y métricas

---

## 🔧 TROUBLESHOOTING

### Build Errors
```bash
# Si hay errores de TypeScript
npm run build

# Verificar tipos
npx tsc --noEmit
```

### Firebase Connection
```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_FIREBASE_API_KEY

# Reiniciar servidor
npm run dev
```

### Git Issues
```bash
# Ver estado
git status

# Descartar cambios
git checkout -- .

# Pull latest
git pull origin main
```

---

## 📚 RECURSOS Y DOCUMENTACIÓN

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks](https://react.dev/reference/react)

---

**FIN DEL DOCUMENTO**
**Listo para continuar con SPRINT 5 en nuevo chat** 🚀
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

---

**FIN DEL DOCUMENTO**
**Última actualización: 9 de Noviembre 2025**
**Estado: ✅ 4 Sprints completados - Listo para Sprint 5**
**Build: ✅ Compilación exitosa sin errores**
