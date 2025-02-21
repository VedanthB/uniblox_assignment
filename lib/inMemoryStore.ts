interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  discountApplied?: boolean;
  discountCode?: string;
}

interface Store {
  cart: Record<string, CartItem[]>; // UserID-based carts
  orders: Order[];
  discountCodes: string[];
  nthOrderCount: number;
}

export const inMemoryStore: Store = {
  cart: {}, // Stores user-specific carts
  orders: [],
  discountCodes: [],
  nthOrderCount: 0,
};
