"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
    <div className="relative h-[70vh] w-full overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black">
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
                    priority={index < 6}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        {/* Profile Image */}
        {profileImage && (
          <div className="mb-6 overflow-hidden rounded-full border-8 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]">
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
        )}

        {/* Hero Title */}
        <h1 className="mb-4 text-5xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)] sm:text-6xl md:text-7xl lg:text-8xl">
          {heroTitle}
        </h1>

        {/* Subtitle */}
        {heroSubtitle && (
          <p className="text-xl font-bold text-white/90 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] sm:text-2xl md:text-3xl">
            {heroSubtitle}
          </p>
        )}

        {/* Decorative line */}
        <div className="mt-6 h-2 w-24 bg-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] sm:w-32" />
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
      `}</style>
    </div>
  );
}
