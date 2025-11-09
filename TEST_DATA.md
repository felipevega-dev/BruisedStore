# Datos de Prueba - Bruised Art

## 📝 Datos de Ejemplo para Pinturas

Aquí tienes algunos datos de ejemplo que puedes usar para crear pinturas de prueba en el panel de administración:

### Pintura 1: Aatrox N2
```
Título: Aatrox N2
Descripción: Pintura inspirada en el personaje Aatrox, con tonos rojos y dorados intensos
Precio: 145000
Ancho: 50
Alto: 70
Categoría: Fantasía
Disponible: ✓
```

### Pintura 2: ARTESANAIAAM N1
```
Título: ARTESANAIAAM N1
Descripción: Figura femenina en tonos cálidos sobre fondo rojo
Precio: 30000
Ancho: 40
Alto: 60
Categoría: Figura Humana
Disponible: ✓
```

### Pintura 3: Aatrox vs Phanteon
```
Título: Aatrox vs Phanteon
Descripción: Batalla épica entre dos guerreros con efectos dinámicos
Precio: 515000
Ancho: 70
Alto: 100
Categoría: Acción
Disponible: ✓
```

### Pintura 4: Aatrox Destructor
```
Título: Aatrox, destructor de mundos y asesino de dioses
Descripción: Composición dramática en tonos rojos con detalles metálicos
Precio: 325000
Ancho: 60
Alto: 80
Categoría: Fantasía Épica
Disponible: ✓
```

### Pintura 5: Ahri y Akali
```
Título: Ahri y Akali
Descripción: Retrato de dos personajes en ambiente colorido
Precio: 145000
Ancho: 50
Alto: 70
Categoría: Personajes
Disponible: ✓
```

### Pintura 6: Autorretrato
```
Título: Autorretrato
Descripción: Retrato con fondo rojo intenso
Precio: 145000
Ancho: 40
Alto: 50
Categoría: Retrato
Disponible: No Disponible
```

### Pintura 7: Autorretrato Vincent
```
Título: Autorretrato Vincent the Warrior
Descripción: Retrato con elementos guerreros y tonos cálidos
Precio: 135000
Ancho: 40
Alto: 60
Categoría: Retrato
Disponible: No Disponible
```

### Pintura 8: Autorretrato el ángel caído
```
Título: Autorretrato el ángel caído (Haydee)
Descripción: Composición dramática con elementos angelicales
Precio: 108000
Ancho: 35
Alto: 50
Categoría: Retrato Conceptual
Disponible: ✓
```

---

## 🎨 Imágenes de Ejemplo para Pruebas

Para probar la aplicación sin tener las imágenes reales, puedes:

