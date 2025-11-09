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
  createdAt: Date;
  category?: string;
}

export type Orientation = 'horizontal' | 'vertical';

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

// Tamaños disponibles - se ajustarán según orientación
// Precio base: 20.000 CLP (20x25)
// Precio máximo: 432.000 CLP (180x140)
export const CUSTOM_ORDER_SIZES: CustomOrderSize[] = [
  { name: "20x25", width: 20, height: 25, priceMultiplier: 1 },      // $20.000
  { name: "24x30", width: 24, height: 30, priceMultiplier: 1.5 },    // $24.000
  { name: "30x40", width: 30, height: 40, priceMultiplier: 2 },      // $40.000
  { name: "40x50", width: 40, height: 50, priceMultiplier: 2.5 },    // $50.000
  { name: "40x70", width: 40, height: 70, priceMultiplier: 4 },      // $80.000
  { name: "50x60", width: 50, height: 60, priceMultiplier: 5 },      // $100.000
  { name: "50x70", width: 50, height: 70, priceMultiplier: 6 },      // $120.000
  { name: "80x60", width: 80, height: 60, priceMultiplier: 8 },      // $160.000
  { name: "100x80", width: 100, height: 80, priceMultiplier: 10.8 }, // $216.000
  { name: "140x100", width: 140, height: 100, priceMultiplier: 16.2 }, // $324.000
  { name: "180x140", width: 180, height: 140, priceMultiplier: 21.6 }, // $432.000
];

export const BASE_CUSTOM_ORDER_PRICE = 20000; // Precio base: $20.000 CLP
