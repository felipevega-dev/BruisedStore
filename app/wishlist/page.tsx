"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Painting } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && wishlist.length > 0) {
      fetchWishlistPaintings();
    } else {
      setPaintings([]);
      setLoading(false);
    }
  }, [wishlist, user]);

  const fetchWishlistPaintings = async () => {
    try {
      setLoading(true);

      // Fetch all paintings in parallel instead of sequentially
      const paintingPromises = wishlist.map((paintingId) =>
        getDoc(doc(db, "paintings", paintingId))
      );

      const paintingSnaps = await Promise.all(paintingPromises);

      const paintingsData: Painting[] = paintingSnaps
        .filter((snap) => snap.exists())
        .map((snap) => {
          const data = snap.data();
          return {
            id: snap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Painting;
        });

      setPaintings(paintingsData);
    } catch (error) {
      console.error("Error fetching wishlist paintings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (paintingId: string) => {
    await removeFromWishlist(paintingId);
  };

  const handleAddToCart = (painting: Painting) => {
    addToCart(painting);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-slate-50 to-blue-50">
        <div className="rounded-lg border-4 border-black bg-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-slate-50 to-blue-50 py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <Link
            href="/"
            className="rounded-lg border-2 border-black bg-white p-2 text-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-50 hover:text-primary-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-black bg-linear-to-br from-red-500 to-pink-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-4xl">
              Mi Lista de Deseos
            </h1>
          </div>
        </div>

        {/* Content */}
        {paintings.length === 0 ? (
          <div className="rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:p-12">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-linear-to-br from-red-500 to-pink-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Heart className="h-12 w-12 fill-white text-white" />
            </div>
            <h2 className="mb-3 text-xl font-black text-slate-900 sm:mb-4 sm:text-2xl">
              Tu lista de deseos está vacía
            </h2>
            <p className="mb-6 text-sm text-slate-600 sm:text-base">
              Explora nuestra galería y guarda tus obras favoritas
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border-4 border-black bg-primary-500 px-6 py-3 font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Ver Galería</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between rounded-lg border-4 border-black bg-white px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:mb-6">
              <p className="text-sm font-black text-slate-900 sm:text-base">
                {paintings.length} {paintings.length === 1 ? "obra guardada" : "obras guardadas"}
              </p>
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {paintings.map((painting) => {
                const displayImage =
                  painting.images && painting.images.length > 0
                    ? painting.images[0]
                    : painting.imageUrl;

                return (
                  <div
                    key={painting.id}
                    className="group flex flex-col overflow-hidden rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  >
                    <Link href={`/obra/${painting.id}`}>
                      <div
                        className="relative w-full overflow-hidden border-b-4 border-black bg-slate-100"
                        style={{
                          aspectRatio:
                            painting.orientation === "horizontal"
                              ? "4/3"
                              : "3/4",
                        }}
                      >
                        <Image
                          src={displayImage}
                          alt={painting.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {!painting.available && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                            <span className="rounded-lg border-4 border-white bg-slate-900 px-4 py-2 text-sm font-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                              No Disponible
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                      <Link href={`/obra/${painting.id}`}>
                        <h3 className="mb-1.5 text-base font-black text-slate-900 transition-colors hover:text-primary-600 sm:mb-2 sm:text-lg">
                          {painting.title}
                        </h3>
                      </Link>
                      <p className="mb-2 text-xs font-bold text-slate-600 sm:text-sm">
                        {painting.dimensions.width} × {painting.dimensions.height} cm
                      </p>
                      <p className="mb-3 text-xl font-black text-primary-600 sm:mb-4 sm:text-2xl">
                        {formatPrice(painting.price)}
                      </p>

                      <div className="mt-auto flex gap-2">
                        {painting.available && (
                          <button
                            onClick={() => handleAddToCart(painting)}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-4 border-black bg-primary-500 px-3 py-2 text-xs font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none sm:px-4 sm:text-sm"
                          >
                            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Agregar</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(painting.id)}
                          className="flex items-center justify-center gap-1.5 rounded-lg border-4 border-black bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-600 hover:shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none sm:px-4 sm:text-sm"
                          aria-label="Quitar de favoritos"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
