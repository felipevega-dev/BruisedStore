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

// Custom event para notificar cuando se agrega al carrito
export const CART_ADD_EVENT = "cart:item-added";
export const CART_ERROR_EVENT = "cart:error";

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
    // Check stock availability
    if (painting.stock !== undefined && painting.stock <= 0) {
      // Dispatch error event after state update
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(CART_ERROR_EVENT, {
            detail: { message: "Esta obra ya no está disponible" },
          })
        );
      }, 0);
      return;
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.painting.id === painting.id
      );

      const isNew = !existingItem;

      // Dispatch event after state update
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(CART_ADD_EVENT, {
            detail: { painting, isNew },
          })
        );
      }, 0);

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
