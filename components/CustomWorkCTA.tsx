"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CustomWorkCTA() {
  return (
    <section className="relative overflow-hidden border-y-4 border-black bg-primary-500 py-10 sm:py-12">
      <div className="container relative mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 inline-block rounded-full border-4 border-black bg-white px-4 py-1.5">
            <span className="text-xs font-black uppercase tracking-widest text-primary-600 sm:text-sm">
              Personalización Total
            </span>
          </div>
          <h2 className="mb-3 text-2xl font-black text-white sm:text-3xl md:text-4xl">
            ¿Tienes una visión única?
          </h2>
          <p className="mb-5 text-base font-bold text-white sm:text-lg">
            Trabajaré contigo para crear algo completamente único basado en tu idea,
            con tu estilo y dimensiones preferidas.
          </p>
          <Link
            href="/obra-a-pedido"
            className="group inline-flex items-center gap-2 rounded-lg border-4 border-black bg-white px-6 py-3 text-base font-black text-primary-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 sm:px-8 sm:py-3.5"
          >
            Obra a Pedido
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
