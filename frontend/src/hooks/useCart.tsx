"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";

interface CartItem {
  id: string;
  qty: number;
  product_name: string;
  variant_name: string;
  variant_id: string;
  price: number;
  images: string[];
}

interface CartContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  items: CartItem[];
  total: number;
  refreshCart: () => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  async function refreshCart() {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("access_token")
        : null;

    if (!token) {
      setItems([]);
      setTotal(0);
      return;
    }

    try {
      const res = await apiFetch("/cart");
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      setItems([]);
      setTotal(0);
    }
  }

  async function removeItem(itemId: string) {
    try {
      await apiFetch(`/cart/${itemId}`, { method: "DELETE" });
      await refreshCart();
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        items,
        total,
        refreshCart,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart must be used inside CartProvider");
  return context;
}
