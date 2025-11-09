# 🎨 Bruised Art - Tienda Online de Pinturas

Tienda online de pinturas inspirada en [theberserkerart.cl](https://www.theberserkerart.cl/), construida con Next.js 16, TypeScript, Tailwind CSS y Firebase.

## ✨ Características

- 🖼️ Galería de pinturas con grid responsivo
- 🛒 Carrito de compras con persistencia
- 🎨 Formulario de obras a pedido con preview
- 👤 Panel de administración completo
- 📱 Diseño completamente responsivo
- 🔥 Backend con Firebase (Firestore + Storage + Auth)

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

**⚠️ IMPORTANTE:** Debes configurar Firebase antes de usar la aplicación.

Lee y sigue las instrucciones en: **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📚 Documentación

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Configuración paso a paso de Firebase
- **[SETUP.md](./SETUP.md)** - Guía completa de instalación y configuración
- **[Claude.md](./Claude.md)** - Documentación técnica detallada
- **[TEST_DATA.md](./TEST_DATA.md)** - Datos de prueba y casos de uso

## 🏗️ Stack Tecnológico

- **Framework:** Next.js 16.0.1
- **UI:** React 19.2.0
- **Lenguaje:** TypeScript 5
- **Estilos:** Tailwind CSS 4.1.17
- **Backend:** Firebase 12.5.0
  - Firestore (Base de datos)
  - Storage (Almacenamiento de imágenes)
  - Authentication (Autenticación)
- **Iconos:** Lucide React

## 📁 Estructura del Proyecto

```
bruisedstore/
├── app/                          # Páginas (App Router)
│   ├── admin/                   # Panel de administración
│   │   ├── page.tsx            # Dashboard + Login
│   │   ├── paintings/          # CRUD de pinturas
│   │   └── orders/             # Gestión de pedidos
│   ├── carrito/                # Carrito de compras
│   ├── obra/[id]/              # Detalle de pintura
│   ├── obra-a-pedido/          # Formulario personalizado
│   └── page.tsx                # Galería principal
├── components/                  # Componentes reutilizables
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── PaintingCard.tsx
├── contexts/                    # Context API
│   └── CartContext.tsx
├── lib/                        # Configuración
│   └── firebase.ts
├── types/                      # Tipos TypeScript
│   └── index.ts
├── .env.local                  # Variables de entorno
├── firestore.rules            # Reglas de Firestore
└── storage.rules              # Reglas de Storage
```

## 🎯 Funcionalidades Principales

### Público
- Ver galería de pinturas
- Ver detalle de cada obra
- Agregar pinturas al carrito
- Gestionar carrito (cantidades, eliminar)
- Crear pedidos de obras personalizadas

### Administrador
- Login con Firebase Auth
- Gestionar pinturas (Crear, Editar, Eliminar)
- Ver pedidos personalizados
- Actualizar estado de pedidos
- Upload de imágenes a Firebase Storage

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint
```

## 🌐 Rutas Principales

- `/` - Galería principal
- `/obra/[id]` - Detalle de pintura
- `/obra-a-pedido` - Formulario de obra personalizada
- `/carrito` - Carrito de compras
- `/admin` - Panel de administración (requiere login)
- `/admin/paintings` - Gestión de pinturas
- `/admin/orders` - Gestión de pedidos

## 🔐 Configuración de Admin

1. Ve a Firebase Console > Authentication
2. Crea un usuario con email y contraseña
3. Usa esas credenciales en `/admin`

Detalles completos en [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 🎨 Tamaños y Precios (Obra a Pedido)

| Tamaño | Precio (CLP) |
|--------|-------------|
| 20x30 cm | $145.000 |
| 30x40 cm | $217.500 |
| 40x50 cm | $290.000 |
| 50x70 cm | $435.000 |
| 70x100 cm | $652.500 |

## 📱 Responsive Design

- **Mobile:** 1 columna
- **Tablet (sm):** 2 columnas
- **Desktop (lg):** 3 columnas
- **Desktop XL:** 4 columnas

## 🚢 Deploy a Producción

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

No olvides configurar las variables de entorno en Vercel Dashboard.

### Otros Proveedores
- Netlify
- Firebase Hosting
- Railway
- Render

## 📝 Variables de Entorno

Archivo `.env.local` (ya creado):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## 🐛 Solución de Problemas

Ver sección completa en [SETUP.md](./SETUP.md#-solución-de-problemas)

## 📄 Licencia

Este proyecto fue creado para Bruised Art.

## 🤝 Contribuir

Para contribuir al proyecto, consulta la documentación técnica en [Claude.md](./Claude.md)
