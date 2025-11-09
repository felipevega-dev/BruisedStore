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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <ShoppingBag className="mx-auto mb-4 h-24 w-24 text-gray-300" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Tu carrito está vacío
          </h2>
          <p className="mb-6 text-gray-600">
            Agrega algunas obras a tu carrito para continuar
          </p>
          <Link
            href="/"
            className="inline-block rounded-md bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800"
          >
            Ver Obras
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Carrito de Compras
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.painting.id}
                  className="flex gap-4 rounded-lg bg-white p-4 shadow-sm sm:gap-6"
                >
                  {/* Image */}
                  <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md sm:h-40 sm:w-32">
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
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700">
                              {item.painting.title}
                            </h3>
                          </Link>
                          <p className="mt-1 text-sm text-gray-600">
                            {item.painting.dimensions.width} x{" "}
                            {item.painting.dimensions.height} cm
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.painting.id)}
                          className="text-gray-400 transition-colors hover:text-red-600"
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
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.painting.id, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(item.painting.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={clearCart}
              className="mt-4 text-sm text-gray-600 hover:text-red-600 hover:underline"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>A calcular</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>

              <button className="mt-6 w-full rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800">
                Proceder al Pago
              </button>

              <p className="mt-4 text-center text-xs text-gray-500">
                El costo de envío se calculará durante el proceso de pago
              </p>

              <Link
                href="/"
                className="mt-4 block text-center text-sm text-gray-600 hover:text-gray-900 hover:underline"
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
