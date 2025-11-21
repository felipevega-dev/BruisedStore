"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Palette, Instagram } from "lucide-react";

interface AnimatedBannerProps {
  images: string[];
  profileImage?: string;
  heroTitle: string;
  heroSubtitle?: string;
  speed?: number; // Speed in seconds for full scroll
}

export default function AnimatedBanner({
  images,
  profileImage,
  heroTitle,
  heroSubtitle,
  speed = 60,
}: AnimatedBannerProps) {
  const [duplicatedImages, setDuplicatedImages] = useState<string[]>([]);

  useEffect(() => {
    // Duplicate images array for seamless loop
    setDuplicatedImages([...images, ...images, ...images]);
  }, [images]);

  return (
    <div className="relative h-[70vh] w-full overflow-hidden bg-black bg-linear-to-br from-slate-800 via-slate-900 to-black">
      {/* Animated Background Carousel */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="flex h-full gap-8"
          style={{
            animation: `scroll-left ${speed}s linear infinite`,
            width: `${duplicatedImages.length * 400}px`,
          }}
        >
          {duplicatedImages.map((img, index) => (
            <div
              key={`${img}-${index}`}
              className="relative h-full w-[350px] flex-shrink-0"
            >
              <div className="h-full w-full border-8 border-black bg-white p-4 shadow-2xl">
                <div className="relative h-full w-full">
                  <Image
                    src={img}
                    alt="Painting"
                    fill
                    className="object-cover"
                    sizes="350px"
                    priority={index < 3}
                    loading={index < 3 ? undefined : "lazy"}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        {/* Profile Image with Flip Effect */}
        {profileImage && (
          <div className="flip-card mb-6">
            <div className="flip-card-inner">
              {/* Front - Normal Image */}
              <div className="flip-card-front overflow-hidden rounded-full border-8 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]">
                <div className="relative h-32 w-32 sm:h-40 sm:w-40">
                  <Image
                    src={profileImage}
                    alt={heroTitle}
                    fill
                    className="object-cover"
                    sizes="160px"
                    priority
                  />
                </div>
              </div>
              {/* Back - Filtered Image */}
              <div className="flip-card-back overflow-hidden rounded-full border-8 border-primary-500 shadow-[8px_8px_0px_0px_rgba(220,38,38,0.5)]">
                <div className="relative h-32 w-32 sm:h-40 sm:w-40">
                  <Image
                    src={profileImage}
                    alt={`${heroTitle} - Bruised`}
                    fill
                    className="object-cover bruised-filter"
                    sizes="160px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Title */}
        <h1 className="mb-4 text-5xl font-black text-surface-50 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:text-6xl md:text-7xl lg:text-8xl">
          {heroTitle}
        </h1>

        {/* Subtitle */}
        {heroSubtitle && (
          <p className="text-xl font-bold text-surface-100 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:text-2xl md:text-3xl">
            {heroSubtitle}
          </p>
        )}

        {/* Decorative line */}
        <div className="mt-6 h-2 w-24 bg-primary-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] sm:w-32" />

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/obra-a-pedido"
            className="group inline-flex items-center justify-center gap-2 rounded-lg border-4 border-white bg-primary-500 px-6 py-3 text-lg font-black text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-primary-600 hover:shadow-none"
          >
            <Palette className="h-5 w-5" />
            Obra a Pedido
          </Link>
          <Link
            href="#galeria"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-4 border-white bg-white px-6 py-3 text-lg font-black text-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            Ver Galería
          </Link>
        </div>

        {/* Social Links */}
        <div className="mt-8 flex items-center gap-4">
          <a
            href="https://www.instagram.com/joseriop"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white/10 backdrop-blur-sm transition-all hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]"
            aria-label="Instagram"
          >
            <Instagram className="h-6 w-6 text-white transition-colors group-hover:text-pink-600" />
          </a>
          <a
            href="https://www.tiktok.com/@josevegaart"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white/10 backdrop-blur-sm transition-all hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]"
            aria-label="TikTok"
          >
            <svg
              className="h-6 w-6 text-white transition-colors group-hover:text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
            </svg>
          </a>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        /* Flip Card Styles */
        .flip-card {
          perspective: 1000px;
          cursor: pointer;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card:hover .flip-card-inner,
        .flip-card:active .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        /* Bruised Filter - Infrared/Experimental Effect */
        .bruised-filter {
          filter: 
            hue-rotate(280deg) 
            saturate(180%) 
            contrast(130%) 
            brightness(110%)
            sepia(30%);
          mix-blend-mode: normal;
        }

        /* Alternative filters you can try: */
        /* 
        Red-dominant bruised look:
        filter: contrast(130%) brightness(90%) saturate(150%) hue-rotate(340deg);
        
        Purple bruised look:
        filter: hue-rotate(270deg) saturate(200%) contrast(120%) brightness(95%);
        
        Infrared look:
        filter: hue-rotate(180deg) saturate(300%) brightness(120%) contrast(110%);
        
        Dark moody look:
        filter: contrast(150%) brightness(80%) saturate(120%) hue-rotate(330deg) grayscale(20%);
        */

        @media (max-width: 640px) {
          .flip-card-inner {
            width: 8rem;
            height: 8rem;
          }
        }

        @media (min-width: 641px) {
          .flip-card-inner {
            width: 10rem;
            height: 10rem;
          }
        }
      `}</style>
    </div>
  );
}
