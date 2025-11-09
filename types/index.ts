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

export interface CustomOrderSize {
  name: string;
  width: number;
  height: number;
  priceMultiplier: number; // Multiplicador del precio base
}

export interface CustomOrder {
  id?: string;
  customerName: string;
  email: string;
  phone: string;
  referenceImageUrl: string;
  selectedSize: CustomOrderSize;
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

export const CUSTOM_ORDER_SIZES: CustomOrderSize[] = [
  { name: "20x30 cm", width: 20, height: 30, priceMultiplier: 1 },
  { name: "30x40 cm", width: 30, height: 40, priceMultiplier: 1.5 },
  { name: "40x50 cm", width: 40, height: 50, priceMultiplier: 2 },
  { name: "50x70 cm", width: 50, height: 70, priceMultiplier: 3 },
  { name: "70x100 cm", width: 70, height: 100, priceMultiplier: 4.5 },
];

export const BASE_CUSTOM_ORDER_PRICE = 145000; // Precio base en pesos chilenos
