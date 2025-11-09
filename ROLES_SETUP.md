# 🔐 Configuración de Roles y Custom Claims

Este documento explica cómo configurar el sistema de roles usando Firebase Custom Claims para controlar el acceso al panel de administración.

## 📋 Requisitos Previos

1. Tener una cuenta de Firebase con acceso al proyecto
2. Tener Node.js instalado (para ejecutar el script)
3. Tener las credenciales de servicio de Firebase (Service Account Key)

## 🚀 Pasos para Asignar Rol de Admin

### Paso 1: Obtener Service Account Key

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **bruisedartrash**
3. Ve a **Configuración del proyecto** (ícono de engranaje)
4. Ve a la pestaña **Cuentas de servicio**
5. Click en **Generar nueva clave privada**
6. Guarda el archivo JSON en un lugar seguro (ej: `serviceAccountKey.json`)

### Paso 2: Instalar Dependencias

```bash
npm install firebase-admin
```

### Paso 3: Crear Script para Asignar Rol

Crea un archivo `set-admin-role.js` en la raíz del proyecto:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Función para asignar rol de admin
async function setAdminRole(userEmail) {
  try {
    // Obtener el usuario por email
    const user = await admin.auth().getUserByEmail(userEmail);
    
    // Asignar el custom claim de rol "admin"
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    
    console.log(`✅ Rol de admin asignado a: ${userEmail}`);
    console.log(`   UID: ${user.uid}`);
    console.log('\n⚠️ IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar sesión para que los cambios surtan efecto.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Obtener email del usuario desde argumentos de línea de comandos
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Por favor proporciona el email del usuario:');
  console.log('   node set-admin-role.js admin@bruisedart.com');
  process.exit(1);
}

setAdminRole(userEmail).then(() => process.exit(0));
```

### Paso 4: Ejecutar el Script

```bash
node set-admin-role.js admin@bruisedart.com
```

Reemplaza `admin@bruisedart.com` con el email del usuario al que quieres dar permisos de admin.

### Paso 5: Verificar el Rol

El usuario debe:
1. **Cerrar sesión** completamente
2. **Volver a iniciar sesión** para obtener el nuevo token con los custom claims
3. Una vez logueado, debería ver el botón "Admin" en el navbar

## 🛡️ Verificar Roles desde Firebase Console

También puedes verificar los custom claims desde Firebase Console:

1. Ve a **Authentication** > **Users**
2. Selecciona el usuario
3. En la sección **Custom claims**, deberías ver: `{"role": "admin"}`

## 📝 Notas Importantes

1. **Los custom claims están en el token JWT**: Cuando asignas un custom claim, este se incluye en el token de autenticación del usuario. El usuario debe cerrar sesión y volver a iniciar sesión para obtener un nuevo token.

2. **Seguridad**: Los custom claims se verifican tanto en el cliente como en las reglas de seguridad de Firebase. Esto proporciona una doble capa de seguridad.

3. **Múltiples Admins**: Puedes asignar el rol de admin a múltiples usuarios ejecutando el script para cada uno.

4. **Remover Rol de Admin**: Para remover el rol de admin, puedes usar este script:

```javascript
// En set-admin-role.js, cambia la línea:
await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
// Por:
await admin.auth().setCustomUserClaims(user.uid, { role: null });
```

## 🔒 Seguridad

- **Nunca** compartas el archivo `serviceAccountKey.json`
- **Nunca** lo subas a Git (debe estar en `.gitignore`)
- Los custom claims se verifican en:
  - **Cliente**: Para mostrar/ocultar el botón de admin
  - **Firestore Rules**: Para proteger las colecciones
  - **Storage Rules**: Para proteger las imágenes

## 🐛 Troubleshooting

### El usuario no ve el botón de Admin

1. Verifica que el custom claim esté asignado en Firebase Console
2. Asegúrate de que el usuario haya cerrado sesión y vuelto a iniciar sesión
3. Revisa la consola del navegador para errores
4. Verifica que el token tenga el claim: `tokenResult.claims.role === 'admin'`

### Error al ejecutar el script

1. Verifica que `serviceAccountKey.json` esté en la raíz del proyecto
2. Verifica que el email del usuario exista en Firebase Authentication
3. Asegúrate de tener Node.js instalado y las dependencias instaladas

## 📚 Referencias

- [Firebase Admin SDK - Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firestore Security Rules - Custom Claims](https://firebase.google.com/docs/firestore/security/rules-conditions#access_other_documents)

