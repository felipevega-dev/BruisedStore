# Guía de Configuración - Bruised Art Store

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Cuenta de Firebase

## 🚀 Instalación

1. **Clonar el repositorio** (si aplica)
```bash
git clone <tu-repo>
cd bruisedstore
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

El archivo `.env.local` ya está creado con las credenciales de Firebase. Verifica que contenga:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCtw-OIZwB5-S83B1QCuzf9o2ZpEgaHlHo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bruisedartrash.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bruisedartrash
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bruisedartrash.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=727208982001
NEXT_PUBLIC_FIREBASE_APP_ID=1:727208982001:web:645abe953f37714f140050
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-7DTG2GYXTJ
```

## 🔥 Configuración de Firebase

### 1. Firestore Database

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **bruisedartrash**
3. Ve a **Firestore Database** en el menú lateral
4. Click en **Reglas** (Rules)
5. Copia y pega el contenido del archivo `firestore.rules`:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Reglas para paintings
    match /paintings/{paintingId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }

    // Reglas para custom orders
    match /customOrders/{orderId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

6. Click en **Publicar** (Publish)

### 2. Storage

1. Ve a **Storage** en el menú lateral
2. Click en **Reglas** (Rules)
3. Copia y pega el contenido del archivo `storage.rules`:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    match /paintings/{allPaths=**} {
      allow read: if true;
      allow create, delete: if request.auth != null;
    }

    match /custom-orders/{allPaths=**} {
      allow create: if true;
      allow read: if true;
      allow delete: if request.auth != null;
    }
  }
}
```

4. Click en **Publicar** (Publish)

### 3. Authentication

1. Ve a **Authentication** en el menú lateral
2. Click en **Sign-in method**
3. Habilita **Email/Password**
4. Ve a la pestaña **Users**
5. Click en **Add user**
6. Crea un usuario administrador:
   - Email: `admin@bruisedart.com` (o el que prefieras)
   - Password: (contraseña segura)
7. Guarda estas credenciales, las necesitarás para acceder al panel de administración

## 🏃 Ejecutar el Proyecto

### Modo Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Modo Producción
```bash
npm run build
npm start
```

## 🎨 Usar la Aplicación

### Como Usuario

1. **Ver pinturas**: Visita [http://localhost:3000](http://localhost:3000)
2. **Ver detalle**: Click en cualquier pintura
3. **Agregar al carrito**: Click en "Agregar" en la tarjeta o detalle
4. **Obra a pedido**: Click en "Obra a Pedido" en el header
5. **Ver carrito**: Click en el ícono del carrito en el header

### Como Administrador

1. **Acceder al panel**: Visita [http://localhost:3000/admin](http://localhost:3000/admin)
2. **Login**: Usa las credenciales creadas en Firebase Authentication
3. **Gestionar pinturas**:
   - Click en "Gestionar Pinturas"
   - Click en "Nueva Pintura" para agregar
   - Click en "Editar" para modificar
   - Click en el ícono de basura para eliminar
4. **Gestionar pedidos**:
   - Click en "Pedidos Personalizados"
   - Selecciona un pedido de la lista
   - Actualiza el estado según corresponda
   - Elimina pedidos si es necesario

## 📁 Estructura de Archivos Importantes

```
bruisedstore/
├── app/                      # Páginas y rutas
│   ├── admin/               # Panel de administración
│   ├── carrito/             # Carrito de compras
│   ├── obra/[id]/           # Detalle de pintura
│   ├── obra-a-pedido/       # Formulario personalizado
│   └── page.tsx             # Página principal
├── components/              # Componentes reutilizables
├── contexts/                # Context API (CarritoContext)
├── lib/                     # Configuración (Firebase)
├── types/                   # Tipos TypeScript
├── .env.local              # Variables de entorno (NO SUBIR A GIT)
├── firestore.rules         # Reglas de Firestore
├── storage.rules           # Reglas de Storage
└── Claude.md               # Documentación completa
```

## 🐛 Solución de Problemas

### Error: Firebase not initialized
- Verifica que el archivo `.env.local` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: Permission denied (Firestore/Storage)
- Verifica que las reglas de seguridad estén correctamente aplicadas en Firebase Console
- Asegúrate de estar autenticado si estás accediendo a funciones de admin

### Imágenes no se cargan
- Verifica que `next.config.ts` tenga configurado `firebasestorage.googleapis.com` en `remotePatterns`
- Verifica que las reglas de Storage permitan lectura pública

### No puedo hacer login en admin
- Verifica que el usuario existe en Firebase Authentication
- Verifica el email y contraseña
- Revisa la consola del navegador para errores

## 📝 Notas Importantes

- **NO** subas `.env.local` a Git
- Las imágenes se guardan en Firebase Storage, no localmente
- El carrito se guarda en localStorage del navegador
- Para producción, configura las reglas de seguridad más estrictas
- Considera implementar rate limiting para prevenir abuso

## 🚢 Deploy a Producción

### Vercel (Recomendado para Next.js)

1. Instala Vercel CLI: `npm i -g vercel`
2. Ejecuta: `vercel`
3. Sigue las instrucciones
4. Agrega las variables de entorno en el dashboard de Vercel

### Otros Proveedores

- Netlify
- Firebase Hosting
- Railway
- Render

Recuerda siempre configurar las variables de entorno en el proveedor de hosting.

## 📞 Contacto

Para dudas o soporte, consulta el archivo `Claude.md` con la documentación completa.
