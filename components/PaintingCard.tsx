"use client";

import Image from "next/image";
import Link from "next/link";
import { Painting } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { ShoppingCart, Heart, Images, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PaintingCardProps {
  painting: Painting;
}

export default function PaintingCard({ painting }: PaintingCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const inWishlist = isInWishlist(painting.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      await removeFromWishlist(painting.id);
    } else {
      await addToWishlist(painting.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    // Check stock availability
    if (painting.stock !== undefined && painting.stock <= 0) {
      return;
    }

    addToCart(painting);
  };

  // Usar la primera imagen del array si existe, sino usar imageUrl
  const displayImage = painting.images && painting.images.length > 0
    ? painting.images[0]
    : painting.imageUrl;

  const hasMultipleImages = painting.images && painting.images.length > 1;

  // Check stock status
  const isOutOfStock = painting.stock !== undefined && painting.stock <= 0;
  const isLowStock = painting.stock !== undefined && painting.stock > 0 &&
    painting.stock <= (painting.lowStockThreshold || 1);

  return (
    <div className="group relative overflow-hidden rounded-lg border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5">
      <Link href={`/obra/${painting.id}`}>
        <div
          className="relative w-full overflow-hidden bg-slate-100"
          style={{
            aspectRatio: painting.orientation === "horizontal" ? "4/3" : "3/4",
          }}
        >
          <Image
            src={displayImage}
            alt={painting.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {/* Multiple images indicator */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-md border-2 border-black bg-white px-2 py-1 shadow-md">
              <Images className="h-3 w-3 text-slate-700" />
              <span className="text-xs font-black text-slate-700">{painting.images?.length}</span>
            </div>
          )}
          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute right-2 top-2 z-10 rounded-md border-2 border-black p-1.5 shadow-md transition-all ${inWishlist
              ? "bg-primary-500 text-white hover:bg-primary-600"
              : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            aria-label={inWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart
              className={`h-4 w-4 transition-transform hover:scale-110 ${inWishlist ? "fill-current" : ""
                }`}
            />
          </button>
          {!painting.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <span className="rounded-md border-4 border-black bg-slate-200 px-4 py-2 text-sm font-black text-slate-900 shadow-lg">
                No Disponible
              </span>
            </div>
          )}
          {isOutOfStock && painting.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <span className="rounded-md border-4 border-black bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-lg">
                Agotado
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="border-t-4 border-black bg-linear-to-br from-blue-50 to-slate-50 p-3">
        <Link href={`/obra/${painting.id}`}>
          <h3 className="mb-2 line-clamp-2 text-base font-black text-slate-900 transition-colors hover:text-primary-600 sm:text-lg">
            {painting.title}
          </h3>
        </Link>
        
        {/* Dimensions and Stock - Mobile optimized */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-600 sm:text-sm">
            {painting.dimensions.width} × {painting.dimensions.height} cm
          </p>
          {isLowStock && !isOutOfStock && (
            <div className="flex items-center gap-1 rounded-md border-2 border-black bg-orange-100 px-1.5 py-0.5">
              <AlertTriangle className="h-3 w-3 text-orange-600" />
              <span className="text-xs font-black text-orange-700">
                ¡{painting.stock}!
              </span>
            </div>
          )}
        </div>

        {/* Price and Button - Mobile optimized */}
        {painting.available && !isOutOfStock ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xl font-black text-primary-600 sm:text-2xl">
              {formatPrice(painting.price)}
            </p>
            <button
              onClick={handleAddToCart}
              className="group/btn flex shrink-0 items-center gap-1.5 rounded-md border-4 border-black bg-primary-500 px-3 py-2 text-xs font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:scale-95 sm:px-4 sm:text-sm"
            >
              <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        ) : (
          <p className="text-xl font-black text-primary-600 sm:text-2xl">
            {formatPrice(painting.price)}
          </p>
        )}
      </div>
    </div>
  );
}
