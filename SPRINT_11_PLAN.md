# Sprint 11: Blog, Social Sharing, Tests & Payment Options

## 🎯 Objetivos

1. **Blog System** - Historias del artista, proceso creativo, SEO
2. **Social Sharing** - Viralidad orgánica para pinturas
3. **Unit Tests** - Foundation para calidad de código
4. **Payment Options** - Transferencia manual + MercadoPago opcional

---

## 📝 Part 1: Blog System (1.5-2 hrs)

### Features
- Admin can create/edit/delete blog posts
- Rich text editor (react-quill or similar)
- Categories & tags for organization
- SEO-friendly URLs (slug-based)
- Comments disabled (simplicity for one-person operation)
- Gallery integration (embed paintings in posts)

### Data Model
```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string; // URL-friendly (e.g., "mi-proceso-creativo")
  excerpt: string; // Short description for cards
  content: string; // Full HTML content
  coverImage?: string; // Optional featured image
  category: "proceso" | "inspiracion" | "tecnica" | "personal" | "exposiciones";
  tags: string[]; // ["acuarela", "abstracto", "naturaleza"]
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string; // Admin user
}
```

### Pages to Create
- `/blog` - List all published posts (grid)
- `/blog/[slug]` - Individual post view
- `/admin/blog` - CRUD interface for posts

### Implementation Steps
1. ✅ Add BlogPost type to `types/index.ts`
2. ✅ Create `/app/blog/page.tsx` (public list)
3. ✅ Create `/app/blog/[slug]/page.tsx` (post detail)
4. ✅ Create `/app/admin/blog/page.tsx` (CRUD)
5. ✅ Add react-quill for rich text editing
6. ✅ Update Firestore rules for `blogPosts` collection
7. ✅ Add blog link to header navigation

### SEO Benefits
- Dynamic sitemap includes blog posts
- JSON-LD Article schema
- Keyword-rich content for Google discovery
- Internal linking to paintings

---

## 📢 Part 2: Social Sharing (30-45 min)

### Features
- Share buttons on painting detail pages
- WhatsApp, Facebook, Twitter/X, Copy Link
- Dynamic Open Graph images (already implemented)
- Share text includes painting title + artist name
- Analytics tracking on share clicks

### Implementation
```typescript
// components/ShareButtons.tsx
interface ShareButtonsProps {
  url: string;
  title: string;
  imageUrl: string;
}

const shareUrls = {
  whatsapp: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
  facebook: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
};
```

### Integration Points
1. `/app/obra/[id]/page.tsx` - Below image gallery
2. `/app/blog/[slug]/page.tsx` - At end of blog posts
3. Brutalist button design (border-4, shadow)

### Tracking
```typescript
// Log share events to Firebase Analytics
const handleShare = (platform: string) => {
  logEvent(analytics, 'share', {
    content_type: 'painting',
    content_id: painting.id,
    method: platform,
  });
};
```

---

## 🧪 Part 3: Unit Tests Foundation (2-3 hrs)

### Testing Stack
- **Vitest** - Fast, Vite-native test runner
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - Matchers

### What to Test

#### 1. Utilities (High ROI)
```typescript
// lib/utils.test.ts
describe('formatPrice', () => {
  it('formats CLP currency correctly', () => {
    expect(formatPrice(50000)).toBe('$50.000');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0');
  });
});
```

#### 2. Validation Functions
```typescript
// lib/validation.test.ts
describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(validateEmail('a@b')).toBe(false);
    expect(validateEmail('notanemail')).toBe(false);
  });
});

describe('validateCustomOrderForm', () => {
  it('returns errors for empty name', () => {
    const errors = validateCustomOrderForm({ name: '', email: 'test@test.com', ... });
    expect(errors.name).toBe('El nombre es requerido');
  });
});
```

#### 3. Components (Medium ROI)
```typescript
// components/PaintingCard.test.tsx
describe('PaintingCard', () => {
  const mockPainting = {
    id: '1',
    title: 'Test Painting',
    price: 50000,
    images: ['test.jpg'],
    available: true,
  };

  it('renders painting title', () => {
    render(<PaintingCard painting={mockPainting} />);
    expect(screen.getByText('Test Painting')).toBeInTheDocument();
  });

  it('formats price correctly', () => {
    render(<PaintingCard painting={mockPainting} />);
    expect(screen.getByText('$50.000')).toBeInTheDocument();
  });

  it('shows unavailable badge when not available', () => {
    render(<PaintingCard painting={{ ...mockPainting, available: false }} />);
    expect(screen.getByText('No disponible')).toBeInTheDocument();
  });
});
```

#### 4. Hooks (If time permits)
```typescript
// hooks/useToast.test.tsx
describe('useToast', () => {
  it('shows success toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Success', 'success');
    });
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### Coverage Goals
- **Utilities:** 100%
- **Validation:** 100%
- **Components:** 60-70%
- **Overall:** 40-50%

### Setup Files
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### Commands
```json
// package.json scripts
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

---

## 💳 Part 4: Payment Options (45-60 min)

### Strategy: Simple + Scalable

#### Option A: Transferencia Manual (GRATIS - Implementar primero)
**Flow:**
1. Usuario completa checkout
2. Orden se crea con status "pending"
3. Redirect a página `/order-confirmation/[orderId]` que muestra:
   - Resumen de orden
   - **Datos bancarios para transferencia**
   - Botón WhatsApp para confirmar pago
   - Instrumento para subir comprobante (opcional)

