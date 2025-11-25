"use client";

import { useState, useRef, MouseEvent } from "react";
import Image from "next/image";

interface ImageZoomProps {
  src: string;
  alt: string;
  aspectRatio?: string;
}

export default function ImageZoom({ src, alt, aspectRatio }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  return (
    <div
      ref={imageRef}
      className="group relative w-full overflow-hidden bg-slate-100 cursor-zoom-in"
      style={{ aspectRatio: aspectRatio || "auto" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-200 ease-out"
        style={{
          transform: isZoomed ? `scale(2)` : 'scale(1)',
          transformOrigin: `${position.x}% ${position.y}%`,
        }}
        sizes="(max-width: 768px) 100vw, 800px"
        quality={90}
      />
      
      {/* Indicador de zoom */}
      <div className="absolute bottom-3 right-3 z-10 rounded-md border-2 border-black bg-white/90 px-2 py-1 text-xs font-bold text-slate-700 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm">
        🔍 Hover para zoom
      </div>
    </div>
  );
}
