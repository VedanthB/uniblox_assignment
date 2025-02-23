interface DiscountCodeInfo {
  code: string;
  expired: boolean;
}

interface User {
  id: string;
  username: string;
  password: string;
  role?: string;
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
  userOrderCount: Record<string, number>;
  userDiscountCodes: Record<string, DiscountCodeInfo[]>;
  adminDiscountCodes: string[];
}

export const inMemoryStore: Store = {
  cart: {}, // Stores user carts
  orders: [],
  users: [
    {
      id: "1",
      username: "admin@example.com",
      password: "adminpass",
      role: "admin",
    },
  ],
  userOrderCount: {},
  userDiscountCodes: {},
  adminDiscountCodes: [],
};
