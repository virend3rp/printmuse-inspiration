"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface CartContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext =
  createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function openCart() {
    setIsOpen(true);
  }

  function closeCart() {
    setIsOpen(false);
  }

  return (
    <CartContext.Provider
      value={{ isOpen, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  return context;
}