"use client";
// Force rebuild for Tailwind config update


import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Painting, FilterOptions, HomeSettings, DEFAULT_HOME_SETTINGS } from "@/types";
import PaintingCard from "@/components/PaintingCard";
import FilterBar from "@/components/FilterBar";
import AnimatedBanner from "@/components/AnimatedBanner";
import HomeContentSection from "@/components/HomeContentSection";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

export default function Home() {
  const [allPaintings, setAllPaintings] = useState<Painting[]>([]);
  const [filteredPaintings, setFilteredPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeSettings, setHomeSettings] = useState<HomeSettings | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "all",
    minPrice: 0,
    maxPrice: 0,
    sortBy: "recent",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch home settings
        const settingsDoc = await getDoc(doc(db, "homeSettings", "main"));
        if (settingsDoc.exists()) {
          setHomeSettings({
            id: settingsDoc.id,
            ...(settingsDoc.data() as Omit<HomeSettings, "id">),
          });
        } else {
          // Use defaults if no settings exist
          setHomeSettings({
            id: "main",
            ...DEFAULT_HOME_SETTINGS,
            updatedAt: new Date(),
          });
        }

        // Fetch paintings
        const q = query(collection(db, "paintings"), orderBy("createdAt", "desc"));
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
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...allPaintings];

    // Category filter
    if (filters.category && filters.category !== "all") {
      result = result.filter((p) => p.category === filters.category);
    }

    // Price filter
    if (filters.minPrice > 0) {
      result = result.filter((p) => p.price >= filters.minPrice);
    }
    if (filters.maxPrice > 0) {
      result = result.filter((p) => p.price <= filters.maxPrice);
    }

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "recent":
      default:
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    setFilteredPaintings(result);
  }, [filters, allPaintings]);

  if (loading || !homeSettings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-surface-50 via-white to-surface-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Animated Banner */}
      <AnimatedBanner
        images={homeSettings.bannerImages}
        profileImage={homeSettings.profileImageUrl}
        heroTitle={homeSettings.heroTitle}
        heroSubtitle={homeSettings.heroSubtitle}
      />

      {/* Content Section with Text + Video */}
      <HomeContentSection
        title={homeSettings.contentTitle}
        content={homeSettings.contentText}
        videoType={homeSettings.videoType}
        videoUrl={homeSettings.videoUrl}
        videoFile={homeSettings.videoFile}
        videoSize={homeSettings.videoSize}
        videoPosition={homeSettings.videoPosition}
        backgroundStyle={homeSettings.backgroundStyle}
      />

      {/* Featured/New Paintings */}
      {allPaintings.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-primary-200 blur-3xl"></div>
            <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-secondary-200 blur-3xl"></div>
          </div>

          <div className="container relative mx-auto px-4">
            <div className="mb-16 text-center">
              <div className="mb-4 inline-block animate-pulse rounded-full border-2 border-primary-300 bg-primary-100 px-6 py-2 shadow-lg">
                <span className="text-sm font-black uppercase tracking-wider text-primary-700">✨ Recién Agregadas</span>
              </div>
              <h2 className="mb-6 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-5xl font-black text-transparent sm:text-6xl md:text-7xl">
                Últimas Obras
              </h2>
              <p className="mx-auto max-w-2xl text-xl font-medium text-surface-700">
                Obras recién agregadas a la colección. No te pierdas estas piezas únicas.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {allPaintings.slice(0, 4).map((painting) => (
                <PaintingCard key={painting.id} painting={painting} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <a
                href="#galeria"
                className="group inline-flex items-center gap-3 rounded-2xl border-2 border-primary-500 bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 text-lg font-black shadow-2xl shadow-primary-500/30 transition-all hover:scale-105 hover:shadow-3xl hover:shadow-primary-500/50"
              >
                Ver Todas las Obras
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action - Obra a Pedido */}
      <section className="relative overflow-hidden border-y-4 border-primary-500 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 py-24">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-white to-transparent"></div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white to-transparent"></div>
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-block rounded-full border-4 border-white/30 bg-white/10 px-6 py-2 backdrop-blur-sm">
              <span className="text-sm font-black uppercase tracking-widest ">🎨 Personalización Total</span>
            </div>
            <h2 className="mb-6 text-5xl font-black drop-shadow-2xl sm:text-6xl md:text-7xl">
              ¿Tienes una visión única?
            </h2>
            <p className="mb-10 text-2xl font-bold  drop-shadow-lg">
              Trabajaré contigo para crear algo completamente único basado en tu idea,
              con tu estilo y dimensiones preferidas.
            </p>
            <Link
              href="/obra-a-pedido"
              className="group inline-flex items-center gap-3 rounded-2xl border-4 border-white bg-white px-10 py-5 text-xl font-black text-primary-600 shadow-2xl transition-all hover:scale-110 hover:shadow-[0_20px_60px_rgba(255,255,255,0.4)]"
            >
              Obra a Pedido
              <ArrowRight className="h-7 w-7 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeria" className="relative overflow-hidden bg-gradient-to-b from-surface-50 to-white py-20 sm:py-24">
        {/* Decorative elements */}
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-primary-100 opacity-20 blur-3xl"></div>
        <div className="absolute left-0 bottom-20 h-72 w-72 rounded-full bg-secondary-100 opacity-20 blur-3xl"></div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-block rounded-2xl border-3 border-primary-400 bg-gradient-to-r from-primary-100 to-secondary-100 px-8 py-3 shadow-xl">
              <span className="text-2xl font-black text-primary-700">
                🎨 GALERÍA COMPLETA
              </span>
            </div>
            <h2 className="mb-6 bg-gradient-to-r from-surface-900 via-primary-700 to-surface-900 bg-clip-text text-5xl font-black text-transparent sm:text-6xl md:text-7xl">
              Todas las Obras
            </h2>
            <p className="mx-auto max-w-3xl text-xl font-semibold text-surface-600">
              Explora mi colección completa de pinturas originales. Cada obra es única, creada con
              técnicas mixtas y expresionismo contemporáneo. Todas las piezas están disponibles para
              compra inmediata con envío seguro a todo Chile.
            </p>
          </div>

          <FilterBar
            onFilterChange={setFilters}
            totalResults={filteredPaintings.length}
          />

          {filteredPaintings.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-6 inline-block rounded-2xl border-4 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 p-8 shadow-2xl">
                <p className="text-3xl font-black text-orange-600">
                  😕 No se encontraron obras
                </p>
              </div>
              <p className="text-xl font-semibold text-surface-600">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPaintings.map((painting) => (
                <PaintingCard key={painting.id} painting={painting} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
