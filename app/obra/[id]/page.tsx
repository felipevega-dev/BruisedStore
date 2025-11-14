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
import ReviewSection from "@/components/ReviewSection";
import ImageGallery from "@/components/ImageGallery";
import ShareButtons from "@/components/ShareButtons";
import { generateProductSchema } from "@/lib/metadata";

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

  // Obtener todas las imágenes disponibles
  const getImages = (painting: Painting): string[] => {
    if (painting.images && painting.images.length > 0) {
      return painting.images;
    }
    return [painting.imageUrl];
  };

  const images = painting ? getImages(painting) : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-moss-600" />
          <p className="mt-4 text-center font-semibold text-gray-900">Cargando obra...</p>
        </div>
      </div>
    );
  }

  if (!painting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <div className="border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="mb-4 text-3xl font-black text-black">
            Obra no encontrada
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-moss-600 transition-colors hover:text-moss-700 hover:underline"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver a la galería
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductSchema(painting)),
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="group mb-6 flex items-center gap-2 font-semibold text-gray-700 transition-colors hover:text-moss-600"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span>Volver</span>
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <ImageGallery 
            images={images} 
            title={painting.title} 
          />

          {/* Details */}
          <div className="flex flex-col">
            <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
              <h1 className="mb-4 text-3xl font-black text-black sm:text-4xl lg:text-5xl">
                {painting.title}
              </h1>

              {painting.description && (
                <p className="mb-6 text-lg text-gray-700 leading-relaxed">
                  {painting.description}
                </p>
              )}

              <div className="mb-6 space-y-4 border-t-4 border-black pt-4">
                <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3">
                  <span className="font-semibold text-gray-600">Dimensiones</span>
                  <span className="font-bold text-black">
                    {painting.dimensions.width} x {painting.dimensions.height} cm
                  </span>
                </div>

                <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3">
                  <span className="font-semibold text-gray-600">Estado</span>
                  <span
                    className={`font-bold ${
                      painting.available
                        ? "text-green-600"
                        : "text-moss-600"
                    }`}
                  >
                    {painting.available ? "Disponible" : "No disponible"}
                  </span>
                </div>

                {painting.category && (
                  <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3">
                    <span className="font-semibold text-gray-600">Categoría</span>
                    <span className="font-bold text-black">
                      {painting.category}
                    </span>
                  </div>
                )}

                {painting.orientation && (
                  <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3">
                    <span className="font-semibold text-gray-600">Orientación</span>
                    <span className="font-bold capitalize text-black">
                      {painting.orientation === "horizontal" ? "Horizontal" : "Vertical"}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-8 border-t-4 border-black pt-6">
                <p className="text-5xl font-black text-moss-600">
                  {formatPrice(painting.price)}
                </p>
              </div>

              {painting.available && (
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className="group flex w-full items-center justify-center gap-3 border-4 border-black bg-moss-500 px-6 py-4 text-lg font-black text-white transition-all hover:bg-moss-600 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] disabled:bg-green-600 disabled:text-white"
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
                <div className="border-4 border-gray-400 bg-gray-100 p-6 text-center">
                  <p className="text-lg font-bold text-gray-700">
                    Esta obra ya no está disponible
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mt-8">
          <ShareButtons
            url={`/obra/${painting.id}`}
            title={painting.title}
            imageUrl={images[0]}
          />
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewSection paintingId={painting.id} />
        </div>
      </div>
    </div>
  );
}
