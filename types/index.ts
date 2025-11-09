export interface Painting {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  price: number;
  dimensions: {
    width: number;
    height: number;
  };
  available: boolean;
  createdAt: Date;
  category?: string;
}

export type Orientation = 'horizontal' | 'vertical';

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
