"use client";

import Image from "next/image";
import Link from "next/link";
import { Painting } from "@/types";
import { useCart } from "@/contexts/CartContext";

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
    <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/obra/${painting.id}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
          <Image
            src={painting.imageUrl}
            alt={painting.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!painting.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-md bg-white px-4 py-2 text-sm font-semibold">
                No Disponible
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/obra/${painting.id}`}>
          <h3 className="mb-1 text-lg font-semibold text-gray-900 transition-colors hover:text-gray-700">
            {painting.title}
          </h3>
        </Link>
        <p className="mb-2 text-sm text-gray-600">
          {painting.dimensions.width} x {painting.dimensions.height} cm
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">
            {formatPrice(painting.price)}
          </p>
          {painting.available && (
            <button
              onClick={() => addToCart(painting)}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
