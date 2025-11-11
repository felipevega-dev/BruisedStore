# Guía de Personalización del Home

## 🎨 Sistema de Personalización de la Página Principal

Esta guía explica cómo usar el nuevo sistema de personalización del home page de la galería José Vega.

---

## 📋 Características Implementadas

### ✅ Banner Animado con Carrusel
- Carrusel infinito de pinturas enmarcadas
- Movimiento continuo horizontal (izquierda/derecha)
- Hasta 12 imágenes configurables
- Velocidad ajustable

### ✅ Header del Banner
- Foto de perfil del artista (opcional)
- Título principal editable (default: "José Vega")
- Subtítulo opcional
- Diseño responsive

### ✅ Sección de Contenido
- Texto editable con soporte para **Markdown**
- Video integrado con 3 opciones:
  - Instagram Reel (URL)
  - YouTube (URL)
  - Video subido (archivo)
- Layout responsive texto + video

### ✅ Admin Panel Completo
- Interfaz intuitiva para editar todo
- Vista previa en tiempo real
- Subida de imágenes drag & drop
- Validación de archivos

---

## 🚀 Cómo Usar el Sistema

### 1. Acceder al Panel de Administración

1. Ir a `/admin` e iniciar sesión con credenciales de administrador
2. Click en **"Configuración del Home"** (icono de casa)
3. O ir directamente a `/admin/home-settings`

---

### 2. Configurar el Banner

#### **Foto de Perfil**
1. Click en "Subir" o "Cambiar"
2. Seleccionar imagen (máx 5MB)
3. Recomendado: Foto cuadrada, mínimo 300x300px

#### **Título y Subtítulo**
- **Título Principal:** Nombre del artista (ej: "José Vega")
- **Subtítulo:** Opcional, descripción corta (ej: "Arte Contemporáneo")

#### **Imágenes del Carrusel**
1. Click en "Agregar Imágenes"
2. Seleccionar hasta 12 imágenes
3. Formato recomendado: 3:4 ratio (vertical)
4. Tamaño: 800-1200px de alto
5. Para eliminar: Hover sobre imagen → Click en X

**Imágenes por Defecto:**
El sistema usa automáticamente las imágenes de `/public/img`:
- clown.jpg
- drag.jpg
- elfenlied.jpg
- felix.jpg
- lady.jpg
- wow.jpg

---

### 3. Configurar Contenido Principal

#### **Título de Sección**
- Título para la sección de contenido
- Ejemplo: "Bienvenido a mi Galería"

#### **Texto de Contenido (Markdown)**
Soporta formato Markdown:
```markdown
**Negrita** para enfatizar
*Cursiva* para énfasis
### Subtítulos
- Listas
- Con viñetas
1. Listas
2. Numeradas
```

**Ejemplo:**
```markdown
Explora mi colección de **obras únicas**. Cada pieza cuenta una historia.

### Mi Proceso Creativo
- Inspiración en la naturaleza
- Técnicas mixtas
- Expresión emocional

*"El arte es la expresión del alma"*
```

---

### 4. Configurar Video

#### **Opción 1: Instagram Reel**
1. Seleccionar "Instagram Reel" en el dropdown
2. Copiar URL del reel desde Instagram:
   - Ejemplo: `https://www.instagram.com/reel/ABC123xyz/`
3. Pegar en el campo "URL del Video"

#### **Opción 2: YouTube**
1. Seleccionar "YouTube"
2. Copiar URL del video:
   - Ejemplo: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. Pegar en el campo

#### **Opción 3: Subir Video**
1. Seleccionar "Subir Video"
2. Click en "Seleccionar Video"
3. Elegir archivo (máx 50MB)
4. Formatos soportados: MP4, MOV, AVI
5. Recomendado: 9:16 ratio (vertical, estilo Reel)

#### **Opción 4: Sin Video**
- Seleccionar "Sin Video"
- Solo se mostrará el texto

---

### 5. Estilo de Fondo

Opciones de fondo para la sección de contenido:

- **Gris:** Gradiente gris moderno (default)
- **Libro:** Beige/crema, estilo papel antiguo
- **Oscuro:** Negro/gris oscuro
- **Claro:** Blanco/gris muy claro

---

### 6. Guardar Cambios

1. Click en **"Guardar"**
2. El sistema subirá:
   - Nueva foto de perfil (si se cambió)
   - Nuevas imágenes del banner
   - Video (si se subió archivo)
3. Los cambios se verán instantáneamente en el home

---

## 🎬 Flujo de Trabajo Recomendado

### Configuración Inicial

1. **Banner:**
   - Subir foto de perfil del artista
   - Agregar 6-10 imágenes de obras destacadas
   - Configurar título y subtítulo

2. **Contenido:**
   - Escribir texto de bienvenida (2-3 párrafos)
   - Agregar video de Instagram o YouTube
   - Elegir estilo de fondo

3. **Vista Previa:**
   - Click en "Vista Previa" (abre en nueva pestaña)
   - Verificar que todo se vea bien en móvil y desktop

4. **Guardar:**
   - Click en "Guardar"
   - Confirmar que los cambios se aplicaron

---

### Actualización Periódica

**Mensual:**
- Actualizar video con nuevo reel
- Cambiar 2-3 imágenes del carrusel
- Actualizar texto con noticias/eventos

**Trimestral:**
- Renovar todas las imágenes del carrusel
- Actualizar foto de perfil si cambió
- Revisar y optimizar texto

---

## 📱 Responsive Design

El sistema es completamente responsive:

### **Móvil (< 640px)**
- Banner altura: 70vh
- Foto perfil: 128px
- Carrusel visible pero reducido
- Contenido en columna única
- Video debajo del texto

### **Tablet (640px - 1024px)**
- Banner altura: 70vh
- Foto perfil: 160px
- Contenido en 2 columnas

### **Desktop (> 1024px)**
- Banner altura: 70vh
- Foto perfil: 160px
- Layout optimizado texto + video lado a lado

---

## 🔧 Especificaciones Técnicas

### Límites de Archivos

| Tipo | Tamaño Máximo | Formatos |
|------|---------------|----------|
| Foto de Perfil | 5 MB | JPG, PNG, WEBP |
| Imágenes Banner | 10 MB cada una | JPG, PNG, WEBP |
| Video Subido | 50 MB | MP4, MOV, AVI |

### Dimensiones Recomendadas

| Elemento | Dimensiones Recomendadas |
|----------|-------------------------|
| Foto Perfil | 300x300px (cuadrada) |
| Imagen Banner | 800x1200px (3:4 ratio) |
| Video | 1080x1920px (9:16 ratio) |

### Rendimiento

- **Carga del Home:** < 3 segundos
- **Carrusel:** 60 FPS smooth animation
- **Imágenes:** Auto-optimizadas por Next.js
- **Videos:** Lazy loading

---

## 🎨 Diseño Brutalist

El sistema mantiene el diseño brutalist de la galería:

- **Bordes:** 4px negros sólidos
- **Sombras:** `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- **Colores:** Alto contraste (negro/blanco/rojo)
- **Tipografía:** Font-black, sans-serif

---

## 💡 Tips y Best Practices

### Imágenes del Carrusel
✅ **Hacer:**
- Usar imágenes de alta calidad
- Mantener orientación vertical (3:4)
- Incluir variedad de estilos
- Actualizar periódicamente

❌ **Evitar:**
- Imágenes borrosas o pixeladas
- Mezclar orientaciones (vertical/horizontal)
- Más de 12 imágenes (afecta rendimiento)
- Imágenes con watermarks muy visibles

### Texto de Contenido
✅ **Hacer:**
- Escribir en 1era persona
- Párrafos cortos (2-3 líneas)
- Usar listas para facilitar lectura
- Incluir call-to-action al final

❌ **Evitar:**
- Párrafos muy largos
- Jerga técnica excesiva
- Más de 500 palabras
- Texto todo en mayúsculas

### Videos
✅ **Hacer:**
- Preferir Instagram/YouTube (mejor rendimiento)
- Videos cortos (30-90 segundos)
- Formato vertical (9:16)
- Incluir subtítulos si hay audio

❌ **Evitar:**
- Videos muy largos (> 2 minutos)
- Archivos muy pesados (> 50MB)
- Videos con marca de agua
- Contenido no relacionado con arte

---

## 🐛 Troubleshooting

### Problema: Video no se muestra
**Solución:**
1. Verificar que la URL es correcta
2. Para Instagram: URL debe ser de un post público
3. Para YouTube: Video no debe ser privado
4. Si subiste archivo: Verificar que sea MP4

### Problema: Imágenes no se cargan
**Solución:**
1. Verificar tamaño del archivo (< 10MB)
2. Confirmar formato (JPG/PNG/WEBP)
3. Limpiar caché del navegador
4. Revisar consola de Firebase Storage

### Problema: Cambios no se guardan
**Solución:**
1. Verificar conexión a internet
2. Confirmar que tienes permisos de admin
3. Revisar consola del navegador (F12)
4. Intentar refrescar la página

### Problema: Carrusel no se mueve
**Solución:**
1. Debe haber mínimo 3 imágenes
2. Verificar que JavaScript está habilitado
3. Limpiar caché del navegador
4. Probar en navegador diferente

---

## 📊 Firestore Structure

```typescript
// Collection: homeSettings
// Document ID: "main"
{
  profileImageUrl: "https://...", // URL de Firebase Storage
  bannerImages: [
    "https://...",
    "https://...",
    // ... hasta 12 URLs
  ],
  heroTitle: "José Vega",
  heroSubtitle: "Arte Contemporáneo",
  contentTitle: "Bienvenido a mi Galería",
  contentText: "Texto con **markdown**...",
  videoType: "instagram" | "youtube" | "upload" | "none",
  videoUrl: "https://...", // Para Instagram/YouTube
  videoFile: "https://...", // URL de Firebase Storage
  backgroundStyle: "gray" | "book" | "dark" | "light",
  updatedAt: Timestamp,
  updatedBy: "uid_del_admin"
}
```

---

## 🔒 Seguridad

### Firestore Rules
```javascript
match /homeSettings/{settingsId} {
  // Todos pueden leer
  allow read: if true;

  // Solo admins pueden escribir
  allow create, update: if isAdmin();
}
```

### Firebase Storage Rules
Las imágenes subidas se guardan en:
- `home-settings/profile-{timestamp}.jpg`
- `home-settings/banner-{timestamp}-{filename}`
- `home-settings/video-{timestamp}.mp4`

---

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisar esta guía completa
2. Verificar [CLAUDE.md](CLAUDE.md) para contexto técnico
3. Contactar al desarrollador

---

## 🎉 ¡Listo!

Ahora tienes control total sobre el home page de tu galería. Experimenta con diferentes configuraciones para encontrar la presentación perfecta de tu arte.

**Recuerda:** Los cambios son instantáneos, así que puedes probar diferentes opciones hasta que estés satisfecho con el resultado.
