"use client";
// Force rebuild for Tailwind config update


import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Painting, FilterOptions, HomeSettings, DEFAULT_HOME_SETTINGS } from "@/types";
import AnimatedBanner from "@/components/AnimatedBanner";
import HomeContentSection from "@/components/HomeContentSection";
import RecentPaintingsSection from "@/components/RecentPaintingsSection";
import CustomWorkCTA from "@/components/CustomWorkCTA";
import GallerySection from "@/components/GallerySection";
import { Loader2 } from "lucide-react";

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
      {/* Animated Banner - Simple, just with padding for header */}
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
      <RecentPaintingsSection paintings={allPaintings} maxDisplay={4} />

      {/* Call to Action - Obra a Pedido */}
      <CustomWorkCTA />

      {/* Gallery Section */}
      <GallerySection
        paintings={filteredPaintings}
        onFilterChange={setFilters}
        totalResults={filteredPaintings.length}
      />
    </div>
  );
}
