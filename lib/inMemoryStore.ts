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
  userOrderCount: Record<string, number>; // Track orders per user
  userDiscountCodes: Record<string, string[]>; // User-specific discount codes
}

export const inMemoryStore: Store = {
  cart: {}, // Stores user carts
  orders: [],
  userOrderCount: {}, // Track orders per user
  userDiscountCodes: {}, // Store discount codes per user
};
