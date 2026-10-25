import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "@/config";
import { trackAddToCart } from "@/lib/meta-pixel";

export type CartItem = {
  id: string; // `${productId}-${variantId}`
  productId: string;
  name: string;
  variantName: string;
  price: number;
  image: string;
  quantity: number;
  vid?: string;
  checkoutUrl?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
  shipping: number;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "kayanu_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load cart from localStorage", e);
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
  }, [items, mounted]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { ...item, quantity }];
    });
    trackAddToCart({ name: item.name, price: item.price, quantity, id: item.id });
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter((i): i is CartItem => i !== null),
    );
  };

  const clearCart = () => setItems([]);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        totalItems,
        subtotal,
        shipping,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
