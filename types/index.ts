export interface Painting {
  id: string;
  title: string;
  description?: string;
  imageUrl: string; // Mantener para compatibilidad con versiones anteriores
  images?: string[]; // Array de URLs de imágenes
  price: number;
  dimensions: {
    width: number;
    height: number;
  };
  orientation?: Orientation; // horizontal o vertical
  available: boolean;
  stock?: number; // Inventory tracking (undefined = unlimited/legacy, 0 = out of stock)
  lowStockThreshold?: number; // Alert admin when stock reaches this level (default: 1)
  createdAt: Date;
  category?: PaintingCategory;
}

export type Orientation = 'horizontal' | 'vertical' | 'cuadrado';

export type PaintingCategory = 
  | 'abstracto'
  | 'retrato'
  | 'paisaje'
  | 'naturaleza-muerta'
  | 'surrealismo'
  | 'expresionismo'
  | 'minimalista'
  | 'figurativo'
  | 'otro';

export const PAINTING_CATEGORIES: { value: PaintingCategory; label: string }[] = [
  { value: 'abstracto', label: 'Abstracto' },
  { value: 'retrato', label: 'Retrato' },
  { value: 'paisaje', label: 'Paisaje' },
  { value: 'naturaleza-muerta', label: 'Naturaleza Muerta' },
  { value: 'surrealismo', label: 'Surrealismo' },
  { value: 'expresionismo', label: 'Expresionismo' },
  { value: 'minimalista', label: 'Minimalista' },
  { value: 'figurativo', label: 'Figurativo' },
  { value: 'otro', label: 'Otro' },
];

export interface FilterOptions {
  search: string;
  category: PaintingCategory | "all";
  minPrice: number;
  maxPrice: number;
  sortBy: "recent" | "price-asc" | "price-desc" | "title-asc" | "title-desc";
}

// Review/Rating System
export interface Review {
  id: string;
  paintingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
  approved: boolean; // Para moderación
}

// Wishlist
export interface WishlistItem {
  id: string;
  userId: string;
  paintingId: string;
  painting: Painting; // Incluimos la info de la pintura para mostrarla
  addedAt: Date;
}

// Coupon System
export interface Coupon {
  id: string;
  code: string; // Ej: "VERANO2024", "PRIMERACOMPRA"
  description: string;
  discountType: "percentage" | "fixed"; // Porcentaje o monto fijo
  discountValue: number; // 10 (para 10%) o 5000 (para $5.000)
  minPurchase?: number; // Monto mínimo de compra para aplicar
  maxDiscount?: number; // Descuento máximo (para porcentajes)
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number; // Límite de usos totales
  usageCount: number; // Veces que se ha usado
  isActive: boolean;
  createdAt: Date;
}

// ========== CUSTOM ORDERS (Obras a Pedido) ==========

export interface CustomOrderSize {
  name: string;
  width: number;
  height: number;
  priceMultiplier: number;
}

export interface CustomOrder {
  id?: string;
  customerName: string;
  email: string;
  phone: string;
  referenceImageUrl: string;
  selectedSize: CustomOrderSize;
  orientation: Orientation;
  totalPrice: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  notes?: string;
  userId?: string; // ID del usuario si está registrado
}

// ========== REGULAR ORDERS (Compras de Pinturas) ==========

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
  notes?: string;
}

