"use client";

import Image from "next/image";
import Link from "next/link";
import { Painting } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { ShoppingCart, Heart, Images } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface PaintingCardProps {
  painting: Painting;
}

export default function PaintingCard({ painting }: PaintingCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast, ToastContainer } = useToast();

  const inWishlist = isInWishlist(painting.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      await removeFromWishlist(painting.id);
      showToast("Quitado de favoritos", "info");
    } else {
      await addToWishlist(painting.id);
      showToast("Agregado a favoritos ❤️", "success");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(painting);
    showToast(`"${painting.title}" agregado al carrito 🛒`, "success");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  // Usar la primera imagen del array si existe, sino usar imageUrl
  const displayImage = painting.images && painting.images.length > 0 
    ? painting.images[0] 
    : painting.imageUrl;

  const hasMultipleImages = painting.images && painting.images.length > 1;

  return (
    <div className="group relative overflow-hidden border-4 border-black bg-white transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <Link href={`/obra/${painting.id}`}>
        <div 
          className="relative w-full overflow-hidden bg-gray-100"
          style={{
            aspectRatio: painting.orientation === "horizontal" ? "4/3" : "3/4",
          }}
        >
          <Image
            src={displayImage}
            alt={painting.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Multiple images indicator */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full border-2 border-white bg-black/70 px-2 py-1 text-white">
              <Images className="h-4 w-4" />
              <span className="text-xs font-bold">{painting.images?.length}</span>
            </div>
          )}
          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute right-2 top-2 z-10 rounded-full border-2 p-2 transition-all ${
              inWishlist
                ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
                : "border-white bg-white/90 text-gray-700 hover:bg-white"
            }`}
            aria-label={inWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart
              className={`h-5 w-5 transition-transform hover:scale-110 ${
                inWishlist ? "fill-current" : ""
              }`}
            />
          </button>
          {!painting.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <span className="border-4 border-white bg-red-600 px-4 py-2 text-sm font-bold text-white">
                No Disponible
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="border-t-4 border-black bg-white p-4 sm:p-5">
        <Link href={`/obra/${painting.id}`}>
          <h3 className="mb-2 text-lg font-bold text-black transition-colors hover:text-red-600 sm:text-xl">
            {painting.title}
          </h3>
        </Link>
        <p className="mb-4 text-sm text-gray-600">
          {painting.dimensions.width} x {painting.dimensions.height} cm
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-black text-red-600">
            {formatPrice(painting.price)}
          </p>
          {painting.available && (
            <button
              onClick={handleAddToCart}
              className="group/btn flex items-center justify-center gap-2 border-4 border-black bg-red-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95"
            >
              <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
              <span>Agregar</span>
            </button>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
