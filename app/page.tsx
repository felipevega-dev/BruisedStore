"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Painting } from "@/types";
import PaintingCard from "@/components/PaintingCard";
import Link from "next/link";
import { Loader2, Paintbrush, Sparkles } from "lucide-react";

export default function Home() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);

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
        setPaintings(paintingsData);
      } catch (error) {
        console.error("Error fetching paintings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaintings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-red-900/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-red-950/30 blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-red-600 sm:h-10 sm:w-10" />
              <h1 className="bg-gradient-to-r from-red-100 via-red-50 to-red-100 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl">
                Bruised Art
              </h1>
              <Sparkles className="h-8 w-8 text-red-600 sm:h-10 sm:w-10" />
            </div>
            
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 sm:text-xl">
              Galería de pinturas únicas. Cada obra cuenta una historia.
            </p>
            
            <div className="mx-auto mb-8 h-1 w-24 bg-gradient-to-r from-red-900 via-red-600 to-red-900"></div>
            
            <Link
              href="/obra-a-pedido"
              className="group inline-flex items-center gap-3 rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-8 py-4 text-lg font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-2xl hover:shadow-red-900/50"
            >
              <Paintbrush className="h-6 w-6 transition-transform group-hover:rotate-12" />
              Crear Obra a Pedido
            </Link>
          </div>
        </div>
      </section>

      {/* Paintings Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-red-100 sm:text-5xl">
              Colección de Obras
            </h2>
            <div className="mx-auto h-1 w-16 bg-gradient-to-r from-red-900 via-red-600 to-red-900"></div>
          </div>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="rounded-lg border-2 border-red-900 bg-black/60 p-8 backdrop-blur-sm">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
                <p className="mt-4 text-center text-gray-300">Cargando obras...</p>
              </div>
            </div>
          ) : paintings.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="rounded-lg border-2 border-red-900 bg-black/60 p-12 backdrop-blur-sm shadow-2xl shadow-red-900/30">
                <Paintbrush className="mx-auto mb-4 h-16 w-16 text-red-600" />
                <p className="mb-2 text-xl font-semibold text-red-100">
                  No hay obras disponibles en este momento.
                </p>
                <p className="text-gray-400">
                  Vuelve pronto para ver nuevas creaciones.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paintings.map((painting) => (
                <PaintingCard key={painting.id} painting={painting} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
