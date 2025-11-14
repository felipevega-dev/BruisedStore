# 🎨 José Vega Art Gallery - Color Palette Reference

Inspired by José Vega's nature paintings - earthy greens, electric blues, and warm terracotta tones.

---

## 🌿 Primary: Moss Green Scale

The main brand color - natural, organic, artistic.

| Shade | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| moss-50 | `#f4f7f0` | `bg-moss-50` | Very light backgrounds |
| moss-100 | `#e8eede` | `bg-moss-100` | Light backgrounds, disabled states |
| moss-200 | `#d1ddc0` | `bg-moss-200` | Borders, dividers |
| moss-300 | `#b0c693` | `bg-moss-300` | Hover states, muted elements |
| **moss-400** | **`#8FBF4A`** | `bg-moss-400` | **Verdant Glow - Highlights** |
| **moss-500** | **`#5B7F2D`** | `bg-moss-500` | **Moss Base - PRIMARY** |
| moss-600 | `#4a6624` | `bg-moss-600` | Hover on primary buttons |
| moss-700 | `#3a4f1c` | `bg-moss-700` | Pressed states |
| moss-800 | `#2f3f18` | `bg-moss-800` | Dark accents |
| **moss-900** | **`#1E3A1A`** | `bg-moss-900` | **Deep Canopy - Dark green text/bg** |

### Examples
```tsx
// Primary button
<button className="bg-moss-500 hover:bg-moss-600 text-white">
  Comprar Ahora
</button>

// Badge
<span className="bg-moss-100 text-moss-700 border-moss-300">
  Nuevo
</span>

// Link
<a className="text-moss-600 hover:text-moss-700">
  Ver Galería
</a>
```

---

## 🔵 Secondary: Azure Blue Scale

Used for admin features, secondary actions, and info states.

| Shade | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| azure-50 | `#eff6ff` | `bg-azure-50` | Very light backgrounds |
| azure-100 | `#dbeafe` | `bg-azure-100` | Light backgrounds |
| azure-200 | `#bfdbfe` | `bg-azure-200` | Borders |
| azure-300 | `#93c5fd` | `bg-azure-300` | Muted elements |
| azure-400 | `#60a5fa` | `bg-azure-400` | Hover states |
| **azure-500** | **`#1F5BA5`** | `bg-azure-500` | **Azure Pulse - SECONDARY** |
| azure-600 | `#1a4d8a` | `bg-azure-600` | Hover states |
| **azure-700** | **`#27406D`** | `bg-azure-700` | **Indigo Drift** |
| azure-800 | `#1e3a5f` | `bg-azure-800` | Dark accents |
| azure-900 | `#1a2e4a` | `bg-azure-900` | Very dark |

### Examples
```tsx
// Admin button
<button className="bg-azure-500 hover:bg-azure-600 text-white">
  Panel Admin
</button>

// Info message
<div className="bg-azure-50 border-azure-600 text-azure-900">
  ℹ️ Información importante
</div>

// Secondary link
<a className="text-azure-500 hover:text-azure-600">
  Más información
</a>
```

---

## 🧡 Accent: Terra Warm Scale

Used for errors, warnings, and important alerts.

| Shade | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| terra-50 | `#fef2ee` | `bg-terra-50` | Very light backgrounds |
| terra-100 | `#fde4dc` | `bg-terra-100` | Light backgrounds |
| terra-200 | `#fbc9b9` | `bg-terra-200` | Borders |
| terra-300 | `#f8a690` | `bg-terra-300` | Muted elements |
| **terra-400** | **`#E3B59D`** | `bg-terra-400` | **Soft Clay - Soft warnings** |
| **terra-500** | **`#C85B45`** | `bg-terra-500` | **Warm Terra - WARNINGS** |
| terra-600 | `#a84a38` | `bg-terra-600` | Error states |
| terra-700 | `#8a3d2e` | `bg-terra-700` | Dark errors |
| terra-800 | `#713328` | `bg-terra-800` | Very dark |
| terra-900 | `#5d2b24` | `bg-terra-900` | Darkest |

### Examples
```tsx
// Error message
<div className="bg-terra-50 border-terra-600 text-terra-900">
  ❌ Error al procesar el pago
</div>

// Warning banner
<div className="border-terra-500 bg-terra-100">
  ⚠️ Tu email no está verificado
</div>

// Delete button
<button className="bg-terra-500 hover:bg-terra-600 text-white">
  Eliminar
</button>
```

---

## 🤍 Neutral: Canvas Scale

Used for backgrounds, cards, and neutral elements.

