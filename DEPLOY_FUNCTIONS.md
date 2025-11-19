# 🚨 Error de Permisos al Desplegar Functions

## Problema
Firebase Functions requiere permisos IAM especiales para funcionar con Firestore triggers.

## ✅ Solución (Elige una)

### Opción 1: Desde Firebase Console (MÁS FÁCIL)

1. Ve a: https://console.firebase.google.com/project/bruisedartrash-f7384/settings/iam
2. Asegúrate de que tu cuenta tenga rol de **"Propietario"** o **"Editor"**
3. Vuelve a intentar el deploy:
```bash
firebase deploy --only functions
```

### Opción 2: Ejecutar comandos gcloud

Si tienes gcloud CLI instalado, ejecuta estos comandos:

```bash
gcloud projects add-iam-policy-binding bruisedartrash-f7384 --member=serviceAccount:service-705721057331@gcp-sa-pubsub.iam.gserviceaccount.com --role=roles/iam.serviceAccountTokenCreator

gcloud projects add-iam-policy-binding bruisedartrash-f7384 --member=serviceAccount:705721057331-compute@developer.gserviceaccount.com --role=roles/run.invoker

gcloud projects add-iam-policy-binding bruisedartrash-f7384 --member=serviceAccount:705721057331-compute@developer.gserviceaccount.com --role=roles/eventarc.eventReceiver
```

Luego:
```bash
firebase deploy --only functions
```

### Opción 3: Pedir permisos al propietario

Si no eres el propietario del proyecto Firebase, pídele que:
1. Te otorgue rol de **"Propietario"** en Firebase Console
2. O que ejecute el deploy por ti

## 🔍 Verificar tus permisos

Ve a: https://console.firebase.google.com/project/bruisedartrash-f7384/settings/iam

Deberías ver tu email con rol "Propietario" o "Editor".

---

## 📋 Estado Actual

- ✅ Código de Functions compilado
- ✅ Variables de entorno configuradas
- ✅ Resend API key: `re_WQ5seSjE_MybXrHuYPkBaUZPLBsTGtd3A`
- ✅ URL del sitio: `https://bruised-store.vercel.app`
- ❌ Permisos IAM faltantes

## ⏭️ Próximos pasos (después del deploy exitoso)

1. **Verificar dominio en Resend**
   - Ve a: https://resend.com/domains
   - Agrega tu dominio o usa el de prueba

2. **Probar emails**
   - Crea una orden de prueba en tu sitio
   - Verifica que llegue el email

3. **Ver logs**
   - Firebase Console: https://console.firebase.google.com/project/bruisedartrash-f7384/functions/logs
   - Resend Dashboard: https://resend.com/emails