1. **Usar servicios de imágenes placeholder:**
   - [Unsplash](https://source.unsplash.com/random/600x800/?painting)
   - [Lorem Picsum](https://picsum.photos/600/800)
   - [Placeholder.com](https://via.placeholder.com/600x800)

2. **Buscar imágenes libres:**
   - [Unsplash](https://unsplash.com/s/photos/painting)
   - [Pexels](https://www.pexels.com/search/art/)
   - [Pixabay](https://pixabay.com/images/search/painting/)

3. **Crear imágenes de prueba:**
   - Usa cualquier editor de imágenes
   - Dimensiones recomendadas: 600x800 o 800x1200 (ratio 3:4)
   - Formato: JPG o PNG
   - Tamaño: menos de 5MB

---

## 🧪 Flujo de Prueba Completo

### Paso 1: Configurar Admin
1. Ve a `/admin`
2. Login con las credenciales creadas
3. Verifica que puedes acceder al dashboard

### Paso 2: Crear Pinturas
1. Ve a "Gestionar Pinturas"
2. Crea al menos 3-4 pinturas con los datos de arriba
3. Usa imágenes de prueba o placeholders
4. Verifica que aparecen en la galería principal

### Paso 3: Probar Galería
1. Ve a la página principal (`/`)
2. Verifica que las pinturas se muestran
3. Prueba el responsive (móvil/desktop)
4. Click en una pintura para ver el detalle

### Paso 4: Probar Carrito
1. Agrega varias pinturas al carrito
2. Ve a `/carrito`
3. Aumenta/disminuye cantidades
4. Elimina items
5. Verifica el cálculo del total
6. Refresca la página (debe persistir)

### Paso 5: Probar Obra a Pedido
1. Ve a `/obra-a-pedido`
2. Sube una imagen de prueba
3. Selecciona diferentes tamaños
4. Verifica que el preview cambia de dimensiones
5. Completa el formulario:
   ```
   Nombre: Juan Pérez
   Email: juan@example.com
   Teléfono: +56912345678
   Notas: Quisiera colores más vibrantes
   ```
6. Envía el pedido

### Paso 6: Gestionar Pedidos
1. Vuelve al panel admin
2. Ve a "Pedidos Personalizados"
3. Verifica que aparece el pedido que creaste
4. Click en el pedido para ver detalles
5. Cambia el estado a "En Progreso"
6. Cambia a "Completado"

---

## 📊 Datos de Prueba para Formulario de Pedido

### Cliente 1
```
Nombre: María González
Email: maria.gonzalez@email.com
Teléfono: +56987654321
Tamaño: 50x70 cm
Notas: Me gustaría una pintura de mi mascota, un golden retriever
```

### Cliente 2
```
Nombre: Carlos Rodríguez
Email: carlos.rodriguez@email.com
Teléfono: +56912345678
Tamaño: 30x40 cm
Notas: Retrato familiar para regalo de aniversario
```

### Cliente 3
```
Nombre: Ana Silva
Email: ana.silva@email.com
Teléfono: +56998765432
Tamaño: 70x100 cm
Notas: Paisaje de la playa de Viña del Mar al atardecer
```

---

## 🎯 Casos de Prueba Importantes

### Test 1: Pintura No Disponible
- Crea una pintura y marca como "No disponible"
- Verifica que aparece el indicador en la tarjeta
- Verifica que NO se puede agregar al carrito

### Test 2: Carrito Vacío
- Vacía completamente el carrito
- Ve a `/carrito`
- Verifica el mensaje de "carrito vacío"

### Test 3: Editar Pintura
- Edita una pintura existente
- Cambia el precio y título
- Verifica que los cambios se reflejan

### Test 4: Eliminar Pintura
- Elimina una pintura
- Verifica que desaparece de la galería
- Verifica que también se elimina del Storage

### Test 5: Persistencia del Carrito
- Agrega items al carrito
- Refresca la página
- Cierra y vuelve a abrir la pestaña
- Verifica que los items persisten

### Test 6: Diferentes Tamaños de Imagen
- Sube imágenes de diferentes tamaños
- Verifica que Next/Image las optimiza correctamente
- Verifica que mantienen la proporción

### Test 7: Responsividad
- Abre la app en diferentes tamaños:
  - Móvil (375px)
  - Tablet (768px)
  - Desktop (1024px)
  - Desktop grande (1920px)
- Verifica que todo se ve bien en cada tamaño

---

## 🔍 Checklist de Funcionalidades

### Público (Sin Login)
- [ ] Ver galería de pinturas
- [ ] Ver detalle de pintura
- [ ] Agregar al carrito
- [ ] Ver carrito
- [ ] Modificar cantidades en carrito
- [ ] Crear pedido personalizado
- [ ] Ver precio actualizado según tamaño
- [ ] Ver preview de imagen en obra a pedido

### Admin (Con Login)
- [ ] Login exitoso
- [ ] Logout exitoso
- [ ] Ver lista de pinturas
- [ ] Crear nueva pintura
- [ ] Editar pintura existente
- [ ] Eliminar pintura
- [ ] Ver lista de pedidos
- [ ] Ver detalle de pedido
- [ ] Actualizar estado de pedido
- [ ] Eliminar pedido

---

## 💡 Tips para Pruebas

1. **Usa diferentes navegadores:**
   - Chrome
   - Firefox
   - Safari (si estás en Mac)
   - Edge

2. **Prueba el modo responsive de Chrome:**
   - F12 > Toggle device toolbar
   - Prueba diferentes dispositivos preconfigurados

3. **Revisa la consola:**
   - Busca errores en la consola del navegador
   - Verifica las llamadas a Firebase en la pestaña Network

4. **Prueba casos extremos:**
   - Campos vacíos
   - Caracteres especiales
   - Imágenes muy grandes
   - Textos muy largos

5. **Performance:**
   - Crea muchas pinturas (20+) para probar el scroll
   - Agrega muchos items al carrito
   - Verifica que todo carga rápido
