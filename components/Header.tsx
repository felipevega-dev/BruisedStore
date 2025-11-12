"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { ShoppingCart, User, LogOut, Shield, Settings, Heart, Menu, X, Home, Palette, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";

export default function Header() {
  const { getItemCount } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { wishlistCount } = useWishlist();
  const itemCount = getItemCount();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const { showToast, ToastContainer } = useToast();

  // Listener para órdenes pendientes (solo para admins)
  useEffect(() => {
    if (!isAdmin) {
      setPendingOrdersCount(0);
      return;
    }

    const updateCounts = () => {
      // Obtener los IDs de órdenes ya vistas
      const viewedOrderIds = new Set<string>();
      const viewedCustomOrderIds = new Set<string>();
      
      try {
        const storedOrders = localStorage.getItem("viewedOrderIds");
        const storedCustomOrders = localStorage.getItem("viewedCustomOrderIds");
        
        if (storedOrders) {
          JSON.parse(storedOrders).forEach((id: string) => viewedOrderIds.add(id));
        }
        if (storedCustomOrders) {
          JSON.parse(storedCustomOrders).forEach((id: string) => viewedCustomOrderIds.add(id));
        }
      } catch (e) {
        console.error("Error loading viewed orders:", e);
      }

      // Listener para órdenes de compra pendientes Y no vistas
      const ordersQuery = query(
        collection(db, "orders"),
        where("status", "==", "pending")
      );

      // Listener para órdenes personalizadas pendientes Y no vistas
      const customOrdersQuery = query(
        collection(db, "customOrders"),
        where("status", "==", "pending")
      );

      let ordersCount = 0;
      let customOrdersCount = 0;

      const updateTotal = () => {
        setPendingOrdersCount(ordersCount + customOrdersCount);
      };

      // Listeners que filtran por órdenes no vistas
      const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        ordersCount = snapshot.docs.filter((doc) => !viewedOrderIds.has(doc.id)).length;
        updateTotal();
      });

      const unsubscribeCustomOrders = onSnapshot(customOrdersQuery, (snapshot) => {
        customOrdersCount = snapshot.docs.filter((doc) => !viewedCustomOrderIds.has(doc.id)).length;
        updateTotal();
      });

      return () => {
        unsubscribeOrders();
        unsubscribeCustomOrders();
      };
    };

    // Initial update
    const unsubscribe = updateCounts();

    // Listen for storage changes (when orders are marked as viewed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "viewedOrderIds" || e.key === "viewedCustomOrderIds") {
        // Re-run the listeners
        if (unsubscribe) unsubscribe();
        updateCounts();
      }
    };

    // Custom event for same-window storage updates
    const handleCustomStorageChange = () => {
      if (unsubscribe) unsubscribe();
      updateCounts();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("ordersViewed", handleCustomStorageChange);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("ordersViewed", handleCustomStorageChange);
    };
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
    setShowMobileMenu(false);
    showToast("Sesión cerrada exitosamente", "success");
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b-4 border-black bg-white shadow-lg">
      {/* Email Verification Banner */}
      {user && !user.emailVerified && (
        <div className="border-b-2 border-yellow-400 bg-yellow-100 py-2 text-center">
          <p className="text-sm font-bold text-yellow-900">
            ⚠️ Tu email no está verificado.{" "}
            <Link href="/verify-email" className="underline hover:text-yellow-700">
              Verificar ahora
            </Link>
          </p>
        </div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group z-50" onClick={closeMobileMenu}>
            <h1 className="text-xl font-black text-gray-900 transition-all group-hover:text-red-600 sm:text-2xl lg:text-3xl">
              José Vega
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href="/"
              className="flex items-center gap-2 text-base font-bold text-gray-700 transition-colors hover:text-red-600"
            >
              <Home className="h-4 w-4" />
              <span>Obras</span>
            </Link>
            <Link
              href="/obra-a-pedido"
              className="flex items-center gap-2 text-base font-bold text-gray-700 transition-colors hover:text-red-600"
            >
              <Palette className="h-4 w-4" />
              <span>Obra a Pedido</span>
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 text-base font-bold text-gray-700 transition-colors hover:text-red-600"
            >
              <BookOpen className="h-4 w-4" />
              <span>Blog</span>
            </Link>

            {/* Icons Group */}
            <div className="flex items-center gap-4">
              <Link
                href="/wishlist"
                className="relative flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-2 transition-all hover:border-red-600 hover:bg-red-50"
              >
                <Heart className="h-5 w-5 text-gray-700" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/carrito"
                className="relative flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-2 transition-all hover:border-red-600 hover:bg-red-50"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Admin Button */}
            {isAdmin && (
              <Link
                href="/admin"
                className="relative flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 hover:shadow-md"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
                {pendingOrdersCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black shadow-lg animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu (Desktop) */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">
                    {user.email}
                  </span>
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
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
                className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
                Iniciar Sesión
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="z-50 flex items-center justify-center rounded-lg border-2 border-black bg-white p-2 text-gray-900 transition-all hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {showMobileMenu ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeMobileMenu}
          />
          <div className="fixed right-0 top-9 z-40 h-full w-[280px] overflow-y-auto border-l-4 border-black bg-white shadow-2xl lg:hidden">
            <div className="flex flex-col p-6 pt-20">
              {/* User Info (if logged in) */}
              {user && (
                <div className="mb-6 border-b-4 border-black pb-4">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {user.displayName || "Usuario"}
                      </p>
                      <p className="truncate text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-2">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 transition-all hover:border-red-600 hover:bg-red-50 hover:text-red-600"
                >
                  <Home className="h-5 w-5" />
                  <span>Obras</span>
                </Link>
                <Link
                  href="/obra-a-pedido"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 transition-all hover:border-red-600 hover:bg-red-50 hover:text-red-600"
                >
                  <Palette className="h-5 w-5" />
                  <span>Obra a Pedido</span>
                </Link>
                <Link
                  href="/blog"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 transition-all hover:border-red-600 hover:bg-red-50 hover:text-red-600"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Blog</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 transition-all hover:border-red-600 hover:bg-red-50 hover:text-red-600"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5" />
                    <span>Lista de Deseos</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/carrito"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 transition-all hover:border-red-600 hover:bg-red-50 hover:text-red-600"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Carrito</span>
                  </div>
                  {itemCount > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Divider */}
                <div className="my-4 border-t-2 border-gray-200"></div>

                {/* User Actions */}
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                    >
                      <User className="h-5 w-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={closeMobileMenu}
                        className="relative flex items-center justify-between gap-3 rounded-lg border-2 border-red-600 bg-red-600 px-4 py-3 font-bold text-white transition-all hover:bg-red-700"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5" />
                          <span>Panel Admin</span>
                        </div>
                        {pendingOrdersCount > 0 && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black">
                            {pendingOrdersCount}
                          </span>
                        )}
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-left font-bold text-red-600 transition-all hover:border-red-600 hover:bg-red-100"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-bold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                  >
                    <User className="h-5 w-5" />
                    <span>Iniciar Sesión</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
      <ToastContainer />
    </header>
  );
}
