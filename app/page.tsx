"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Painting, FilterOptions } from "@/types";
import PaintingCard from "@/components/PaintingCard";
import FilterBar from "@/components/FilterBar";
import Link from "next/link";
import Script from "next/script";
import { Loader2, Paintbrush, Sparkles } from "lucide-react";

export default function Home() {
  const [allPaintings, setAllPaintings] = useState<Painting[]>([]);
  const [filteredPaintings, setFilteredPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'recent',
  });

  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const q = query(
          collection(db, "paintings"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const paintingsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Painting;
        });
        setAllPaintings(paintingsData);
        setFilteredPaintings(paintingsData);
      } catch (error) {
        console.error("Error fetching paintings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaintings();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = [...allPaintings];

    // Filtro de categoría
    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category);
    }

    // Filtro de precio
    if (filters.minPrice > 0) {
      result = result.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice > 0) {
      result = result.filter(p => p.price <= filters.maxPrice);
    }

    // Filtro de búsqueda
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Ordenamiento
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'recent':
      default:
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    setFilteredPaintings(result);
  }, [filters, allPaintings]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-4 border-black bg-white py-16 sm:py-20 lg:py-28">
        {/* Geometric lines background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-red-600"></div>
          <div className="absolute right-0 top-0 h-full w-1 bg-red-600"></div>
          <div className="absolute left-1/4 top-0 h-full w-px bg-black/10"></div>
          <div className="absolute left-2/4 top-0 h-full w-px bg-black/10"></div>
          <div className="absolute left-3/4 top-0 h-full w-px bg-black/10"></div>
          {/* Diagonal lines */}
          <div className="absolute -left-20 top-1/4 h-px w-96 rotate-12 bg-red-600/20"></div>
          <div className="absolute -right-20 top-2/3 h-px w-96 -rotate-12 bg-red-600/20"></div>
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Black border box */}
            <div className="mx-auto mb-8 inline-block border-4 border-black bg-white px-8 py-4 sm:px-12 sm:py-6">
              <div className="mb-6 flex items-center justify-center gap-3">
                <Sparkles className="h-8 w-8 text-red-600 sm:h-10 sm:w-10" />
                <h1 className="text-5xl font-black tracking-tight text-black sm:text-6xl md:text-7xl lg:text-8xl">
                  José Vega
                </h1>
                <Sparkles className="h-8 w-8 text-red-600 sm:h-10 sm:w-10" />
              </div>
              
              {/* Red accent line */}
              <div className="mx-auto mb-6 h-1 w-32 bg-red-600"></div>
              
              <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-gray-700 sm:text-xl">
                Galería de pinturas únicas. Cada obra cuenta una historia.
              </p>
            </div>
            
            <Link
              href="/obra-a-pedido"
              className="group inline-flex items-center gap-3 border-4 border-black bg-red-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-red-700 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <Paintbrush className="h-6 w-6 transition-transform group-hover:rotate-12" />
              Crear Obra a Pedido
            </Link>
          </div>
        </div>
      </section>

      {/* Paintings Grid - TEMPORALMENTE OCULTO (cliente espera fotos de calidad) */}
      {false && (
        <section className="border-b-4 border-black bg-white py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              {/* Section title with black border */}
              <div className="mx-auto inline-block border-4 border-black bg-white px-8 py-3">
                <h2 className="text-4xl font-black text-black sm:text-5xl">
                  Colección de Obras
                </h2>
              </div>
              {/* Red accent line */}
              <div className="mx-auto mt-4 h-1 w-24 bg-red-600"></div>
            </div>

            {/* Barra de filtros y búsqueda */}
            {!loading && (
              <FilterBar 
                onFilterChange={handleFilterChange} 
                totalResults={filteredPaintings.length}
              />
            )}

            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
                  <p className="mt-4 text-center font-semibold text-gray-900">Cargando obras...</p>
                </div>
              </div>
            ) : filteredPaintings.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <div className="border-4 border-black bg-white p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <Paintbrush className="mx-auto mb-4 h-16 w-16 text-red-600" />
                  <p className="mb-2 text-xl font-bold text-black">
                    {allPaintings.length === 0 
                      ? "No hay obras disponibles en este momento."
                      : "No se encontraron obras con los filtros aplicados."
                    }
                  </p>
                  <p className="text-gray-600">
                    {allPaintings.length === 0
                      ? "Vuelve pronto para ver nuevas creaciones."
                      : "Intenta ajustar los filtros o la búsqueda."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPaintings.map((painting) => (
                  <PaintingCard key={painting.id} painting={painting} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TODO: Instagram Feed (@joseriop) - Próxima implementación */}
      {/* Placeholder section for Instagram feed */}
      <section className="border-b-4 border-black bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mx-auto inline-block border-4 border-black bg-white px-8 py-3">
              <h2 className="text-4xl font-black text-black sm:text-5xl">
                Síguenos en Instagram
              </h2>
            </div>
            <div className="mx-auto mt-4 h-1 w-24 bg-red-600"></div>
            <p className="mt-6 text-lg text-gray-600">
              Descubre el proceso creativo y nuevas obras
            </p>
          </div>
          
          {/* Instagram CTA */}
          <div className="flex flex-col items-center justify-center gap-6">
            <a
              href="https://instagram.com/joseriop"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 border-4 border-black bg-white px-8 py-6 transition-all hover:bg-gray-50 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <svg
                className="h-12 w-12 transition-colors group-hover:fill-red-600"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <div className="text-left">
                <p className="text-2xl font-black text-black group-hover:text-red-600">
                  @joseriop
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Ver perfil completo →
                </p>
              </div>
            </a>
            
            {/* Instagram Feed Widget */}
            <div className="w-full max-w-5xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-black text-black">
                  📸 Últimas Publicaciones
                </h3>
                <div className="mx-auto mt-2 h-1 w-16 bg-red-600"></div>
              </div>
              
              {/* Elfsight Instagram Feed Widget */}
              <Script 
                src="https://static.elfsight.com/platform/platform.js" 
                strategy="lazyOnload"
              />
              <div 
                className="elfsight-app-b1e04a35-e117-49e4-80d3-13a8d3eb2321"
                data-elfsight-app-lazy
              ></div>
              
              {/* Fallback mientras carga */}
              <noscript>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                      key={i}
                      className="aspect-square animate-pulse bg-gray-200"
                    ></div>
                  ))}
                </div>
              </noscript>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