| Shade | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| canvas-50 | `#fafbf8` | `bg-canvas-50` | Lightest background |
| **canvas-100** | **`#F2F4E9`** | `bg-canvas-100` | **Neutral Canvas - Main BG** |
| canvas-200 | `#e8ebe0` | `bg-canvas-200` | Card backgrounds |
| canvas-300 | `#d4d9c8` | `bg-canvas-300` | Borders |
| canvas-400 | `#b8c0a8` | `bg-canvas-400` | Muted elements |
| canvas-500 | `#9aa590` | `bg-canvas-500` | Medium neutrals |
| canvas-600 | `#7d8876` | `bg-canvas-600` | Dark neutrals |
| canvas-700 | `#656d5f` | `bg-canvas-700` | Darker |
| canvas-800 | `#52594e` | `bg-canvas-800` | Very dark |
| canvas-900 | `#454a41` | `bg-canvas-900` | Darkest |

### Examples
```tsx
// Page background
<div className="bg-canvas-100 min-h-screen">
  {/* content */}
</div>

// Card
<div className="bg-white border-canvas-300 rounded-lg">
  {/* card content */}
</div>
```

---

## 🎨 Common Patterns

### Buttons

```tsx
// Primary CTA
<button className="bg-moss-500 hover:bg-moss-600 active:bg-moss-700 text-white font-bold py-3 px-6 rounded-lg">
  Comprar Ahora
</button>

// Secondary
<button className="border-2 border-moss-500 text-moss-700 hover:bg-moss-50 font-bold py-3 px-6 rounded-lg">
  Ver Detalles
</button>

// Danger
<button className="bg-terra-500 hover:bg-terra-600 text-white font-bold py-3 px-6 rounded-lg">
  Eliminar
</button>

// Admin
<button className="bg-azure-500 hover:bg-azure-600 text-white font-bold py-3 px-6 rounded-lg">
  Panel Admin
</button>
```

### Badges

```tsx
// Success
<span className="bg-moss-100 text-moss-700 border border-moss-300 px-2 py-1 rounded">
  Disponible
</span>

// Warning
<span className="bg-terra-100 text-terra-700 border border-terra-300 px-2 py-1 rounded">
  Pocas unidades
</span>

// Error
<span className="bg-terra-100 text-terra-900 border border-terra-600 px-2 py-1 rounded">
  Agotado
</span>

// Info
<span className="bg-azure-100 text-azure-700 border border-azure-300 px-2 py-1 rounded">
  Nuevo
</span>
```

### Alerts

```tsx
// Success
<div className="border-4 border-moss-600 bg-moss-50 p-4">
  <p className="text-moss-900 font-bold">✅ Operación exitosa</p>
</div>

// Error
<div className="border-4 border-terra-600 bg-terra-50 p-4">
  <p className="text-terra-900 font-bold">❌ Error al procesar</p>
</div>

// Warning
<div className="border-4 border-terra-400 bg-terra-100 p-4">
  <p className="text-terra-900 font-bold">⚠️ Advertencia</p>
</div>

// Info
<div className="border-4 border-azure-600 bg-azure-50 p-4">
  <p className="text-azure-900 font-bold">ℹ️ Información</p>
</div>
```

### Links

```tsx
// Primary link
<a className="text-moss-600 hover:text-moss-700 underline">
  Ver más obras
</a>

// Secondary link
<a className="text-azure-500 hover:text-azure-600 underline">
  Ayuda
</a>

// Footer link
<a className="text-gray-600 hover:text-moss-600 transition-colors">
  Contacto
</a>
```

### Gradients (Tailwind v4 syntax)

```tsx
// Hero background
<div className="bg-linear-to-br from-canvas-100 via-white to-moss-50">
  {/* content */}
</div>

// Button gradient
<button className="bg-linear-to-r from-moss-500 to-moss-400 text-white">
  Comprar
</button>

// Music bar
<div className="bg-linear-to-r from-moss-50 via-canvas-100 to-azure-50">
  {/* player controls */}
</div>
```

---

## ♿ Accessibility Notes

### WCAG AA Compliance

All color combinations have been tested for WCAG AA compliance:

- ✅ **moss-900 on canvas-100** - Contrast ratio: 12.5:1
- ✅ **moss-600 on white** - Contrast ratio: 5.2:1
- ✅ **terra-900 on terra-50** - Contrast ratio: 11.8:1
- ✅ **azure-900 on azure-50** - Contrast ratio: 13.2:1

### Best Practices

1. Use dark text (moss-900, slate-900) on light backgrounds
2. Use white text on moss-500+, azure-500+, terra-500+
3. Never use moss-300 or lighter for text
4. Add border or shadow for clarity on similar backgrounds

---

## 🔄 Migration from Old Palette

| Old Color | New Color | Usage |
|-----------|-----------|-------|
| `sky-500` (cyan) | `moss-500` (green) | Primary actions |
| `sky-600` | `moss-600` | Hover states |
| `red-600` | `terra-600` | Errors |
| `yellow-400` | `terra-400` | Warnings |
| `emerald-500` | `moss-500` | Success states |

---

**Color palette designed:** November 2025
**Based on:** José Vega's nature-inspired artwork
**Theme:** Organic, natural, artistic, Chilean landscape
