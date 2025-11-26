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
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-slate-50 to-blue-50 px-4">
        <div className="text-center">
          <div className="rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-12">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-linear-to-br from-primary-500 to-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ShoppingBag className="h-12 w-12 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-black text-slate-900 sm:text-3xl">
              Tu carrito está vacío
            </h2>
            <p className="mb-6 text-sm text-slate-600 sm:text-base">
              Agrega algunas obras a tu carrito para continuar
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border-4 border-black bg-primary-500 px-6 py-3 font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              Ver Obras
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-slate-50 to-blue-50 py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-black text-slate-900 sm:mb-8 sm:text-4xl">
          Carrito de Compras
        </h1>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div
                  key={item.painting.id}
                  className="flex gap-3 rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 sm:gap-4 sm:p-4"
                >
                  {/* Image */}
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:h-32 sm:w-28">
                    <Image
                      src={item.painting.imageUrl}
                      alt={item.painting.title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Link href={`/obra/${item.painting.id}`}>
                            <h3 className="truncate text-base font-black text-slate-900 transition-colors hover:text-primary-600 sm:text-lg">
                              {item.painting.title}
                            </h3>
                          </Link>
                          <p className="mt-0.5 text-xs font-bold text-slate-600 sm:text-sm">
                            {item.painting.dimensions.width} × {item.painting.dimensions.height} cm
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.painting.id)}
                          className="rounded-lg border-2 border-black bg-white p-1.5 text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-600 sm:p-2"
                          aria-label="Eliminar del carrito"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.painting.id, item.quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded border-2 border-black bg-white text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-slate-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:h-8 sm:w-8"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="text-center text-sm font-black text-slate-900 sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.painting.id, item.quantity + 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded border-2 border-black bg-white text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-slate-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:h-8 sm:w-8"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>

                      {/* Price */}
                        <p className="text-base font-black text-primary-600 sm:text-xl">
                        {formatPrice(item.painting.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={clearCart}
                className="mt-3 text-xs font-bold text-slate-600 transition-colors hover:text-red-600 hover:underline sm:mt-4 sm:text-sm"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:p-6">
                <h2 className="mb-4 border-b-4 border-black pb-3 text-xl font-black text-slate-900 sm:text-2xl">
                Resumen del Pedido
              </h2>

                <div className="space-y-2.5 pb-4">
                  <div className="flex justify-between rounded border-2 border-black bg-white p-2.5">
                  <span className="text-sm font-bold text-slate-700">Subtotal</span>
                    <span className="text-sm font-black text-slate-900">{formatPrice(getTotal())}</span>
                </div>
                  <div className="flex justify-between rounded border-2 border-black bg-blue-50 p-2.5">
                  <span className="text-sm font-bold text-slate-700">Envío</span>
                    <span className="text-sm font-bold text-slate-600">A calcular</span>
                </div>
              </div>

                <div className="mt-4 flex justify-between rounded-lg border-4 border-black bg-primary-500 px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-base font-black text-white sm:text-lg">Total</span>
                  <span className="text-lg font-black text-white sm:text-xl">{formatPrice(getTotal())}</span>
              </div>

              <Link
                href="/checkout"
                  className="mt-5 block w-full rounded-lg border-4 border-black bg-primary-500 px-6 py-3 text-center text-base font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 sm:mt-6"
              >
                Proceder al Pago
              </Link>

                <p className="mt-3 text-center text-xs text-slate-600 sm:mt-4">
                El costo de envío se calculará durante el proceso de pago
              </p>

              <Link
                href="/"
                  className="mt-3 block text-center text-sm font-bold text-slate-600 transition-colors hover:text-primary-600 hover:underline sm:mt-4"
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
