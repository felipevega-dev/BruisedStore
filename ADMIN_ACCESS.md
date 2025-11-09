# 🔐 Acceso al Panel de Administración

## Cómo acceder al Admin Panel

### Paso 1: Crear usuario administrador en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **bruisedartrash**
3. En el menú lateral, click en **Authentication**
4. Click en la pestaña **Users**
5. Click en **Add user**
6. Completa:
   - **Email**: `admin@bruisedart.com` (o el que prefieras)
   - **Password**: Crea una contraseña segura (mínimo 6 caracteres)
7. Click en **Add user**
8. **GUARDA** estas credenciales en un lugar seguro

### Paso 2: Acceder al Panel

1. Inicia tu aplicación:
   ```bash
   npm run dev
   ```

2. En tu navegador, ve a:
   ```
   http://localhost:3000/admin
   ```

3. Verás la pantalla de login

4. Ingresa las credenciales que creaste:
   - Email: `admin@bruisedart.com`
   - Password: [tu contraseña]

5. Click en **Iniciar Sesión**

### Paso 3: Usar el Panel

Una vez dentro, verás 2 opciones:

#### 1. Gestionar Pinturas (`/admin/paintings`)
- Ver todas las pinturas
- **Crear nueva pintura**: Click en "Nueva Pintura"
  - Sube una imagen
  - Título, descripción, precio
  - Dimensiones (ancho x alto en cm)
  - Categoría (opcional)
  - Disponibilidad (marcar/desmarcar)
- **Editar pintura**: Click en "Editar"
- **Eliminar pintura**: Click en icono de basura

#### 2. Pedidos Personalizados (`/admin/orders`)
- Ver todos los pedidos de obra a pedido
- Click en un pedido para ver detalles completos
- Ver imagen de referencia
- Información del cliente
- Actualizar estado:
  - Pendiente (amarillo)
  - En Progreso (azul)
  - Completado (verde)
  - Cancelado (rojo)
- Eliminar pedidos

## URLs del Admin

- **Dashboard**: `http://localhost:3000/admin`
- **Gestión de Pinturas**: `http://localhost:3000/admin/paintings`
- **Pedidos Personalizados**: `http://localhost:3000/admin/orders`

## Cerrar Sesión

Click en el botón **"Cerrar Sesión"** en la parte superior derecha del panel.

## Producción

Cuando despliegues a producción, las URLs serán:
- `https://tu-dominio.com/admin`
- `https://tu-dominio.com/admin/paintings`
- `https://tu-dominio.com/admin/orders`

## Seguridad

- ⚠️ **NUNCA** compartas las credenciales del administrador
- El panel está protegido con Firebase Authentication
- Solo usuarios autenticados pueden:
  - Crear, editar o eliminar pinturas
  - Ver y gestionar pedidos personalizados
  - Subir imágenes a Firebase Storage

## Notas Importantes

1. **Primer Login**: Si es la primera vez que accedes, asegúrate de haber creado el usuario en Firebase Authentication

2. **Olvidaste la contraseña**:
   - Ve a Firebase Console > Authentication > Users
   - Encuentra tu usuario
   - Click en los 3 puntos > Reset password
   - Firebase enviará un email de recuperación

3. **Múltiples Administradores**:
   - Puedes crear varios usuarios administradores en Firebase
   - Cada uno debe tener su propio email y contraseña

4. **Problemas de Acceso**:
   - Verifica que el usuario existe en Firebase Authentication
   - Verifica que estás usando el email y contraseña correctos
   - Revisa la consola del navegador (F12) para ver errores
   - Asegúrate de que las reglas de Firebase están configuradas correctamente

## Ejemplo de Credenciales (para pruebas)

```
Email: admin@bruisedart.com
Password: Bruised2024!
```

**IMPORTANTE**: Cambia estas credenciales en producción por algo más seguro.
