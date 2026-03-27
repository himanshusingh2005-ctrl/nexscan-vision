import { create } from "zustand";
import type { Product } from "@/types/database";

interface CartItem {
  product: Product;
  quantity: number;
  retailer: string;
  price: number;
}

interface AppState {
  cart: CartItem[];
  bankPreferences: string[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setBankPreferences: (banks: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  cart: [],
  bankPreferences: ["HDFC"],
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.findIndex((c) => c.product.id === item.product.id);
      if (existing >= 0) {
        const newCart = [...state.cart];
        newCart[existing].quantity += 1;
        return { cart: newCart };
      }
      return { cart: [...state.cart, item] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({ cart: state.cart.filter((c) => c.product.id !== productId) })),
  clearCart: () => set({ cart: [] }),
  setBankPreferences: (banks) => set({ bankPreferences: banks }),
}));
