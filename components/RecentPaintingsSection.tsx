"use client";

import { Painting } from "@/types";
import PaintingCard from "./PaintingCard";
import { ArrowRight } from "lucide-react";

interface RecentPaintingsSectionProps {
  paintings: Painting[];
  maxDisplay?: number;
}

export default function RecentPaintingsSection({
  paintings,
  maxDisplay = 4,
}: RecentPaintingsSectionProps) {
  if (paintings.length === 0) return null;

  return (
    <section className="bg-linear-to-br from-blue-50 via-slate-50 to-blue-100 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-block rounded-full border-2 border-primary-500 bg-primary-100 px-5 py-1.5 shadow-md">
            <span className="text-xs font-black uppercase tracking-wider text-primary-700">✨ Recién Agregadas</span>
          </div>
          <h2 className="mb-3 text-3xl font-black text-slate-800 sm:text-4xl lg:text-3xl">
            Ultimos trabajos realizados
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {paintings.slice(0, maxDisplay).map((painting) => (
            <PaintingCard key={painting.id} painting={painting} />
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <a
            href="#galeria"
            className="group inline-flex items-center gap-2 rounded-lg border-4 border-black bg-white px-6 py-3 text-base font-black text-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            Ver Todas las Obras
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
