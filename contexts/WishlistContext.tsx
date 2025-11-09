"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Painting } from "@/types";

interface WishlistContextType {
  wishlist: string[]; // Array de paintingIds
  addToWishlist: (paintingId: string) => Promise<void>;
  removeFromWishlist: (paintingId: string) => Promise<void>;
  isInWishlist: (paintingId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    // Listener en tiempo real para la wishlist del usuario
    const wishlistQuery = query(
      collection(db, "wishlist"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(wishlistQuery, (snapshot) => {
      const paintingIds = snapshot.docs.map((doc) => doc.data().paintingId);
      setWishlist(paintingIds);
    });

    return () => unsubscribe();
  }, [user]);

  const addToWishlist = async (paintingId: string) => {
    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos");
      return;
    }

    try {
      // Verificar que la pintura existe
      const paintingRef = doc(db, "paintings", paintingId);
      const paintingSnap = await getDoc(paintingRef);

      if (!paintingSnap.exists()) {
        console.error("Painting not found");
        return;
      }

      // Agregar a wishlist
      await addDoc(collection(db, "wishlist"), {
        userId: user.uid,
        paintingId,
        addedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  const removeFromWishlist = async (paintingId: string) => {
    if (!user) return;

    try {
      // Buscar el documento de wishlist
      const wishlistQuery = query(
        collection(db, "wishlist"),
        where("userId", "==", user.uid),
        where("paintingId", "==", paintingId)
      );

      const snapshot = await getDocs(wishlistQuery);
      
      // Eliminar todos los documentos que coincidan (debería ser solo uno)
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const isInWishlist = (paintingId: string): boolean => {
    return wishlist.includes(paintingId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
