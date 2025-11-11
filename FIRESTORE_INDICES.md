# Configuración de Índices en Firestore

## Problema: Las reseñas no se muestran

Si las reseñas no se están mostrando, es probable que necesites crear un índice compuesto en Firestore.

## Solución

### Opción 1: Dejar que Firestore genere el índice automáticamente

1. Abre la consola del navegador (F12)
2. Intenta cargar una página de obra con el componente de reseñas
3. Busca un error en la consola que diga algo como: "The query requires an index"
4. Haz clic en el enlace que aparece en el error
5. Firestore te llevará directamente a crear el índice necesario
6. Espera unos minutos a que se complete la creación del índice

### Opción 2: Crear el índice manualmente

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Firestore Database**
4. Haz clic en la pestaña **Indexes** (Índices)
5. Haz clic en **Create Index** (Crear índice)
6. Configura el índice:
   - **Collection ID**: `reviews`
   - **Fields to index**:
     - Campo 1: `paintingId` - Ascending
     - Campo 2: `createdAt` - Descending
   - **Query scopes**: Collection
7. Haz clic en **Create**
8. Espera a que el estado cambie de "Building" a "Enabled"

## ¿Por qué se necesita este índice?

Firestore requiere índices compuestos cuando haces consultas que:
- Filtran por un campo (`where("paintingId", "==", ...)`)
- Y ordenan por otro campo diferente (`orderBy("createdAt", "desc")`)

## Verificar que funciona

1. Una vez creado el índice, recarga la página de la obra
2. Deberías ver las reseñas aparecer
3. Si dejaste una reseña de prueba, deberías verla con fondo amarillo si no está aprobada
4. Las reseñas aprobadas aparecen con fondo blanco

## Alternativa temporal (sin orderBy)

Si no quieres esperar a que se cree el índice, puedes modificar el código para no usar `orderBy` en la query, pero esto significa que las reseñas no estarán ordenadas por fecha en el servidor:

```typescript
// En ReviewSection.tsx, línea ~40
const reviewsQuery = query(
  reviewsRef,
  where("paintingId", "==", paintingId)
  // Comentar esta línea temporalmente:
  // orderBy("createdAt", "desc")
);
```

Luego ordenar en el cliente:
```typescript
const reviewsData = snapshot.docs
  .map((doc) => ({ ... }))
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
```

Pero es mejor crear el índice para tener mejor rendimiento.

## Logs para Debugging

He agregado console.logs en el componente ReviewSection para ayudar a debuggear:

```typescript
console.log("No reviews found for painting:", paintingId);
console.log("Reviews fetched:", reviewsData.length);
console.log("Filtered reviews:", filteredReviews.length);
```

Revisa la consola del navegador para ver estos mensajes y entender qué está pasando.

## Estado Actual

✅ El componente ReviewSection está correctamente implementado
✅ Muestra feedback visual cuando el usuario deja una reseña
✅ Las reseñas pendientes se muestran con fondo amarillo
✅ Solo el autor puede ver su propia reseña pendiente
✅ Las reseñas aprobadas son visibles para todos

🔧 Solo falta configurar el índice en Firestore para que la query funcione.
