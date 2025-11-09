# Configuración de Firebase - Paso a Paso

## ⚠️ IMPORTANTE: Debes completar estos pasos antes de usar la aplicación

## 1. Acceder a Firebase Console

1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Busca y selecciona el proyecto: **bruisedartrash**

---

## 2. Configurar Firestore Database

### Paso 1: Habilitar Firestore (si no está habilitado)
1. En el menú lateral, click en **Firestore Database**
2. Si no está creado, click en **Crear base de datos**
3. Selecciona **Modo de producción**
4. Elige la ubicación más cercana (ej: `southamerica-east1` para Chile)
5. Click en **Habilitar**

### Paso 2: Configurar Reglas de Seguridad
1. Ve a la pestaña **Reglas** (Rules)
2. **BORRA** todo el contenido actual
3. **COPIA Y PEGA** exactamente esto:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Reglas para paintings
    match /paintings/{paintingId} {
      // Cualquiera puede leer las pinturas
      allow read: if true;

      // Solo usuarios autenticados pueden escribir/actualizar/eliminar
      allow create, update, delete: if request.auth != null;
    }

    // Reglas para custom orders
    match /customOrders/{orderId} {
      // Cualquiera puede crear pedidos personalizados
      allow create: if true;

      // Solo usuarios autenticados pueden leer/actualizar/eliminar
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

4. Click en **Publicar** (Publish)
5. Confirma los cambios

---

## 3. Configurar Firebase Storage

### Paso 1: Habilitar Storage (si no está habilitado)
1. En el menú lateral, click en **Storage**
2. Si no está creado, click en **Comenzar**
3. Acepta las condiciones
4. Elige la misma ubicación que Firestore
5. Click en **Listo**

### Paso 2: Configurar Reglas de Seguridad
1. Ve a la pestaña **Reglas** (Rules)
2. **BORRA** todo el contenido actual
3. **COPIA Y PEGA** exactamente esto:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    // Reglas para imágenes de pinturas
    match /paintings/{allPaths=**} {
      // Cualquiera puede leer
      allow read: if true;

      // Solo usuarios autenticados pueden subir/eliminar
      allow create, delete: if request.auth != null;
    }

    // Reglas para imágenes de pedidos personalizados
    match /custom-orders/{allPaths=**} {
      // Cualquiera puede subir (para el formulario público)
      allow create: if true;

      // Cualquiera puede leer
      allow read: if true;

      // Solo usuarios autenticados pueden eliminar
      allow delete: if request.auth != null;
    }
  }
}
```

4. Click en **Publicar** (Publish)
5. Confirma los cambios

---

## 4. Configurar Authentication

### Paso 1: Habilitar Email/Password
1. En el menú lateral, click en **Authentication**
2. Click en **Get started** (si es la primera vez)
3. Ve a la pestaña **Sign-in method**
4. Click en **Email/Password**
5. **Habilita** el primer switch (Email/Password)
6. **NO habilites** "Email link (passwordless sign-in)"
7. Click en **Guardar**

### Paso 2: Crear Usuario Administrador
1. Ve a la pestaña **Users**
2. Click en **Add user**
3. Completa los datos:
   - **Email**: Elige un email (ej: `admin@bruisedart.com`)
   - **Password**: Crea una contraseña SEGURA (mínimo 6 caracteres)
4. Click en **Add user**
5. **IMPORTANTE**: Anota estas credenciales en un lugar seguro

**Ejemplo de credenciales:**
```
Email: admin@bruisedart.com
Password: [TU_CONTRASEÑA_SEGURA]
```

---

## 5. Verificar Configuración

### Checklist de Verificación:

- [ ] Firestore Database está creado
- [ ] Reglas de Firestore están configuradas
- [ ] Storage está habilitado
- [ ] Reglas de Storage están configuradas
- [ ] Authentication está habilitado con Email/Password
- [ ] Usuario administrador está creado
- [ ] Credenciales guardadas en lugar seguro

---

## 6. Probar la Configuración

Una vez completados los pasos anteriores:

1. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Prueba la aplicación:**
   - Ve a [http://localhost:3000](http://localhost:3000)
   - Deberías ver la página principal (vacía por ahora, sin pinturas)
   - Ve a [http://localhost:3000/admin](http://localhost:3000/admin)
   - Inicia sesión con las credenciales del administrador
   - Deberías poder acceder al panel de administración

3. **Crea tu primera pintura:**
   - En el panel de admin, click en "Gestionar Pinturas"
   - Click en "Nueva Pintura"
   - Completa el formulario y sube una imagen
   - Guarda
   - Vuelve a la página principal y deberías ver la pintura

---

## 7. Solución de Problemas Comunes

### Error: "Missing or insufficient permissions"
**Solución:** Las reglas de Firestore o Storage no están correctamente configuradas.
- Verifica que copiaste las reglas EXACTAMENTE como se muestran arriba
- Asegúrate de hacer click en "Publicar" después de pegar las reglas

### Error: "Auth/invalid-email" o "Auth/wrong-password"
**Solución:** Las credenciales son incorrectas.
- Verifica el email y contraseña que creaste
- Asegúrate de que el usuario existe en Authentication > Users

### Las imágenes no se muestran
**Solución:** Problema con Storage o Next.js config.
- Verifica las reglas de Storage
- Verifica que `next.config.ts` tenga configurado `firebasestorage.googleapis.com`
- Reinicia el servidor de desarrollo

### Error: "Firebase App not initialized"
**Solución:** Variables de entorno no cargadas.
- Verifica que `.env.local` existe en la raíz del proyecto
- Reinicia el servidor de desarrollo completamente
- Verifica que las variables comienzan con `NEXT_PUBLIC_`

---

## 8. Configuración de Índices (Opcional pero Recomendado)

Si ves errores sobre "índices" en la consola:

1. Ve a **Firestore Database** > **Índices** (Indexes)
2. Firebase normalmente te dará un link directo para crear el índice necesario
3. Click en el link y confirma la creación
4. Espera unos minutos a que se complete

---

## 9. Configuración Adicional de Seguridad (Producción)

Para producción, considera:

1. **Habilitar App Check:**
   - Ve a **App Check** en el menú lateral
   - Configura reCAPTCHA para web

2. **Configurar Límites de Uso:**
   - Ve a **Firestore Database** > **Uso**
   - Configura alertas de uso

3. **Reglas más estrictas:**
   - Limita el tamaño de archivos en Storage
   - Agrega validación de datos en Firestore

---

## ✅ Configuración Completa

Si llegaste hasta aquí, ¡felicidades! Tu aplicación está completamente configurada y lista para usar.

**Próximos pasos:**
1. Crea algunas pinturas de prueba desde el panel de admin
2. Prueba el formulario de obra a pedido
3. Prueba agregar items al carrito
4. Explora todas las funcionalidades

**Para deploy a producción:**
- Consulta el archivo `SETUP.md`
- No olvides configurar las variables de entorno en tu proveedor de hosting
