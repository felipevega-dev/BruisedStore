"use client";

import Image from "next/image";
import Link from "next/link";
import { Painting } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";

interface PaintingCardProps {
  painting: Painting;
}

export default function PaintingCard({ painting }: PaintingCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border-2 border-red-900/30 bg-black/60 shadow-xl shadow-red-900/20 backdrop-blur-sm transition-all duration-300 hover:border-red-700 hover:shadow-2xl hover:shadow-red-900/40">
      <Link href={`/obra/${painting.id}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          <Image
            src={painting.imageUrl}
            alt={painting.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          {!painting.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <span className="rounded-lg border-2 border-red-900 bg-red-950/80 px-4 py-2 text-sm font-bold text-red-100 backdrop-blur-sm">
                No Disponible
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 sm:p-5">
        <Link href={`/obra/${painting.id}`}>
          <h3 className="mb-2 text-lg font-bold text-red-100 transition-colors hover:text-red-400 sm:text-xl">
            {painting.title}
          </h3>
        </Link>
        <p className="mb-4 text-sm text-gray-400">
          {painting.dimensions.width} x {painting.dimensions.height} cm
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-bold text-red-500">
            {formatPrice(painting.price)}
          </p>
          {painting.available && (
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(painting);
              }}
              className="group/btn flex items-center justify-center gap-2 rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900/80 to-red-800/80 px-4 py-2 text-sm font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50 active:scale-95"
            >
              <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
              <span>Agregar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
