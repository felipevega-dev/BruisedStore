"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Painting, CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  addToCart: (painting: Painting) => void;
  removeFromCart: (paintingId: string) => void;
  updateQuantity: (paintingId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cargar carrito del localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (painting: Painting) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.painting.id === painting.id
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.painting.id === painting.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevItems, { painting, quantity: 1 }];
    });
  };

  const removeFromCart = (paintingId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.painting.id !== paintingId)
    );
  };

  const updateQuantity = (paintingId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(paintingId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.painting.id === paintingId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce(
      (total, item) => total + item.painting.price * item.quantity,
      0
    );
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
