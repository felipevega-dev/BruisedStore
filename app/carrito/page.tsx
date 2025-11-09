"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black px-4">
        <div className="text-center">
          <div className="rounded-lg border-2 border-red-900 bg-black/60 p-12 backdrop-blur-sm shadow-2xl shadow-red-900/30">
            <ShoppingBag className="mx-auto mb-4 h-24 w-24 text-red-600" />
            <h2 className="mb-2 text-3xl font-bold text-red-100">
              Tu carrito está vacío
            </h2>
            <p className="mb-6 text-gray-400">
              Agrega algunas obras a tu carrito para continuar
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-3 font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50"
            >
              Ver Obras
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-red-100 sm:text-5xl">
          Carrito de Compras
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.painting.id}
                  className="flex gap-4 rounded-lg border-2 border-red-900/30 bg-black/60 p-4 shadow-xl shadow-red-900/20 backdrop-blur-sm sm:gap-6"
                >
                  {/* Image */}
                  <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md border-2 border-red-900/30 sm:h-40 sm:w-32">
                    <Image
                      src={item.painting.imageUrl}
                      alt={item.painting.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <Link href={`/obra/${item.painting.id}`}>
                            <h3 className="text-lg font-bold text-red-100 transition-colors hover:text-red-400">
                              {item.painting.title}
                            </h3>
                          </Link>
                          <p className="mt-1 text-sm text-gray-400">
                            {item.painting.dimensions.width} x{" "}
                            {item.painting.dimensions.height} cm
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.painting.id)}
                          className="text-gray-400 transition-colors hover:text-red-400"
                          aria-label="Eliminar del carrito"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.painting.id, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-red-900 bg-red-900/20 text-red-100 transition-colors hover:bg-red-900/40"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-red-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.painting.id, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-red-900 bg-red-900/20 text-red-100 transition-colors hover:bg-red-900/40"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-xl font-bold text-red-500">
                        {formatPrice(item.painting.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={clearCart}
              className="mt-4 text-sm font-semibold text-gray-400 transition-colors hover:text-red-400 hover:underline"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border-2 border-red-900 bg-black/60 p-6 shadow-2xl shadow-red-900/30 backdrop-blur-sm">
              <h2 className="mb-4 text-2xl font-bold text-red-100">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 border-b border-red-900/30 pb-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Envío</span>
                  <span className="text-gray-400">A calcular</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-red-900/30 pt-4 text-xl font-bold">
                <span className="text-red-100">Total</span>
                <span className="text-red-500">{formatPrice(getTotal())}</span>
              </div>

              <button className="mt-6 w-full rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-3 text-base font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50">
                Proceder al Pago
              </button>

              <p className="mt-4 text-center text-xs text-gray-400">
                El costo de envío se calculará durante el proceso de pago
              </p>

              <Link
                href="/"
                className="mt-4 block text-center text-sm font-semibold text-gray-400 transition-colors hover:text-red-400 hover:underline"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
