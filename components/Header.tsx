"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { ShoppingCart, User, LogOut, Shield, Bell, Settings, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Header() {
  const { getItemCount } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { wishlistCount } = useWishlist();
  const itemCount = getItemCount();
  const [showMenu, setShowMenu] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Listener para órdenes pendientes (solo para admins)
  useEffect(() => {
    if (!isAdmin) {
      setPendingOrdersCount(0);
      return;
    }

    // Listener para órdenes de compra pendientes
    const ordersQuery = query(
      collection(db, "orders"),
      where("status", "==", "pending")
    );

    // Listener para órdenes personalizadas pendientes
    const customOrdersQuery = query(
      collection(db, "customOrders"),
      where("status", "==", "pending")
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersCount = snapshot.size;
      
      // También escuchar custom orders
      const unsubscribeCustomOrders = onSnapshot(customOrdersQuery, (customSnapshot) => {
        const customOrdersCount = customSnapshot.size;
        setPendingOrdersCount(ordersCount + customOrdersCount);
      });

      return () => {
        unsubscribeCustomOrders();
      };
    });

    return () => {
      unsubscribeOrders();
    };
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-gray-200 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <h1 className="text-xl font-bold text-gray-900 transition-all group-hover:text-red-600 sm:text-2xl">
              Bruised Art
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4 sm:space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-red-600 sm:text-base"
            >
              Obras
            </Link>
            <Link
              href="/obra-a-pedido"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-red-600 sm:text-base"
            >
              Obra a Pedido
            </Link>
            <Link
              href="/wishlist"
              className="relative flex items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-red-600 sm:text-base"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/carrito"
              className="relative flex items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-red-600 sm:text-base"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Admin Button - Solo visible para admins con badge de notificaciones */}
            {isAdmin && (
              <Link
                href="/admin"
                className="relative flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:text-base"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
                {pendingOrdersCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black shadow-lg animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 sm:px-4"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden max-w-[120px] truncate sm:inline">
                    {user.email}
                  </span>
                  <span className="sm:hidden">Usuario</span>
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <div className="p-2">
                    <div className="border-b-2 border-gray-200 px-3 py-2">
                      <p className="text-sm font-bold text-gray-900">
                        {user.displayName || "Usuario"}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Mi Perfil</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
                        onClick={() => setShowMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Panel Admin</span>
                      </Link>
                    )}
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-red-600 transition-colors hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 sm:text-base"
              >
                Iniciar Sesión
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

