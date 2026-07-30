import { create } from 'zustand';

interface CartState {
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  isCartOpen: false,
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
}));
