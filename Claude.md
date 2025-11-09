# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**José Vega Art Gallery** - E-commerce platform for selling paintings online by Chilean artist José Vega (@joseriop). Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and Firebase.

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
**Sprint 6:** ✅ COMPLETED - Quick-Win Features (WhatsApp Widget → Rebrand → Instagram → Image Cropper)

**Status:** ✅ Production-ready. 14 major features + full UX polish + WhatsApp Widget + Image Cropper implemented. Build passing without errors.

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

## Sprint 6 - Quick-Win Features (COMPLETED ✅)

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
  const baseMessage = "Hola! Estoy interesado en las obras de José Vega. ";
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

### Part 2: Rebrand to José Vega ✅ COMPLETED
**Time:** 20 minutes | **Impact:** Brand consistency, artist recognition

#### Changes Made
- Updated all instances of "Bruised Art" to "José Vega" across the application
- Changed Instagram link from @bruisedart to @joseriop
- Files updated:
  - `components/Header.tsx` - Logo and site title
  - `components/Footer.tsx` - Footer branding and copyright
  - `components/WhatsAppWidget.tsx` - Chat messages
  - `lib/metadata.ts` - SEO metadata, Open Graph, JSON-LD
  - `app/page.tsx` - Hero section title
  - `app/checkout/page.tsx` - WhatsApp order message
  - `app/obra/[id]/metadata.ts` - Painting metadata
  - `CLAUDE.md` - Documentation

### Part 3: Instagram Section ✅ COMPLETED
**Time:** 15 minutes | **Impact:** Social proof, artist connection

#### Implementation
- Replaced hidden catalog on homepage with Instagram CTA section
- Catalog temporarily hidden (wrapped in `{false && ...}`) until quality photos ready
- Instagram section features:
  - Brutalist design with border-4, shadow effects
  - Instagram SVG icon with hover color change to red
  - Large "@joseriop" link to artist's profile
  - Opens in new tab (`target="_blank"`)
  - Yellow info box explaining feed will be added later
  - Fully responsive design

#### Code Pattern
```tsx
<a
  href="https://instagram.com/joseriop"
  target="_blank"
  rel="noopener noreferrer"
  className="group flex items-center gap-4 border-4 border-black..."
>
  <svg className="h-12 w-12 transition-colors group-hover:fill-red-600">
    {/* Instagram icon path */}
  </svg>
  <div className="text-left">
    <p className="text-2xl font-black...">@joseriop</p>
    <p className="text-sm...">Ver perfil completo →</p>
  </div>
</a>
```

### Part 4: Image Crop Tool ✅ COMPLETED
**Time:** 45 minutes | **Impact:** Professional image handling, better paintings

#### Implementation
- Installed `react-easy-crop` library for advanced cropping
- Created `components/ImageCropper.tsx` component with:
  - Full-screen modal overlay (z-[9999], black background)
  - Real-time crop preview with aspect ratio matching selected canvas
  - Zoom control (1x - 3x) with slider and percentage display
  - Rotation control (0° - 360°) with slider and degree display
  - Touch-friendly drag to reposition image
  - Apply/Cancel buttons with brutalist design
  - Processing state with spinner
  - Help text for user guidance

#### Integration in Custom Order Page
1. **Automatic Cropper on Upload:**
   - When user selects image, cropper opens immediately
   - Image loaded into `tempImage` state
   - Modal shows with aspect ratio of currently selected canvas

2. **Manual Adjustment:**
   - "Ajustar Imagen" button appears after image is uploaded (mobile preview)
   - Reopens cropper with current image
   - Preserves existing crop or allows new adjustment

3. **Dynamic Aspect Ratio:**
   - Calculated as `canvasWidth / canvasHeight`
   - Updates automatically when user changes canvas size
   - Examples: 60x40 = 1.5 aspect, 25x20 = 0.8 aspect, 50x50 = 1.0 aspect

4. **Output Handling:**
   - Creates cropped Blob with 95% JPEG quality
   - Converts to File object for Firebase upload
   - Generates preview URL for immediate display
   - Cleans up temporary image state

#### Key Code Pattern
```typescript
// In ImageCropper.tsx
const createCroppedImage = async (): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  
  // Apply rotation
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  
  // Draw cropped area
  ctx.drawImage(imageObj, croppedAreaPixels.x, croppedAreaPixels.y, ...);
  
  return new Promise((resolve) => {
    canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.95);
  });
};

// In obra-a-pedido/page.tsx
{showCropper && (tempImage || imagePreview) && (
  <ImageCropper
    image={tempImage || imagePreview!}
    aspectRatio={canvasWidth / canvasHeight}
    onCropComplete={handleCropComplete}
    onCancel={handleCropCancel}
  />
)}
```

#### User Flow
1. User selects canvas size (e.g., 60x80 horizontal)
2. User uploads reference image
3. **Cropper opens automatically** with 60/80 = 0.75 aspect ratio
4. User adjusts zoom, rotation, position
5. User clicks "Aplicar Ajuste"
6. Cropped image appears in preview
7. User can click "Ajustar Imagen" to reopen cropper
8. User can change canvas size → click "Ajustar Imagen" → crop to new aspect ratio
9. On submit, cropped image uploads to Firebase Storage

#### Benefits
- **Perfect Fit:** Images always match selected canvas proportions
- **Quality Control:** Users can frame/compose their reference properly
- **Professional:** No distorted or stretched images
- **Flexibility:** Change canvas size and re-crop without re-uploading
- **Mobile-Friendly:** Touch gestures work for pan/zoom

### Part 2: PWA (Progressive Web App) - PENDING
**Time:** 30-40 minutes | **Impact:** App-like experience, works offline

### Part 3: Advanced Discounts - PENDING
**Time:** 45-60 minutes | **Impact:** Marketing automation, customer retention

## Future Development Options

Remaining options for future sprints:
- **PWA Implementation:** Service workers, offline support, install prompt (30-40 min)
- **Advanced Discounts:** Quantity-based, category-based, user-based discount rules (45-60 min)
- **Email Notifications:** Firebase Functions + SendGrid for order confirmations (2-3 hrs)
- **Blog System:** Rich text editor, categories, tags, comments for SEO/engagement (1.5-2 hrs)
- **Real Instagram Feed:** Implement actual Instagram API or third-party widget (1-2 hrs)

## Resources

- [Next.js 16 App Router Docs](https://nextjs.org/docs)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- Firebase Project: `bruisedartrash`
- Git Repo: `felipevega-dev/BruisedStore`
