"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Painting } from "@/types";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingCart, CheckCircle2 } from "lucide-react";

export default function PaintingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [painting, setPainting] = useState<Painting | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchPainting = async () => {
      try {
        const paintingId = params.id as string;
        const docRef = doc(db, "paintings", paintingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPainting({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Painting);
        } else {
          console.error("Painting not found");
        }
      } catch (error) {
        console.error("Error fetching painting:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPainting();
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const handleAddToCart = () => {
    if (painting) {
      addToCart(painting);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black">
        <div className="rounded-lg border-2 border-red-900 bg-black/60 p-8 backdrop-blur-sm">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
          <p className="mt-4 text-center text-gray-300">Cargando obra...</p>
        </div>
      </div>
    );
  }

  if (!painting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black px-4">
        <div className="rounded-lg border-2 border-red-900 bg-black/60 p-12 text-center backdrop-blur-sm shadow-2xl shadow-red-900/30">
          <h1 className="mb-4 text-3xl font-bold text-red-100">
            Obra no encontrada
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-red-400 transition-colors hover:text-red-300 hover:underline"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver a la galería
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="group mb-6 flex items-center gap-2 text-gray-300 transition-colors hover:text-red-400"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span>Volver</span>
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border-2 border-red-900/30 bg-black/60 shadow-2xl shadow-red-900/30 backdrop-blur-sm">
            <Image
              src={painting.imageUrl}
              alt={painting.title}
              fill
              className="object-contain p-4"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="rounded-lg border-2 border-red-900 bg-black/60 p-6 shadow-2xl shadow-red-900/30 backdrop-blur-sm sm:p-8">
              <h1 className="mb-4 text-3xl font-bold text-red-100 sm:text-4xl lg:text-5xl">
                {painting.title}
              </h1>

              {painting.description && (
                <p className="mb-6 text-lg text-gray-300 leading-relaxed">
                  {painting.description}
                </p>
              )}

              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between border-b border-red-900/30 pb-3">
                  <span className="text-gray-400">Dimensiones</span>
                  <span className="font-semibold text-red-100">
                    {painting.dimensions.width} x {painting.dimensions.height} cm
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-red-900/30 pb-3">
                  <span className="text-gray-400">Estado</span>
                  <span
                    className={`font-semibold ${
                      painting.available
                        ? "text-green-400"
                        : "text-red-500"
                    }`}
                  >
                    {painting.available ? "Disponible" : "No disponible"}
                  </span>
                </div>

                {painting.category && (
                  <div className="flex items-center justify-between border-b border-red-900/30 pb-3">
                    <span className="text-gray-400">Categoría</span>
                    <span className="font-semibold text-red-100">
                      {painting.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <p className="text-5xl font-bold text-red-500">
                  {formatPrice(painting.price)}
                </p>
              </div>

              {painting.available && (
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className="group flex w-full items-center justify-center gap-3 rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-4 text-lg font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-2xl hover:shadow-red-900/50 disabled:from-green-900 disabled:to-green-800 disabled:text-green-100"
                >
                  {addedToCart ? (
                    <>
                      <CheckCircle2 className="h-6 w-6" />
                      ¡Agregado al carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-6 w-6 transition-transform group-hover:scale-110" />
                      Agregar al carrito
                    </>
                  )}
                </button>
              )}

              {!painting.available && (
                <div className="rounded-lg border-2 border-red-900/50 bg-red-950/30 p-6 text-center backdrop-blur-sm">
                  <p className="text-lg font-semibold text-red-200">
                    Esta obra ya no está disponible
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
