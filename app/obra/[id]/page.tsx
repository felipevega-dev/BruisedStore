"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Painting } from "@/types";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingCart, CheckCircle2, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export default function PaintingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [painting, setPainting] = useState<Painting | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

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
  const currentImage = images[selectedImageIndex] || "";

  const handleImageClick = () => {
    setIsZoomed(true);
  };

  const handleZoomClose = () => {
    setIsZoomed(false);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
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
            className="inline-flex items-center gap-2 font-semibold text-red-600 transition-colors hover:text-red-700 hover:underline"
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="group mb-6 flex items-center gap-2 font-semibold text-gray-700 transition-colors hover:text-red-600"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span>Volver</span>
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative w-full cursor-zoom-in overflow-hidden border-4 border-black bg-gray-50"
              style={{
                minHeight: "500px",
                maxHeight: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleImageClick}
            >
              <div className="relative flex h-full w-full items-center justify-center p-4">
                <Image
                  src={currentImage}
                  alt={painting.title}
                  width={1200}
                  height={1600}
                  className="h-auto max-h-full w-auto max-w-full object-contain"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{
                    objectFit: "contain",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border-4 border-black bg-white p-2 text-black transition-all hover:bg-gray-100"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border-4 border-black bg-white p-2 text-black transition-all hover:bg-gray-100"
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              <div className="absolute bottom-2 right-2 rounded-full border-4 border-black bg-white p-2 text-black">
                <ZoomIn className="h-5 w-5" />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square w-full overflow-hidden border-4 transition-all ${
                      selectedImageIndex === index
                        ? "border-red-600 shadow-lg"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${painting.title} - Vista ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <p className="text-center text-sm font-semibold text-gray-600">
                Imagen {selectedImageIndex + 1} de {images.length}
              </p>
            )}
          </div>

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
                        : "text-red-600"
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
                <p className="text-5xl font-black text-red-600">
                  {formatPrice(painting.price)}
                </p>
              </div>

              {painting.available && (
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className="group flex w-full items-center justify-center gap-3 border-4 border-black bg-red-600 px-6 py-4 text-lg font-black text-white transition-all hover:bg-red-700 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] disabled:bg-green-600 disabled:text-white"
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
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
          onClick={handleZoomClose}
        >
          <button
            onClick={handleZoomClose}
            className="absolute right-4 top-4 z-50 rounded-full border-4 border-white bg-white p-2 text-black transition-all hover:bg-gray-100"
            aria-label="Cerrar zoom"
          >
            <X className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full border-4 border-white bg-white p-3 text-black transition-all hover:bg-gray-100"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full border-4 border-white bg-white p-3 text-black transition-all hover:bg-gray-100"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div
            className="flex h-full w-full items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
          >
            <div className="relative flex h-full w-full items-center justify-center p-8">
              <Image
                src={currentImage}
                alt={painting.title}
                width={2000}
                height={2000}
                className="h-auto max-h-full w-auto max-w-full object-contain"
                sizes="90vw"
                style={{
                  objectFit: "contain",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
                priority
              />
            </div>
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border-4 border-white bg-white px-4 py-2 font-bold text-black">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
