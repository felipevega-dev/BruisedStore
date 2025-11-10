# 📸 Configuración de Instagram Feed con Elfsight

## ¿Por qué Elfsight?
- ✅ Configuración en 5 minutos
- ✅ No requiere API keys ni OAuth complicado
- ✅ Se actualiza automáticamente con nuevas publicaciones
- ✅ Plan gratuito disponible (50 vistas/mes)
- ✅ Responsive y personalizable
- ✅ Compatible con Next.js 16 + Turbopack

---

## 🚀 Pasos para Configurar

### 1. Crear cuenta en Elfsight
1. Ve a: https://elfsight.com/
2. Haz clic en **"Sign Up"** (arriba a la derecha)
3. Regístrate con tu email o Google

### 2. Crear widget de Instagram Feed
1. Una vez dentro, busca **"Instagram Feed"** en la barra de búsqueda
2. Haz clic en **"Create Widget"**
3. En la configuración:
   - **Source**: Elige "Public Account"
   - **Instagram Username**: `joseriop` (sin @)
   - **Layout**: Grid
   - **Posts to show**: 6
   - **Columns**: 3 (en desktop), 2 (en mobile)

### 3. Personalizar diseño (opcional)
En el editor de Elfsight puedes:
- Cambiar el número de posts
- Ajustar espaciado entre fotos
- Ocultar/mostrar likes y comentarios
- Cambiar colores (aunque nuestro CSS lo sobreescribe)

### 4. Obtener el código del widget
1. Haz clic en **"Save"** en el editor
2. Haz clic en **"Add to Website"**
3. Verás dos líneas de código:
   ```html
   <script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
   <div class="elfsight-app-XXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"></div>
   ```

### 5. Copiar tu Widget ID
Del código de arriba, copia la parte que dice:
```
elfsight-app-XXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

Ejemplo real:
```
elfsight-app-f8c8e5d3-c6b2-4e8e-8c9a-1234567890ab
```

### 6. Reemplazar en el código
1. Abre el archivo: `app/page.tsx`
2. Busca la línea que dice:
   ```tsx
   className="elfsight-app-f8c8e5d3-c6b2-4e8e-8c9a-1234567890ab"
   ```
3. Reemplaza `f8c8e5d3-c6b2-4e8e-8c9a-1234567890ab` con TU widget ID

### 7. Eliminar el banner de advertencia
Una vez que tengas tu widget funcionando, elimina estas líneas de `app/page.tsx`:
```tsx
{/* Instructions Box */}
<div className="max-w-2xl border-4 border-yellow-400 bg-yellow-50 p-6 text-center">
  <p className="text-sm font-bold text-black">
    ⚠️ NOTA PARA DESARROLLADOR
  </p>
  <p className="mt-2 text-xs text-gray-700">
    Reemplaza el ID del widget...
  </p>
</div>
```

---

## 🎨 Diseño Brutalist Automático
El widget ya está envuelto en un contenedor con el diseño brutalist de la página:
- Border negro grueso (4px)
- Sombra característica (8px_8px)
- Título con subrayado rojo
- Responsive (se adapta a móvil)

---

## 💰 Plan Gratuito vs Premium

### Plan Gratuito
- ✅ 50 vistas al mes
- ✅ Marca de agua pequeña de Elfsight
- ✅ 6 posts
- ✅ Actualización automática

### Plan Premium ($5-10/mes)
- ✅ Vistas ilimitadas
- ✅ Sin marca de agua
- ✅ Posts ilimitados
- ✅ Soporte prioritario

**Recomendación**: Empieza con el plan gratuito y actualiza cuando necesites más vistas.

---

## 🔧 Troubleshooting

### El widget no se ve
1. Verifica que copiaste el Widget ID completo
2. Revisa que el username sea `joseriop` en Elfsight
3. Espera 1-2 minutos después de guardar (cache)
4. Refresca la página con Ctrl+F5

### Aparece "Account not found"
- El username debe ser exacto (sin @)
- La cuenta debe ser pública en Instagram
- Espera unos minutos, a veces Elfsight tarda en conectar

### El diseño se ve mal
- El CSS brutalist debería sobreescribir los estilos de Elfsight
- Si no, ajusta los estilos en el contenedor padre en `page.tsx`

---

## 📞 Soporte
- Elfsight Support: https://help.elfsight.com/
- Documentación: https://elfsight.com/instagram-feed-instashow/

---

## ✅ Checklist Final
- [ ] Cuenta de Elfsight creada
- [ ] Widget de Instagram Feed creado
- [ ] Username `joseriop` configurado
- [ ] Widget ID copiado
- [ ] Código actualizado en `app/page.tsx`
- [ ] Banner de advertencia eliminado
- [ ] Build exitoso (`npm run build`)
- [ ] Widget visible en el navegador
- [ ] Publicaciones cargando correctamente
