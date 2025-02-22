interface DiscountCodeInfo {
  code: string;
  expired: boolean;
}

interface User {
  id: string;
  username: string;
  password: string;
}

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
  users: User[];
  userOrderCount: Record<string, number>; // Track orders per user
  userDiscountCodes: Record<string, DiscountCodeInfo[]>; // User-specific discount codes
  adminDiscountCodes: string[];
}

export const inMemoryStore: Store = {
  cart: {}, // Stores user carts
  orders: [],
  users: [],
  userOrderCount: {}, // Track orders per user
  userDiscountCodes: {}, // Store discount codes per user
  adminDiscountCodes: [],
};