**Datos a mostrar:**
```typescript
const BANK_INFO = {
  banco: "Banco Estado / Santander / etc",
  tipoCuenta: "Cuenta Corriente / Vista",
  numero: "1234567890",
  rut: "12.345.678-9",
  titular: "José Vega",
  email: "contacto@josevega.art",
};
```

**Ventajas:**
- ✅ Gratis (0% comisión)
- ✅ Implementación inmediata (30 min)
- ✅ No requiere validación de MercadoPago
- ✅ Funciona para Chile sin restricciones

#### Option B: MercadoPago Checkout Pro (FUTURO - Si crece)
**Flow:**
1. Usuario completa checkout
2. Click "Pagar con MercadoPago"
3. Redirect a Checkout Pro de MP
4. MP procesa pago
5. Webhook actualiza orden a "paid"
6. Usuario redirect a `/order-success`

**Requisitos:**
- Cuenta de MercadoPago verificada
- Credenciales API (Public Key + Access Token)
- Webhook endpoint en Next.js API Routes
- Modo test primero, luego producción

**Comisiones MercadoPago Chile:**
- 3.99% + IVA por transacción
- Gratis si eres nuevo vendedor (primeros 30 días)

**Implementación:**
```typescript
// lib/mercadopago.ts
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function createPaymentPreference(order: Order) {
  const preference = new Preference(client);

  return await preference.create({
    body: {
      items: order.items.map(item => ({
        title: item.painting.title,
        quantity: item.quantity,
        unit_price: item.painting.price,
        picture_url: item.painting.images[0],
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/order-success/${order.id}`,
        failure: `${process.env.NEXT_PUBLIC_URL}/checkout`,
        pending: `${process.env.NEXT_PUBLIC_URL}/order-pending/${order.id}`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/mercadopago`,
    },
  });
}
```

```typescript
// app/api/webhooks/mercadopago/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Verify signature
  if (!verifyMercadoPagoSignature(body)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Update order
  if (body.action === 'payment.updated') {
    const payment = await getPaymentDetails(body.data.id);

    if (payment.status === 'approved') {
      await updateDoc(doc(db, 'orders', payment.external_reference), {
        'paymentInfo.status': 'paid',
        'paymentInfo.transactionId': payment.id,
        'paymentInfo.paidAt': new Date(),
        status: 'confirmed',
      });
    }
  }

  return new Response('OK', { status: 200 });
}
```

### Implementation Plan

**Phase 1: Transferencia (AHORA - 30-45 min)**
1. ✅ Create `/app/order-confirmation/[orderId]/page.tsx`
2. ✅ Display bank info + order summary
3. ✅ WhatsApp button with pre-filled message
4. ✅ Optional: Upload receipt component
5. ✅ Update checkout to redirect here

**Phase 2: MercadoPago (DESPUÉS - Si se necesita)**
1. Register MercadoPago account
2. Get test credentials
3. Install SDK: `npm install mercadopago`
4. Implement preference creation
5. Add webhook endpoint
6. Test in sandbox
7. Go live with production credentials

---

## 🎨 UI/UX Notes

### Blog
- Brutalist cards with border-4
- Category badges (color-coded)
- Read time estimate
- Responsive grid (1 col mobile, 2 tablet, 3 desktop)

### Social Sharing
- Icon buttons with hover effects
- Copy link shows toast "Enlace copiado!"
- Match brutalist design (border-4, shadow-[8px_8px])

### Payment Confirmation
- Large bank info card (easy to copy)
- Step-by-step instructions
- Prominent WhatsApp button
- Order summary sidebar (desktop) / top (mobile)

---

## 📦 Dependencies to Install

```bash
# Blog
npm install react-quill

# Tests
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @vitest/ui @vitest/coverage-v8

# MercadoPago (Phase 2)
npm install mercadopago
```

---

## 🚀 Execution Order

### Sprint 11 Roadmap (Total: ~5-6 hours)

**Day 1: Blog System (2 hrs)**
1. Data model + Firestore rules
2. Public blog pages
3. Admin CRUD interface
4. Rich text editor integration

**Day 2: Social + Tests (2.5 hrs)**
1. ShareButtons component
2. Integration in obra/blog pages
3. Vitest setup
4. Utility tests (formatPrice, validation)

**Day 3: Payment (45 min)**
1. Order confirmation page
2. Bank info display
3. WhatsApp integration
4. Test checkout flow

**Day 4: Polish & Deploy (30 min)**
1. Component tests (PaintingCard)
2. Test coverage report
3. Final build verification
4. Deploy

---

## ✅ Success Criteria

- [ ] Blog: Admin can publish 3+ posts, visible on /blog
- [ ] Social: Share buttons work on all platforms
- [ ] Tests: 40%+ coverage, all utils at 100%
- [ ] Payment: Bank transfer flow complete, WhatsApp redirect working
- [ ] Build: 0 errors, 0 warnings
- [ ] SEO: Sitemap includes blog posts

---

## 📊 Expected Impact

**Blog System:**
- +30% SEO traffic (long-tail keywords)
- Humanizes the artist (storytelling)
- Content marketing asset

**Social Sharing:**
- +15% organic reach
- User-generated marketing
- Viral potential

**Unit Tests:**
- Prevents regressions
- Faster development (confidence)
- Foundation for CI/CD

**Payment Options:**
- Transferencia: 0% fees (critical for one-person operation)
- MercadoPago: Optional upgrade path
- Better UX than "manda WhatsApp"

---

## 🎯 Next Steps

Ready to start implementation? I can begin with any of these:

1. **Blog System** - Full CRUD + rich text editor
2. **Social Sharing** - Quick win (30 min)
3. **Unit Tests** - Foundation setup
4. **Payment Page** - Bank transfer flow

Which would you like to tackle first?
