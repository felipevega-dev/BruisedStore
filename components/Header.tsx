"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-red-900/30 bg-black/80 backdrop-blur-md supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <h1 className="bg-gradient-to-r from-red-100 to-red-50 bg-clip-text text-xl font-bold text-transparent transition-all group-hover:from-red-400 group-hover:to-red-300 sm:text-2xl">
              Bruised Art
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-3 sm:space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-red-400 sm:text-base"
            >
              Obras
            </Link>
            <Link
              href="/obra-a-pedido"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-red-400 sm:text-base"
            >
              Obra a Pedido
            </Link>
            <Link
              href="/carrito"
              className="relative flex items-center space-x-1 text-sm font-medium text-gray-300 transition-colors hover:text-red-400 sm:text-base"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-700 text-xs font-bold text-red-100 shadow-lg shadow-red-900/50">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
