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
      const paintingsData: Painting[] = [];

      for (const paintingId of wishlist) {
        const paintingRef = doc(db, "paintings", paintingId);
        const paintingSnap = await getDoc(paintingRef);

        if (paintingSnap.exists()) {
          const data = paintingSnap.data();
          paintingsData.push({
            id: paintingSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Painting);
        }
      }

      setPaintings(paintingsData);
    } catch (error) {
      console.error("Error fetching wishlist paintings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const handleRemove = async (paintingId: string) => {
    await removeFromWishlist(paintingId);
  };

  const handleAddToCart = (painting: Painting) => {
    addToCart(painting);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-700 transition-colors hover:text-red-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 fill-red-600 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Mi Lista de Deseos
            </h1>
          </div>
        </div>

        {/* Content */}
        {paintings.length === 0 ? (
          <div className="rounded-lg border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Heart className="mx-auto mb-4 h-24 w-24 text-gray-300" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Tu lista de deseos está vacía
            </h2>
            <p className="mb-6 text-gray-600">
              Explora nuestra galería y guarda tus obras favoritas
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Ver Galería</span>
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-gray-600">
              {paintings.length} {paintings.length === 1 ? "obra guardada" : "obras guardadas"}
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paintings.map((painting) => {
                const displayImage =
                  painting.images && painting.images.length > 0
                    ? painting.images[0]
                    : painting.imageUrl;

                return (
                  <div
                    key={painting.id}
                    className="group overflow-hidden rounded-lg border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Link href={`/obra/${painting.id}`}>
                      <div
                        className="relative w-full overflow-hidden bg-gray-100"
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
                            <span className="border-4 border-white bg-red-600 px-4 py-2 text-sm font-bold text-white">
                              No Disponible
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="border-t-4 border-black p-4">
                      <Link href={`/obra/${painting.id}`}>
                        <h3 className="mb-2 text-lg font-bold text-black transition-colors hover:text-red-600">
                          {painting.title}
                        </h3>
                      </Link>
                      <p className="mb-2 text-sm text-gray-600">
                        {painting.dimensions.width} x {painting.dimensions.height}{" "}
                        cm
                      </p>
                      <p className="mb-4 text-2xl font-black text-red-600">
                        {formatPrice(painting.price)}
                      </p>

                      <div className="flex gap-2">
                        {painting.available && (
                          <button
                            onClick={() => handleAddToCart(painting)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-black bg-red-600 px-4 py-2 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Agregar</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(painting.id)}
                          className="flex items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-2 font-bold text-gray-700 transition-all hover:bg-gray-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          aria-label="Quitar de favoritos"
                        >
                          <Trash2 className="h-4 w-4" />
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