export interface PaymentInfo {
  method: 'webpay' | 'mercadopago' | 'transferencia' | 'efectivo';
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: Date;
  // Para transferencias bancarias
  transferProofUrl?: string; // URL del comprobante subido por el usuario
  transferProofUploadedAt?: Date;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ShippingStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id?: string;
  orderNumber: string; // Número de orden único (ej: ORD-20241109-001)
  userId?: string; // ID del usuario si está logueado
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  discount?: number;
  couponCode?: string | null;
  publicAccessToken?: string;
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  status: OrderStatus;
  shippingStatus: ShippingStatus;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

// ========== CART ==========

export interface CartItem {
  painting: Painting;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Tamaños estándar de bastidores (formato: ALTO x ANCHO)
// CONVENCIÓN: primer número = ALTO (height), segundo número = ANCHO (width)
// Ejemplo: 50x40 = 50cm de alto x 40cm de ancho = VERTICAL (más alto que ancho)
// Orientación automática: si height > width = VERTICAL, si width > height = HORIZONTAL
// Precio base: 20.000 CLP (20x25)
export const CUSTOM_ORDER_SIZES: CustomOrderSize[] = [
  // VERTICALES (height > width) - más alto que ancho
  { name: "25x20", width: 20, height: 25, priceMultiplier: 1 },      // $20.000 - VERTICAL
  { name: "30x24", width: 24, height: 30, priceMultiplier: 1.5 },    // $30.000 - VERTICAL
  { name: "40x30", width: 30, height: 40, priceMultiplier: 2 },      // $40.000 - VERTICAL
  { name: "50x40", width: 40, height: 50, priceMultiplier: 2.5 },    // $50.000 - VERTICAL
  { name: "70x40", width: 40, height: 70, priceMultiplier: 4 },      // $80.000 - VERTICAL
  { name: "70x50", width: 50, height: 70, priceMultiplier: 6 },      // $120.000 - VERTICAL

  // CUADRADOS (height = width)
  { name: "50x50", width: 50, height: 50, priceMultiplier: 4.5 },    // $90.000 - CUADRADO
  { name: "60x60", width: 60, height: 60, priceMultiplier: 6.5 },    // $130.000 - CUADRADO

  // HORIZONTALES (width > height) - más ancho que alto
  { name: "50x60", width: 60, height: 50, priceMultiplier: 5 },      // $100.000 - HORIZONTAL
  { name: "50x70", width: 70, height: 50, priceMultiplier: 6 },      // $120.000 - HORIZONTAL
  { name: "60x80", width: 80, height: 60, priceMultiplier: 8 },      // $160.000 - HORIZONTAL
  { name: "80x100", width: 100, height: 80, priceMultiplier: 10.8 }, // $216.000 - HORIZONTAL
  { name: "100x140", width: 140, height: 100, priceMultiplier: 16.2 }, // $324.000 - HORIZONTAL
  { name: "140x180", width: 180, height: 140, priceMultiplier: 21.6 }, // $432.000 - HORIZONTAL
];

export const BASE_CUSTOM_ORDER_PRICE = 20000; // Precio base: $20.000 CLP

// Home Page Settings
export interface HomeSettings {
  id: string;
  // Banner settings
  profileImageUrl?: string; // Foto de perfil del artista
  bannerImages: string[]; // Array de URLs de pinturas para el carrusel

  // Hero section
  heroTitle: string; // Título principal (default: "José Vega")
  heroSubtitle?: string; // Subtítulo opcional

  // Content section
  contentTitle: string; // Título de la sección de contenido
  contentText: string; // Texto descriptivo (markdown supported)

  // Video settings
  videoType: 'upload' | 'youtube' | 'none';
  videoUrl?: string; // URL de Instagram Reel, YouTube, etc.
  videoFile?: string; // URL de video subido a Firebase Storage

  // Styling
  backgroundStyle: 'gray' | 'book' | 'dark' | 'light';

  // Video layout configuration
  videoSize: 'small' | 'medium' | 'large'; // Tamaño del video
  videoPosition: 'left' | 'right'; // Posición del video (texto en lado opuesto)

  // Metadata
  updatedAt: Date;
  updatedBy?: string; // userId del admin que actualizó
}

export const DEFAULT_HOME_SETTINGS: Omit<HomeSettings, 'id' | 'updatedAt'> = {
  bannerImages: [
    '/img/clown.jpg',
    '/img/drag.jpg',
    '/img/elfenlied.jpg',
    '/img/felix.jpg',
    '/img/lady.jpg',
    '/img/wow.jpg',
  ],
  heroTitle: 'José Vega',
  heroSubtitle: 'Arte Contemporáneo',
  contentTitle: 'Bienvenido a mi Galería',
  contentText: 'Explora mi colección de obras únicas. Cada pieza cuenta una historia y captura un momento especial.',
  videoType: 'none',
  backgroundStyle: 'gray',
  videoSize: 'medium',
  videoPosition: 'right',
};

// Blog System Types
export type BlogCategory =
  | 'proceso'
  | 'inspiracion'
  | 'tecnica'
  | 'personal'
  | 'exposiciones';

export const BLOG_CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: 'proceso', label: 'Proceso Creativo' },
  { value: 'inspiracion', label: 'Inspiración' },
  { value: 'tecnica', label: 'Técnica' },
  { value: 'personal', label: 'Personal' },
  { value: 'exposiciones', label: 'Exposiciones' },
];

