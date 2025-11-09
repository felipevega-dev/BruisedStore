"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Imagen Principal */}
      <div className="relative aspect-square bg-neutral-100 border-4 border-black overflow-hidden group">
        <Image
          src={images[currentIndex]}
          alt={`${title} - Imagen ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority
        />
        
        {/* Navegación - Solo mostrar si hay más de una imagen */}
        {images.length > 1 && (
          <>
            {/* Botón Anterior */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-4 border-black p-2 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         hover:bg-yellow-300 active:translate-y-[-48%]"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            {/* Botón Siguiente */}
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white border-4 border-black p-2 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         hover:bg-yellow-300 active:translate-y-[-48%]"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicador de posición */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 text-sm font-bold">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas - Solo mostrar si hay más de una imagen */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`
                relative aspect-square border-4 overflow-hidden
                transition-all duration-200 hover:border-yellow-300
                ${index === currentIndex 
                  ? 'border-yellow-400 ring-4 ring-yellow-400 ring-offset-2' 
                  : 'border-black opacity-70 hover:opacity-100'
                }
              `}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${title} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
