"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Painting } from "@/types";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";

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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!painting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Obra no encontrada
        </h1>
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-900 hover:underline"
        >
          Volver a la galería
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-white shadow-lg">
            <Image
              src={painting.imageUrl}
              alt={painting.title}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="rounded-lg bg-white p-6 shadow-md sm:p-8">
              <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                {painting.title}
              </h1>

              {painting.description && (
                <p className="mb-6 text-gray-600">{painting.description}</p>
              )}

              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-gray-600">Dimensiones</span>
                  <span className="font-medium text-gray-900">
                    {painting.dimensions.width} x {painting.dimensions.height} cm
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-gray-600">Estado</span>
                  <span
                    className={`font-medium ${
                      painting.available ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {painting.available ? "Disponible" : "No disponible"}
                  </span>
                </div>

                {painting.category && (
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-gray-600">Categoría</span>
                    <span className="font-medium text-gray-900">
                      {painting.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-900">
                  {formatPrice(painting.price)}
                </p>
              </div>

              {painting.available && (
                <button
                  onClick={handleAddToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-6 py-4 text-base font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
                  disabled={addedToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {addedToCart ? "¡Agregado al carrito!" : "Agregar al carrito"}
                </button>
              )}

              {!painting.available && (
                <div className="rounded-md bg-gray-100 p-4 text-center">
                  <p className="text-gray-600">
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
