"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useMusic } from "@/contexts/MusicContext";
import { ShoppingCart, User, LogOut, Shield, Settings, Heart, Menu, X, Home, Palette, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";

export default function Header() {
  const { getItemCount } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { wishlistCount } = useWishlist();
  const { hasMusicBar, isMounted } = useMusic();
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

  // Calcular la clase de posición - solo aplicar top-9 si está montado Y tiene barra
  // Si no está montado, usar top-0 para evitar mismatch
  const headerTopClass = isMounted && hasMusicBar ? 'top-9' : 'top-0';

  return (
    <header className={`sticky ${headerTopClass} z-30 w-full border-b-4 border-black bg-white shadow-lg`} suppressHydrationWarning>
      {/* Email Verification Banner */}
      {user && !user.emailVerified && (
        <div className="border-b-2 border-orange-500 bg-orange-100 py-2 text-center">
          <p className="text-sm font-bold text-orange-900">
            ⚠️ Tu email no está verificado.{" "}
            <Link href="/verify-email" className="underline hover:text-orange-700">
              Verificar ahora
            </Link>
          </p>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16 lg:h-20 lg:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center group z-50 shrink-0" onClick={closeMobileMenu}>
            <h1 className="text-base font-black text-gray-900 transition-all group-hover:text-primary-500 sm:text-xl lg:text-3xl">
              José Vega
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-3 lg:flex lg:gap-4 xl:gap-6">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border-2 border-transparent px-3 py-1.5 text-sm font-bold text-gray-700 transition-all hover:border-primary-500 hover:bg-primary-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] xl:text-base"
            >
              <Home className="h-4 w-4" />
              <span>Obras</span>
            </Link>
            <Link
              href="/obra-a-pedido"
              className="flex items-center gap-1.5 rounded-lg border-2 border-transparent px-3 py-1.5 text-sm font-bold text-gray-700 transition-all hover:border-primary-500 hover:bg-primary-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] xl:text-base"
            >
              <Palette className="h-4 w-4" />
              <span>Obra a Pedido</span>
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-1.5 rounded-lg border-2 border-transparent px-3 py-1.5 text-sm font-bold text-gray-700 transition-all hover:border-primary-500 hover:bg-primary-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] xl:text-base"
            >
              <BookOpen className="h-4 w-4" />
              <span>Blog</span>
            </Link>

            {/* Icons Group */}
            <div className="flex items-center gap-2 lg:gap-3">
              <Link
                href="/wishlist"
                className="relative flex items-center justify-center rounded-lg border-2 border-black bg-white p-2 transition-all hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Heart className="h-5 w-5 text-gray-900" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-primary-500 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/carrito"
                className="relative flex items-center justify-center rounded-lg border-2 border-black bg-white p-2 transition-all hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <ShoppingCart className="h-5 w-5 text-gray-900" />
                {itemCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-primary-500 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Admin Button */}
            {isAdmin && (
              <Link
                href="/admin"
                className="relative flex items-center gap-1.5 rounded-lg border-2 border-black bg-secondary-500 px-3 py-2 text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:bg-secondary-600 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
                {pendingOrdersCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-orange-500 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
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
                  className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden max-w-[100px] truncate xl:inline">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-3 w-64 rounded-lg border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <div className="p-2">
                        <div className="border-b-2 border-gray-900 px-3 py-3">
                          <p className="text-sm font-bold text-gray-900">
                            {user.displayName || "Usuario"}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-gray-900 transition-all hover:bg-primary-50 hover:text-primary-600"
                            onClick={() => setShowMenu(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>Mi Perfil</span>
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-gray-900 transition-all hover:bg-secondary-50 hover:text-secondary-600"
                              onClick={() => setShowMenu(false)}
                            >
                              <Settings className="h-4 w-4" />
                              <span>Panel Admin</span>
                            </Link>
                          )}
                        </div>
                        <div className="border-t-2 border-gray-900 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-red-600 transition-all hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                Iniciar Sesión
              </Link>
            )}
          </nav>

          {/* Mobile Icons & Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            {/* Wishlist - Always visible on mobile */}
            <Link
              href="/wishlist"
              className="relative flex items-center justify-center rounded-lg border-2 border-black bg-white p-1.5 transition-all hover:bg-primary-50 sm:p-2"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-black bg-primary-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart - Always visible on mobile */}
            <Link
              href="/carrito"
              className="relative flex items-center justify-center rounded-lg border-2 border-black bg-white p-1.5 transition-all hover:bg-primary-50 sm:p-2"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-black bg-primary-500 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="z-50 flex items-center justify-center rounded-lg border-2 border-black bg-white p-1.5 text-gray-900 transition-all hover:bg-gray-100 sm:p-2"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={closeMobileMenu}
          />
          <div className={`fixed right-0 ${isMounted && hasMusicBar ? 'top-[calc(3.5rem+2.25rem)]' : 'top-14'} sm:${isMounted && hasMusicBar ? 'top-[calc(4rem+2.25rem)]' : 'top-16'} z-40 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-[280px] overflow-y-auto border-l-4 border-black bg-linear-to-br from-blue-50 via-white to-slate-50 shadow-2xl lg:hidden`}>
            <div className="flex flex-col h-full">
              {/* Close Button - Inside Sidebar */}
              <div className="flex items-center justify-between border-b-4 border-black bg-white p-3">
                <h2 className="text-lg font-black text-gray-900">Menú</h2>
                <button
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center rounded-lg border-2 border-black bg-white p-2 text-gray-900 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {/* User Info (if logged in) */}
                {user && (
                <div className="mb-4 rounded-lg border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-linear-to-br from-primary-500 to-blue-600">
                      <User className="h-6 w-6 text-white" />
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
                <p className="px-2 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Navegación</p>
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg border-2 border-black bg-white px-4 py-3 font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-50"
                >
                  <Home className="h-5 w-5" />
                  <span>Obras</span>
                </Link>
                <Link
                  href="/obra-a-pedido"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg border-2 border-black bg-white px-4 py-3 font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-50"
                >
                  <Palette className="h-5 w-5" />
                  <span>Obra a Pedido</span>
                </Link>
                <Link
                  href="/blog"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg border-2 border-black bg-white px-4 py-3 font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-50"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Blog</span>
                </Link>

                {/* User Actions Section */}
                <div className="pt-3">
                  <p className="px-2 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Mi Cuenta</p>
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-lg border-2 border-black bg-white px-4 py-3 font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-50"
                      >
                        <User className="h-5 w-5" />
                        <span>Mi Perfil</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={closeMobileMenu}
                          className="relative mt-2 flex items-center justify-between gap-3 rounded-lg border-2 border-black bg-secondary-500 px-4 py-3 font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-secondary-600"
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5" />
                            <span>Panel Admin</span>
                          </div>
                          {pendingOrdersCount > 0 && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-xs font-bold text-white">
                              {pendingOrdersCount}
                            </span>
                          )}
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="mt-2 flex w-full items-center gap-3 rounded-lg border-2 border-black bg-red-50 px-4 py-3 text-left font-bold text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-100"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-lg border-2 border-black bg-white px-4 py-3 font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-50"
                    >
                      <User className="h-5 w-5" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  )}
                </div>
              </nav>
              </div>
            </div>
          </div>
        </>
      )}
      <ToastContainer />
    </header>
  );
}
