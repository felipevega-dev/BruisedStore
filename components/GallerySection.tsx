"use client";

import { Painting, FilterOptions } from "@/types";
import PaintingCard from "./PaintingCard";
import FilterBar from "./FilterBar";

interface GallerySectionProps {
  paintings: Painting[];
  onFilterChange: (filters: FilterOptions) => void;
  totalResults: number;
}

export default function GallerySection({
  paintings,
  onFilterChange,
  totalResults,
}: GallerySectionProps) {
  return (
    <section id="galeria" className="bg-linear-to-br from-slate-50 to-blue-50 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-block rounded-lg border-4 border-black bg-primary-500 px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-lg font-black text-white sm:text-xl">
              🎨 GALERÍA COMPLETA
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">
            Todas las Obras
          </h2>
          <p className="mx-auto max-w-3xl text-base font-semibold text-slate-700 sm:text-lg">
            Explora mi colección completa de pinturas originales. Cada obra es única, creada con
            técnicas mixtas y expresionismo contemporáneo. Todas las piezas están disponibles para
            compra inmediata con envío seguro a todo Chile.
          </p>
        </div>

        <FilterBar
          onFilterChange={onFilterChange}
          totalResults={totalResults}
        />

        {paintings.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 inline-block rounded-lg border-4 border-black bg-orange-100 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-2xl font-black text-orange-700">
                😕 No se encontraron obras
              </p>
            </div>
            <p className="text-lg font-semibold text-slate-600">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {paintings.map((painting) => (
              <PaintingCard key={painting.id} painting={painting} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
