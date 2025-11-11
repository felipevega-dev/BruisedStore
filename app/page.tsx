"use client";

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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

      {/* Call to Action - Obra a Pedido */}
      <section className="bg-gradient-to-br from-red-950 via-black to-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-4xl font-black text-white sm:text-5xl">
              ¿Tienes una visión única?
            </h2>
            <p className="mb-8 text-lg text-gray-300">
              Comisiona una obra personalizada. Trabajaré contigo para crear algo
              completamente único basado en tu idea.
            </p>
            <Link
              href="/obra-a-pedido"
              className="inline-flex items-center gap-2 rounded-lg border-4 border-white bg-white px-8 py-4 text-lg font-black text-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              Solicitar Obra a Pedido
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-4xl font-black text-gray-900 sm:text-5xl">
              Galería de Obras
            </h2>
            <p className="text-lg text-gray-600">
              Explora la colección completa de pinturas disponibles
            </p>
          </div>

          <FilterBar
            onFilterChange={setFilters}
            totalResults={filteredPaintings.length}
          />

          {filteredPaintings.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl text-gray-500">
                No se encontraron obras con los filtros aplicados
              </p>
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
    </div>
  );
}