export interface BlogPost {
  id: string;
  title: string;
  slug: string; // URL-friendly (e.g., "mi-proceso-creativo")
  excerpt: string; // Short description for cards
  content: string; // Full HTML content
  coverImage?: string; // Optional featured image
  category: BlogCategory;
  tags: string[]; // ["acuarela", "abstracto", "naturaleza"]
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string; // Admin user ID
  viewCount?: number; // Optional view tracking
}

// Background Music System
export interface MusicTrack {
  id: string;
  title: string;
  fileUrl: string; // URL del archivo de audio en Firebase Storage
  duration?: number; // Duración en segundos
  uploadedAt: Date;
}

export interface MusicSettings {
  id: string; // "main" - documento único
  enabled: boolean; // Si la música está habilitada globalmente
  tracks: MusicTrack[]; // Array de pistas disponibles
  playMode: 'single' | 'loop' | 'playlist'; // single: toca una vez, loop: repite la misma, playlist: toca todas en orden
  volume: number; // 0-100 (volumen actual en la barra de reproducción)
  defaultVolume: number; // 0-100 (volumen inicial para nuevos usuarios)
  currentTrackId?: string; // ID de la pista activa (para modo single/loop)
  updatedAt: Date;
  updatedBy?: string; // userId del admin
}

export const DEFAULT_MUSIC_SETTINGS: Omit<MusicSettings, 'id' | 'updatedAt'> = {
  enabled: false,
  tracks: [],
  playMode: 'loop',
  volume: 30, // Volumen por defecto al 30%
  defaultVolume: 30, // Volumen inicial para nuevos usuarios
};

// General Settings (Site-wide configuration)
export interface GeneralSettings {
  id: string;
  
  // PWA
  showPWAPrompt: boolean;
  
  // Brand Colors
  primaryColor: string; // Color principal (ej: #5B7F2D - moss-500)
  secondaryColor: string; // Color secundario (ej: #1F5BA5 - azure-500)
  accentColor: string; // Color de acento para botones, links, etc.
  
  // Contact Info
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string; // Solo números, ej: "56912345678"
  
  // Social Media
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  
  // Footer
  footerText: string; // Texto del footer
  showSocialInFooter: boolean;
  
  // Banner/Hero
  bannerBackgroundColor: string; // Color de fondo del banner
  bannerOverlayOpacity: number; // 0-100 - Opacidad de la capa oscura sobre el banner
  
  // UI Preferences
  enableAnimations: boolean; // Habilitar/deshabilitar animaciones
  buttonStyle: 'rounded' | 'square' | 'pill'; // Estilo de botones

  // Bank Transfer Info (para mostrar en checkout)
  bankName?: string; // Ej: "Banco de Chile"
  bankAccountType?: string; // Ej: "Cuenta Corriente"
  bankAccountNumber?: string; // Número de cuenta
  bankAccountHolder?: string; // Titular de la cuenta
  bankRut?: string; // RUT del titular
  bankEmail?: string; // Email para notificaciones de transferencia

  // Metadata
  updatedAt: Date;
  updatedBy?: string;
}

export const DEFAULT_GENERAL_SETTINGS: Omit<GeneralSettings, 'id' | 'updatedAt'> = {
  showPWAPrompt: false,
  
  // Colores actuales de la marca (paleta naturaleza)
  primaryColor: '#5B7F2D', // moss-500
  secondaryColor: '#1F5BA5', // azure-500
  accentColor: '#8FBF4A', // moss-400
  
  // Contacto
  contactEmail: 'contacto@josevega.art',
  contactPhone: '+56 9 1234 5678',
  whatsappNumber: '56912345678',
  
  // Redes sociales
  instagramUrl: '',
  tiktokUrl: '',
  facebookUrl: '',
  
  // Footer
  footerText: '© 2024 José Vega. Todos los derechos reservados.',
  showSocialInFooter: true,
  
  // Banner
  bannerBackgroundColor: '#1F2937', // gray-800
  bannerOverlayOpacity: 60,
  
  // UI
  enableAnimations: true,
  buttonStyle: 'rounded',

  // Bank Transfer (se configura en admin/general-settings)
  bankName: undefined,
  bankAccountType: undefined,
  bankAccountNumber: undefined,
  bankAccountHolder: undefined,
  bankRut: undefined,
  bankEmail: undefined,
};
