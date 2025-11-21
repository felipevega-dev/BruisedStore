"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, X, Maximize2 } from "lucide-react";

interface ImageZoomProps {
  src: string;
  alt: string;
  aspectRatio?: string;
}

export default function ImageZoom({ src, alt, aspectRatio }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
    if (scale <= 1.5) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleFullscreen = () => {
    setIsZoomed(true);
  };

  const handleCloseFullscreen = () => {
    setIsZoomed(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isZoomed) {
        if (e.key === "Escape") {
          handleCloseFullscreen();
        } else if (e.key === "+") {
          handleZoomIn();
        } else if (e.key === "-") {
          handleZoomOut();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed, scale]);

  // Prevent scroll when zoomed
  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isZoomed]);

  return (
    <>
      {/* Regular View with Zoom Button */}
      <div className="group relative">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: aspectRatio || "auto" }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>

        {/* Zoom Button Overlay */}
        <button
          onClick={handleFullscreen}
          className="absolute right-4 top-4 z-10 rounded-lg border-4 border-white bg-black/70 p-3 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black group-hover:opacity-100"
          aria-label="Ver en pantalla completa"
        >
          <Maximize2 className="h-6 w-6" />
        </button>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm">
          {/* Controls */}
          <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-2">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="rounded-lg border-4 border-white bg-black/80 p-3 text-white transition-all hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Alejar"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={handleReset}
              disabled={scale === 1}
              className="rounded-lg border-4 border-white bg-black/80 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="rounded-lg border-4 border-white bg-black/80 p-3 text-white transition-all hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Acercar"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={handleCloseFullscreen}
            className="absolute right-4 top-4 z-10 rounded-lg border-4 border-white bg-primary-500 p-3 text-white transition-all hover:bg-primary-600"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Zoom Level Indicator */}
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-lg border-4 border-white bg-black/80 px-4 py-2 text-sm font-bold text-white">
            {Math.round(scale * 100)}%
          </div>

          {/* Image Container */}
          <div
            ref={imageRef}
            className="flex h-full w-full items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
          >
            <div
              className="relative transition-transform duration-200"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale
                  }px)`,
                transformOrigin: "center center",
                width: scale > 1 ? "100%" : "90%",
                height: scale > 1 ? "100%" : "90%",
              }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
                sizes="100vw"
                quality={100}
                priority
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 z-10 rounded-lg border-2 border-white/30 bg-black/60 px-3 py-2 text-xs text-white/70 backdrop-blur-sm">
            {scale > 1 ? "Arrastra para mover" : "Usa +/- o los botones para hacer zoom"}
          </div>
        </div>
      )}
    </>
  );
}
