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
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-slate-50">
        <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500" />
          <p className="mt-4 text-center font-bold text-slate-900">Cargando obra...</p>
        </div>
      </div>
    );
  }

  if (!painting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-blue-50 to-slate-50 px-4">
        <div className="rounded-lg border-4 border-black bg-white p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:p-12">
          <h1 className="mb-4 text-2xl font-black text-slate-900 sm:text-3xl">
            Obra no encontrada
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-primary-600 transition-colors hover:text-primary-700 hover:underline"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver a la galería
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 py-6 sm:py-10">
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
          className="group mb-6 flex items-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-2 font-bold text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-slate-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
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
            <div className="rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:p-7">
              <h1 className="mb-3 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">
                {painting.title}
              </h1>

              {painting.description && (
                <p className="mb-5 text-base leading-relaxed text-slate-700 sm:text-lg">
                  {painting.description}
                </p>
              )}

              <div className="mb-5 space-y-3 rounded-lg border-4 border-black bg-white p-4">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5">
                  <span className="text-sm font-bold text-slate-600 sm:text-base">Dimensiones</span>
                  <span className="text-sm font-black text-slate-900 sm:text-base">
                    {painting.dimensions.width} × {painting.dimensions.height} cm
                  </span>
                </div>

                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5">
                  <span className="text-sm font-bold text-slate-600 sm:text-base">Estado</span>
                  <span
                    className={`text-sm font-black sm:text-base ${
                      painting.available
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {painting.available ? "Disponible" : "No disponible"}
                  </span>
                </div>

                {painting.category && (
                  <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5">
                    <span className="text-sm font-bold text-slate-600 sm:text-base">Categoría</span>
                    <span className="text-sm font-black text-slate-900 sm:text-base">
                      {painting.category}
                    </span>
                  </div>
                )}

                {painting.orientation && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600 sm:text-base">Orientación</span>
                    <span className="text-sm font-black capitalize text-slate-900 sm:text-base">
                      {painting.orientation === "horizontal" ? "Horizontal" : "Vertical"}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-6 rounded-lg border-4 border-black bg-white p-4 text-center">
                <p className="text-3xl font-black text-primary-600 sm:text-4xl">
                  {formatPrice(painting.price)}
                </p>
              </div>

              {painting.available && (
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-lg border-4 border-black bg-primary-500 px-6 py-3.5 text-base font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:bg-green-600 sm:text-lg"
                >
                  {addedToCart ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                      ¡Agregado al carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110 sm:h-6 sm:w-6" />
                      Agregar al carrito
                    </>
                  )}
                </button>
              )}

              {!painting.available && (
                <div className="rounded-lg border-4 border-black bg-orange-100 p-5 text-center">
                  <p className="text-base font-black text-orange-700 sm:text-lg">
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
