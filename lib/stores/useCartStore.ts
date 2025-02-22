import { create } from "zustand";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cart.find((i) => i.productId === item.productId);
      if (existingItem) {
        return {
          cart: state.cart.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i,
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),
  removeFromCart: (productId) => set((state) => ({ cart: state.cart.filter((i) => i.productId !== productId) })),
  clearCart: () => set({ cart: [] }),
}));
