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

### 1. Galería de Pinturas (Página Principal)
- Lista de todas las pinturas disponibles
- Grid responsivo (1-4 columnas según el dispositivo)
- Cards con imagen, título, dimensiones, precio
- Botón "Agregar al carrito"
- Indicador de "No disponible" para obras vendidas

### 2. Detalle de Pintura
- Imagen grande de la obra
- Información completa (título, descripción, dimensiones, precio, categoría)
- Botón para agregar al carrito
- Confirmación visual al agregar

### 3. Obra a Pedido
- Formulario para solicitar pinturas personalizadas
- Upload de imagen de referencia
- Selector de tamaños con preview
- Preview con dimensiones exactas del tamaño seleccionado
- Cálculo automático de precio según tamaño
- Campos: nombre, email, teléfono, notas adicionales
- Confirmación de envío exitoso

### 4. Carrito de Compras
- Lista de items agregados
- Control de cantidad (+/-)
- Eliminar items individuales
- Vaciar carrito completo
- Cálculo de total
- Resumen del pedido
- Persistencia en localStorage

### 5. Panel de Administración

#### Login
- Autenticación con Firebase Authentication
- Email y contraseña
- Protección de rutas

#### Gestión de Pinturas
- Ver todas las pinturas
- Crear nueva pintura (con upload de imagen)
- Editar pinturas existentes
- Eliminar pinturas
- Campos: título, descripción, precio, dimensiones (ancho x alto), categoría, disponibilidad

#### Gestión de Pedidos Personalizados
- Ver todos los pedidos
- Detalles completos de cada pedido
- Actualizar estado (Pendiente, En Progreso, Completado, Cancelado)
- Eliminar pedidos
- Vista de imagen de referencia
- Información del cliente

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

### Storage

- **paintings/** - Imágenes de las pinturas en la galería
- **custom-orders/** - Imágenes de referencia de pedidos personalizados

### Reglas de Seguridad

Debes aplicar las reglas en la consola de Firebase:

**Firestore:** Copia el contenido de `firestore.rules`
**Storage:** Copia el contenido de `storage.rules`

## Configuración del Administrador

1. Ve a Firebase Console > Authentication
2. Crea un usuario con email y contraseña
3. Usa esas credenciales para acceder a `/admin`

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

## Próximos Pasos Sugeridos

1. Integrar pasarela de pago (Mercado Pago, WebPay, etc.)
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

## Soporte

Para cualquier duda o problema, revisar:
- Documentación de Next.js 16: https://nextjs.org/docs
- Documentación de Firebase: https://firebase.google.com/docs
- Documentación de Tailwind CSS: https://tailwindcss.com/docs
