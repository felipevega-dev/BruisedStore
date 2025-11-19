# 📧 Firebase Functions - Email System

## ✅ Instalación Completada

- ✅ Firebase Functions inicializadas
- ✅ Resend instalado
- ✅ API Key configurada

## 🚀 Configuración Final

### 1. Configurar Variables de Entorno en Firebase

Ejecuta estos comandos para configurar las variables en producción:

```bash
cd functions
firebase functions:config:set resend.api_key="re_WQ5seSjE_MybXrHuYPkBaUZPLBsTGtd3A"
firebase functions:config:set site.url="https://bruisedstore.web.app"
```

### 2. Verificar Dominio en Resend

**IMPORTANTE:** Antes de enviar emails, necesitas verificar tu dominio en Resend.

#### Opción A: Usar dominio personalizado (RECOMENDADO)
1. Ve a https://resend.com/domains
2. Agrega tu dominio (ej: `bruisedart.com`)
3. Configura los registros DNS que te proporciona Resend
4. Espera la verificación (5-10 minutos)

Luego actualiza el email "from" en `functions/src/index.ts`:
```typescript
from: "José Vega Art <noreply@tudominio.com>"
```

#### Opción B: Usar dominio de prueba (para testing)
Resend te da un dominio de prueba: `onboarding@resend.dev`
Solo puedes enviar emails a tu propio email para testing.

### 3. Compilar el Código

```bash
cd functions
npm run build
```

### 4. Desplegar Functions

```bash
firebase deploy --only functions
```

Esto desplegará 4 funciones:
- ✉️ `onOrderCreated` - Email de confirmación de compra
- 📦 `onOrderStatusUpdated` - Email cuando cambia estado de orden
- 🎨 `onCustomOrderCreated` - Email de confirmación de obra personalizada
- 🖼️ `onCustomOrderStatusUpdated` - Email cuando cambia estado de obra personalizada

## 📊 Ver Logs

### En tiempo real:
```bash
firebase functions:log
```

### En Firebase Console:
https://console.firebase.google.com/project/bruisedartrash-f7384/functions/logs

### En Resend Dashboard:
https://resend.com/emails

## 🧪 Testing Local

### 1. Iniciar emuladores:
```bash
firebase emulators:start --only functions,firestore
```

### 2. Actualizar `.env.local` para testing:
Crea `functions/.env.local` con:
```
RESEND_API_KEY=re_WQ5seSjE_MybXrHuYPkBaUZPLBsTGtd3A
SITE_URL=http://localhost:3000
```

### 3. Probar creando una orden de prueba en tu app local

## 📧 Emails Implementados

### 1. Confirmación de Compra (onOrderCreated)
**Trigger:** Cuando se crea un documento en `orders/{orderId}`

**Incluye:**
- ✅ Lista de items comprados
- 💰 Subtotal, descuento, envío, total
- 📍 Dirección de envío
- 💳 Datos bancarios (si es transferencia)
- 🔗 Link para ver detalle del pedido

### 2. Actualización de Estado (onOrderStatusUpdated)
**Trigger:** Cuando cambia el campo `status` en `orders/{orderId}`

**Estados soportados:**
- ✅ `confirmed` - Pedido confirmado
- 📦 `processing` - Preparando pedido
- 🚚 `shipped` - Pedido enviado
- 🎉 `delivered` - Pedido entregado
- ❌ `cancelled` - Pedido cancelado

### 3. Confirmación de Obra Personalizada (onCustomOrderCreated)
**Trigger:** Cuando se crea un documento en `customOrders/{orderId}`

**Incluye:**
- 🎨 Detalles de la obra solicitada
- 📏 Tamaño y orientación
- 💰 Precio estimado
- 📝 Notas del cliente

### 4. Actualización de Obra Personalizada (onCustomOrderStatusUpdated)
**Trigger:** Cuando cambia el campo `status` en `customOrders/{orderId}`

**Estados soportados:**
- 🎨 `in-progress` - Obra en proceso
- ✅ `completed` - Obra completada
- ❌ `cancelled` - Solicitud cancelada

## 🔧 Personalización

### Cambiar colores en los emails
Edita `functions/src/index.ts` y busca los colores:
- `#5B7F2D` - Verde principal (moss)
- `#1F5BA5` - Azul secundario (azure)

### Modificar plantillas
Las plantillas HTML están en línea en cada función. Para cambiar el contenido, edita el string `html` en cada función.

### Agregar más triggers
Sigue el patrón de las funciones existentes:
```typescript
export const onAlgoCreated = onDocumentCreated(
  "coleccion/{id}",
  async (event) => {
    // Tu lógica aquí
  }
);
```

## 💰 Costos Estimados

### Resend (Free Tier):
- 📧 3,000 emails/mes gratis
- 📊 100 emails/día gratis

### Firebase Functions:
- 🆓 2M invocaciones/mes gratis
- 💻 400,000 GB-segundos gratis
- 💵 Después: ~$0.40 por millón de invocaciones

**Para bajo volumen (< 100 órdenes/mes): $0/mes**

## ❓ Troubleshooting

### Error: "Missing permissions"
Asegúrate de haber configurado las variables de entorno en Firebase:
```bash
firebase functions:config:get
```

### Error: "Invalid API key"
Verifica que la API key de Resend sea correcta:
```bash
firebase functions:config:set resend.api_key="tu_api_key"
```

### Emails no llegan
1. Verifica que el dominio esté verificado en Resend
2. Revisa los logs en Firebase Console
3. Revisa el dashboard de Resend
4. Verifica que el email del destinatario sea válido

### No se ejecutan las functions
1. Verifica que estén desplegadas: `firebase functions:list`
2. Revisa los logs: `firebase functions:log`
3. Verifica que los triggers coincidan con la estructura de Firestore

## 📚 Documentación

- [Resend Docs](https://resend.com/docs)
- [Firebase Functions v2](https://firebase.google.com/docs/functions/get-started?gen=2nd)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)

---

**Última actualización:** Noviembre 2024
