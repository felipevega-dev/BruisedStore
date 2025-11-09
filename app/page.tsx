"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Painting } from "@/types";
import PaintingCard from "@/components/PaintingCard";
import Link from "next/link";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Bruised Art
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Galería de pinturas únicas. Cada obra cuenta una historia.
            </p>
            <Link
              href="/obra-a-pedido"
              className="inline-flex items-center rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
            >
              Crear Obra a Pedido
            </Link>
          </div>
        </div>
      </section>

      {/* Paintings Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Colección de Obras
          </h2>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            </div>
          ) : paintings.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <p className="mb-4 text-lg text-gray-600">
                No hay obras disponibles en este momento.
              </p>
              <p className="text-sm text-gray-500">
                Vuelve pronto para ver nuevas creaciones.
              </p>
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
