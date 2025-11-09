# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bruised Art** - E-commerce platform for selling paintings online, inspired by [theberserkerart.cl](https://www.theberserkerart.cl/). Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and Firebase.

**Design Philosophy:** Brutalist design with heavy black borders (4px), bold shadows (`shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`), high contrast (black on white), and accent colors in red (#dc2626) and yellow (#fef3c7).

## Tech Stack

- **Next.js 16.0.1** (App Router) + React 19.2.0
- **TypeScript 5** - All components strictly typed
- **Tailwind CSS 4.1.17** - Utility-first styling
- **Firebase 12.5.0** - Firestore (DB), Storage (images), Auth (users + admin)
- **Lucide React** - Icon library

## Development Commands

```bash
# Development (port 3000)
npm run dev

# Production build & deploy
npm run build
npm start

# Type checking
npm run lint
npx tsc --noEmit

# Admin setup (requires serviceAccountKey.json)
node set-admin-role.js admin@example.com
```

## Architecture Overview

### Context Providers (Root Layout)

The app uses a **triple-nested context pattern** in `app/layout.tsx`:

```
<AuthProvider>           # User authentication, admin claims, login/logout
  <WishlistProvider>     # User's saved paintings (Firestore-backed)
    <CartProvider>       # Shopping cart (localStorage-backed)
```

**Order matters:** AuthProvider must wrap WishlistProvider because wishlist requires `currentUser`.

### Key Architectural Patterns

#### 1. **Firebase Singleton Pattern** (`lib/firebase.ts`)
```typescript
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
```
Prevents duplicate initialization in Next.js hot reload during development.

#### 2. **Admin Authorization via Custom Claims**
- Admin access controlled by `role: 'admin'` custom claim in Firebase Auth token
- Set via `set-admin-role.js` script (requires Firebase Admin SDK)
- Checked in components: `user.isAdmin` (from `AuthContext`)
- Enforced in Firestore rules: `request.auth.token.role == 'admin'`

#### 3. **Dual Order System**
The app handles two distinct order types:
- **`customOrders`** - Commission requests for custom paintings (`/obra-a-pedido`)
- **`orders`** - Standard e-commerce purchases (`/checkout`)

Each has separate admin pages and status workflows.

#### 4. **Image Handling**
- **Single image (legacy):** `painting.imageUrl` (string)
- **Multiple images (current):** `painting.images` (string[])
- `ImageGallery` component handles both for backward compatibility
- Upload via drag & drop in admin panel (`app/admin/paintings`)
- Storage bucket: `paintings/{paintingId}/{filename}`

#### 5. **Real-time Notifications**
Admin panel (`app/admin`) uses Firestore `onSnapshot` listeners to track pending orders/custom orders. Badge counter in Header auto-updates without refresh.

## Firestore Data Model

### Core Collections

**`paintings`** - Product catalog
```typescript
{
  id: string
  title: string
  description?: string
  imageUrl: string          // Legacy (single image)
  images?: string[]         // Current (multiple images)
  price: number
  dimensions: { width: number, height: number }
  orientation?: 'horizontal' | 'vertical'
  available: boolean
  category?: PaintingCategory  // 9 categories (abstracto, retrato, etc.)
  createdAt: Date
}
```

**`orders`** - E-commerce purchases
```typescript
{
  orderNumber: string       // "ORD-20241109-001"
  userId?: string
  items: CartItem[]
  subtotal: number
  shippingCost: number
  total: number
  shippingInfo: { fullName, email, phone, address, city, region, ... }
  paymentInfo: { method, status, transactionId?, paidAt? }
  status: OrderStatus       // pending → confirmed → processing → shipped → delivered
  shippingStatus: ShippingStatus
  createdAt: Date
  updatedAt: Date
}
```

**`customOrders`** - Commission requests
```typescript
{
  customerName: string
  email: string
  phone: string
  referenceImageUrl: string  // Uploaded by customer
  selectedSize: CustomOrderSize
  orientation: 'horizontal' | 'vertical'
  totalPrice: number
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
  createdAt: Date
}
```

**`reviews`** - Painting reviews (moderated)
```typescript
{
  paintingId: string
  userId: string
  rating: number            // 1-5 stars
  comment: string
  approved: boolean         // Admin moderation required
  createdAt: Date
}
```

**`wishlist`** - User saved paintings
```typescript
{
  userId: string
  paintingId: string
  painting: Painting        // Denormalized for performance
  addedAt: Date
}
```

**`coupons`** - Discount codes
```typescript
{
  code: string              // "VERANO2024"
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchase?: number
  maxDiscount?: number
  validFrom: Date
  validUntil: Date
  usageLimit?: number
  usageCount: number
  isActive: boolean
}
```

### Security Rules Summary

- **paintings:** Public read, admin-only write
- **orders:** Public create (guest checkout), owner + admin read, admin-only update
- **customOrders:** Public create/read, admin-only update/delete
- **reviews:** Approved reviews public, own reviews always visible, admin sees all
- **wishlist:** User can only access their own items
- **coupons:** Public read (for validation), admin-only write

Full rules in [`firestore.rules`](firestore.rules).

## Critical Type Definitions

See [`types/index.ts`](types/index.ts) for full definitions. Key points:

- **`Painting`** - Use `images` array for new paintings, `imageUrl` for legacy
- **`FilterOptions`** - Search/category/price filters (used in `FilterBar` component)
- **`PAINTING_CATEGORIES`** - 9 predefined categories (abstracto, retrato, paisaje, etc.)
- **`CUSTOM_ORDER_SIZES`** - 11 size options with price multipliers
- **`CartItem`** - `{ painting: Painting, quantity: number }`

## Page Structure

### Public Pages
- **`/`** - Gallery with filters, search, category/price sorting
- **`/obra/[id]`** - Painting detail with reviews, image gallery, add to cart
- **`/obra-a-pedido`** - Custom order form with size calculator
- **`/carrito`** - Shopping cart
- **`/checkout`** - Checkout form → creates order → WhatsApp integration
- **`/wishlist`** - Saved paintings (auth required)
- **`/profile`** - User profile with order history (auth required)
- **`/login`, `/register`** - Authentication

### Admin Pages (auth + admin claim required)
- **`/admin`** - Dashboard with metrics
- **`/admin/paintings`** - CRUD for paintings (multi-image upload)
- **`/admin/orders-store`** - Manage e-commerce orders
- **`/admin/orders`** - Manage custom commission requests
- **`/admin/reviews`** - Moderate reviews (approve/hide/delete)
- **`/admin/coupons`** - Manage discount codes
- **`/admin/analytics`** - Sales dashboard (recharts graphs)

## Environment Variables

Required in `.env.local`:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# WhatsApp Integration (post-purchase contact)
NEXT_PUBLIC_WHATSAPP_NUMBER=56912345678  # No spaces, no +, with country code
```

## Key Implementation Details

### 1. Custom Order Pricing
Base price: $20,000 CLP (20x25cm). Prices scale with `priceMultiplier` (see `CUSTOM_ORDER_SIZES` in `types/index.ts`). Largest size (180x140cm) = $432,000 CLP.

### 2. Cart Persistence
`CartContext` uses `localStorage` for persistence. Cart survives page refresh but is cleared after successful checkout.

### 3. Wishlist Persistence
`WishlistContext` uses Firestore. Requires authentication. Anonymous users see login prompt when clicking heart icon.

### 4. Dimension Display Logic
Paintings display dimensions as **height x width** for vertical orientation (more intuitive for portraits). Horizontal paintings display as **width x height**.

```typescript
// In PaintingCard.tsx
const displayDimensions = orientation === 'vertical'
  ? `${height}x${width}`
  : `${width}x${height}`;
```

### 5. Filter Logic Gotcha
When `minPrice = 0` or `maxPrice = 0`, don't apply that filter. This prevents hiding all paintings when user hasn't set a price filter.

```typescript
// CORRECT
if (minPrice > 0) filtered = filtered.filter(p => p.price >= minPrice);
if (maxPrice > 0) filtered = filtered.filter(p => p.price <= maxPrice);

// WRONG (hides all paintings)
if (minPrice >= 0) filtered = filtered.filter(p => p.price >= minPrice);
```

### 6. SEO Implementation
- Metadata generation in `lib/metadata.ts`
- Dynamic Open Graph images per painting
- JSON-LD structured data (Product + ArtGallery schema)
- Dynamic sitemap at `/sitemap.xml` (`app/sitemap.ts`)
- Robots.txt at `/robots.txt` (`app/robots.ts`)

## Common Workflows

### Adding a New Firestore Collection

1. Define TypeScript interface in `types/index.ts`
2. Add security rules in `firestore.rules`
3. Deploy rules via Firebase Console
4. Create context provider if needed (follow pattern in `contexts/`)
5. Add admin page if collection needs management

### Creating Admin-Only Pages

1. Check admin status: `const { user } = useAuth();`
2. Guard render: `if (!user?.isAdmin) return <div>Access Denied</div>;`
3. Add link in `components/Header.tsx` admin nav
4. Firestore operations will be enforced by security rules

### Image Upload Pattern

```typescript
// 1. Create reference
const imageRef = ref(storage, `paintings/${paintingId}/${file.name}`);

// 2. Upload file
await uploadBytes(imageRef, file);

// 3. Get download URL
const downloadURL = await getDownloadURL(imageRef);

// 4. Save URL to Firestore
await updateDoc(doc(db, 'paintings', paintingId), {
  images: arrayUnion(downloadURL)
});
```

## Testing Checklist

### Client Flow
- [ ] Browse gallery, filter by category/price, search by title
- [ ] Add painting to cart, adjust quantity, remove item
- [ ] Complete checkout (fill shipping info, select payment method)
- [ ] Verify WhatsApp redirect with order details
- [ ] Check cart cleared after checkout
- [ ] Add/remove paintings from wishlist
- [ ] Submit review on painting detail page
- [ ] View order history in profile

### Admin Flow
- [ ] Login with admin credentials
- [ ] Create painting with multiple images (drag & drop)
- [ ] Edit painting (change price, category, availability)
- [ ] View pending orders in real-time (check badge counter)
- [ ] Update order status (pending → confirmed → shipped)
- [ ] Moderate reviews (approve, hide, delete)
- [ ] Create discount coupon, verify usage limit

## Known Issues & Fixes

### Fixed in Recent Sprints
- ✅ Filter bug: `maxPrice: 0` was hiding all paintings (fixed with `> 0` check)
- ✅ TypeScript build error: `searchQuery` vs `search` prop mismatch (unified to `search`)
- ✅ Dimension display: Vertical paintings now show height x width (e.g., 25x20 instead of 20x25)

### Open Items
- None currently reported

## Sprint History

**Sprint 1:** WhatsApp integration, categories/filters, search, auth (email + Google OAuth)
**Sprint 2:** User profiles, review system with moderation, wishlist
**Sprint 3:** Coupon system, multi-image galleries, analytics dashboard
**Sprint 4:** SEO (Open Graph, JSON-LD, sitemap, robots.txt), UX polish
**Sprint 5:** ✅ COMPLETED - Complete mobile responsiveness (hamburger menu, inline preview, touch-optimized)
**Sprint 5.5:** ✅ COMPLETED - UX Feedback (toast notifications, profile edit, header z-index fix)
**Sprint 6:** 🚀 IN PROGRESS - Quick-Win Features (WhatsApp Widget → PWA → Advanced Discounts)

**Status:** ✅ Production-ready. 13 major features + UX polish + WhatsApp Widget implemented. Build passing without errors.

## Sprint 5 - Mobile Responsiveness (COMPLETED ✅)

### Achievements
✅ Fully responsive navigation with hamburger menu
✅ Optimized all public pages for mobile (320px+)
✅ Inline image preview in custom order form (mobile UX improvement)
✅ Touch-friendly controls throughout the app
✅ Tested on multiple resolutions (mobile, tablet, desktop)

### Specific Improvements Implemented

#### 1. **Header/Navbar** ✅
- **Mobile (< 1024px):**
  - Hamburger menu with slide-in panel (280px width)
  - Semi-transparent overlay on open
  - All navigation links with icons
  - User info card at top of menu
  - Badge counters for cart, wishlist, and admin notifications
  - Auto-close on link click

- **Desktop (≥ 1024px):**
  - Horizontal navigation
  - Grouped icons (wishlist + cart)
  - Dropdown user menu
  - Admin button with real-time notifications

#### 2. **Home Page** ✅
- Centered hero section on all devices
- Responsive heading (text-3xl → text-4xl → text-5xl → text-8xl)
- Icon size scaling (h-8 → h-10)
- Red accent line scaling (h-1 w-20 → h-2 w-24)
- Already had responsive grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)

#### 3. **Custom Order Page** ✅
- **Mobile-First Image Upload:**
  - **Before:** User had to scroll down to see preview
  - **After:** Image preview appears inline immediately after upload
  - Aspect-square preview with border-4 border-black
  - "Cambiar Imagen" button below preview
  - Upload box hidden on mobile when image exists

- **Responsive Canvas Preview:**
  - Scale factor: 6x (down from 8x for mobile)
  - maxWidth: calc(100vw - 80px) instead of 100vw
  - maxHeight: 60vh instead of 90vh

- **Touch-Optimized Controls:**
  - Orientation buttons: h-16 w-12 (mobile) → h-20 w-14 (desktop)
  - Text scaling: text-xs → text-sm throughout form
  - Padding: p-3/p-4 (mobile) → p-6 (desktop)
  - Price display: stacked vertically on mobile (flex-col)

#### 4. **Admin Panel** ✅
- Dashboard already responsive with md:grid-cols-2
- Individual admin pages inherit responsive layout
- Forms use responsive spacing (space-y-4 sm:space-y-6)
- Build verified: ✅ No errors

### Responsive Breakpoints
- **Mobile:** < 640px (sm) - Single column, touch targets 44px min
- **Tablet:** 640px - 1024px (sm - lg) - 2 columns where appropriate
- **Desktop:** 1024px - 1536px (lg - xl) - Full navigation, 3-4 columns
- **Large Desktop:** > 1536px (2xl) - Maximum width containers

### Key UX Improvements
1. **Inline Preview (Mobile):** Users see their uploaded image immediately without scrolling
2. **Hamburger Menu:** Clean mobile navigation with all features accessible
3. **Touch Targets:** All buttons and links meet 44px minimum for mobile
4. **Responsive Typography:** Text scales appropriately across all breakpoints
5. **Visual Hierarchy:** Maintained brutalist design while ensuring mobile usability

## Sprint 6 - Quick-Win Features (IN PROGRESS 🚀)

### Part 1: WhatsApp Widget ✅ COMPLETED
**Time:** 15-20 minutes | **Impact:** High conversion rate improvement

#### Implementation
- Created `components/WhatsAppWidget.tsx` - Floating widget with brutalist design
- Context-aware messaging based on current page
- Dismissible with localStorage persistence
- Integrated globally in `app/layout.tsx`
- Hidden on admin pages
- **AdBlocker-proof:** No "WhatsApp" in localStorage keys or aria-labels

#### Features
- **Floating Button:** Green WhatsApp icon (bottom-right, z-[9998])
- **Expandable Message:** Click to see help message bubble
- **Smart Messages:** Different message per page (home, product, cart, custom order, etc.)
- **Dismissible:** Red X button hides widget permanently (localStorage: `chat-widget-hidden`)
- **Design:** Border-4, shadow-[8px_8px_0px_0px], consistent with brutalist theme

#### Bug Fixes
- ✅ Renamed localStorage key from `whatsapp-widget-dismissed` to `chat-widget-hidden`
- ✅ Changed aria-labels from "WhatsApp" to generic "chat"
- ✅ Button text: "Enviar Mensaje" instead of "Abrir WhatsApp"

#### Code Pattern
```typescript
const getContextMessage = () => {
  const baseMessage = "Hola! Estoy interesado en Bruised Art. ";
  if (pathname === "/") return baseMessage + "Me gustaría conocer más...";
  if (pathname.startsWith("/obra/")) return baseMessage + "Consulta sobre obra...";
  // ... context-specific messages
};

const handleWhatsAppClick = () => {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message = encodeURIComponent(getContextMessage());
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
};
```

### Part 1.5: Canvas Size & Orientation System ✅ COMPLETED
**Time:** 30 minutes | **Impact:** Realistic canvas previews, correct orientation

#### Problem
- Users could select orientations that didn't match canvas size (e.g., 80x60 as vertical)
- Canvas preview didn't show realistic proportions (limited by maxWidth/maxHeight)
- First number in size notation wasn't consistently treated as width

#### Solution - Automatic Orientation
**Canvas size notation:** `ALTO x ANCHO` (e.g., 50x40 = 50cm alto x 40cm ancho)
- **CONVENCIÓN ESTÁNDAR:** Primer número = ALTO (height), Segundo número = ANCHO (width)
- **height > width** → VERTICAL (e.g., 25x20, 40x30, 70x40)
- **width > height** → HORIZONTAL (e.g., 50x60, 60x80, 100x140)
- **height = width** → CUADRADO (e.g., 50x50, 60x60)

#### Implementation Changes
1. **Removed orientation buttons** - Orientation now automatic based on size
2. **Updated CUSTOM_ORDER_SIZES** in `types/index.ts`:
   - ✅ CORRECCIÓN CRÍTICA: Nombres reflejan convención ALTO x ANCHO
   - Added 2 square sizes: 50x50, 60x60
   - Organized sizes by orientation (vertical → square → horizontal)
   - Clear comments indicating orientation for each size
3. **Fixed canvas preview** in `app/obra-a-pedido/page.tsx`:
   - Changed scale from 6x to 3x for better fit
   - Removed `Math.min` that was cutting proportions
   - Added `aspectRatio` CSS property for exact proportions
   - New dimensions: `width: ${canvasWidth * 3}px`, `height: ${canvasHeight * 3}px`
   - Responsive: `maxWidth: min(calc(100vw - 120px), 500px)`
4. **Simplified state** - Removed `orientation` from formData (now computed)
5. **Display shows real dimensions** - Always shows `{canvasWidth} x {canvasHeight} cm`

#### New Canvas Sizes (14 total) - Formato: ALTO x ANCHO
```typescript
// VERTICALES (6) - más alto que ancho
25x20 ($20.000), 30x24 ($30.000), 40x30 ($40.000),
50x40 ($50.000), 70x40 ($80.000), 70x50 ($120.000)

// CUADRADOS (2)
50x50 ($90.000), 60x60 ($130.000)

// HORIZONTALES (6) - más ancho que alto
50x60 ($100.000), 50x70 ($120.000), 60x80 ($160.000),
80x100 ($216.000), 100x140 ($324.000), 140x180 ($432.000)
```

#### Key Code Pattern
```typescript
// Automatic orientation
const orientation: Orientation =
  selectedSize.width < selectedSize.height ? "vertical"
  : selectedSize.width > selectedSize.height ? "horizontal"
  : "vertical"; // squares default to vertical

// Real proportions in preview
const canvasWidth = selectedSize.width;
const canvasHeight = selectedSize.height;

<div style={{
  width: `${canvasWidth * 3}px`,
  height: `${canvasHeight * 3}px`,
  aspectRatio: `${canvasWidth} / ${canvasHeight}`,
  maxWidth: "min(calc(100vw - 120px), 500px)",
  maxHeight: "min(70vh, 600px)",
}} />
```

### Part 2: PWA (Progressive Web App) - PENDING
**Time:** 30-40 minutes | **Impact:** App-like experience, works offline

### Part 3: Advanced Discounts - PENDING
**Time:** 45-60 minutes | **Impact:** Marketing automation, customer retention

## Future Development Options

Remaining options for future sprints:
- **Email Notifications:** Firebase Functions + SendGrid for order confirmations (2-3 hrs)
- **Blog System:** Rich text editor, categories, tags, comments for SEO/engagement (1.5-2 hrs)

## Resources

- [Next.js 16 App Router Docs](https://nextjs.org/docs)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- Firebase Project: `bruisedartrash`
- Git Repo: `felipevega-dev/BruisedStore`
