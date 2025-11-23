"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-moss-50 via-white to-slate-50 px-4">
        <div className="text-center">
          <div className="rounded-2xl border border-moss-200 bg-white/95 p-12 shadow-xl shadow-moss-900/10 backdrop-blur">
            <ShoppingBag className="mx-auto mb-4 h-24 w-24 text-moss-600" />
            <h2 className="mb-2 text-3xl font-semibold text-slate-900">
              Tu carrito está vacío
            </h2>
            <p className="mb-6 text-slate-600">
              Agrega algunas obras a tu carrito para continuar
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-moss-500 via-moss-500 to-moss-500 px-6 py-3 font-semibold text-white shadow-lg shadow-moss-900/10 transition hover:shadow-xl"
            >
              Ver Obras
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-moss-50 via-white to-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-semibold text-slate-900 sm:text-5xl">
          Carrito de Compras
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.painting.id}
                  className="flex gap-4 rounded-2xl border border-moss-200 bg-white/95 p-4 shadow-lg shadow-moss-900/10 backdrop-blur sm:gap-6"
                >
                  {/* Image */}
                  <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl border border-moss-100 sm:h-40 sm:w-32">
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
                            <h3 className="text-lg font-semibold text-slate-900 transition-colors hover:text-moss-600">
                              {item.painting.title}
                            </h3>
                          </Link>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.painting.dimensions.width} x{" "}
                            {item.painting.dimensions.height} cm
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.painting.id)}
                          className="text-slate-400 transition-colors hover:text-moss-600"
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
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-moss-200 bg-moss-100/60 text-moss-700 transition hover:border-moss-300 hover:bg-moss-100"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.painting.id, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-moss-200 bg-moss-100/60 text-moss-700 transition hover:border-moss-300 hover:bg-moss-100"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                        <p className="text-xl font-semibold text-moss-700">
                        {formatPrice(item.painting.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={clearCart}
                className="mt-4 text-sm font-medium text-slate-500 transition-colors hover:text-moss-600 hover:underline"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-xl shadow-moss-900/10 backdrop-blur">
                <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                Resumen del Pedido
              </h2>

                <div className="space-y-3 border-b border-slate-200/70 pb-4">
                  <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">{formatPrice(getTotal())}</span>
                </div>
                  <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                    <span className="text-slate-500">A calcular</span>
                </div>
              </div>

                <div className="mt-4 flex justify-between border-t border-moss-200 pt-4 text-xl font-semibold">
                  <span className="text-slate-900">Total</span>
                  <span className="text-moss-700">{formatPrice(getTotal())}</span>
              </div>

              <Link
                href="/checkout"
                  className="mt-6 block w-full rounded-xl bg-linear-to-r from-moss-500 via-moss-500 to-moss-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-moss-900/10 transition hover:shadow-xl text-center"
              >
                Proceder al Pago
              </Link>

                <p className="mt-4 text-center text-xs text-slate-500">
                El costo de envío se calculará durante el proceso de pago
              </p>

              <Link
                href="/"
                  className="mt-4 block text-center text-sm font-medium text-slate-500 transition-colors hover:text-moss-600 hover:underline"
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
