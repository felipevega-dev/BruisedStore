"use client";

import { HomeSettings } from "@/types";
import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";

interface HomeContentSectionProps {
  title: string;
  content: string;
  videoType: HomeSettings["videoType"];
  videoUrl?: string;
  videoFile?: string;
  videoSize?: HomeSettings["videoSize"];
  videoPosition?: HomeSettings["videoPosition"];
  backgroundStyle?: HomeSettings["backgroundStyle"];
}

export default function HomeContentSection({
  title,
  content,
  videoType,
  videoUrl,
  videoFile,
  videoSize = "medium",
  videoPosition = "right",
  backgroundStyle = "gray",
}: HomeContentSectionProps) {
  const [videoAspectRatio, setVideoAspectRatio] = useState<"vertical" | "horizontal" | "square">("vertical");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoType === "upload" && videoFile && videoRef.current) {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (height > width * 1.2) {
          setVideoAspectRatio("vertical");
        } else if (width > height * 1.2) {
          setVideoAspectRatio("horizontal");
        } else {
          setVideoAspectRatio("square");
        }
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
  }, [videoType, videoFile]);

  const renderVideo = () => {
    if (videoType === "none") return null;

    // YouTube embed
    if (videoType === "youtube" && videoUrl) {
      const youtubeRegex =
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/;
      const match = videoUrl.match(youtubeRegex);
      const videoId = match ? match[1] : null;

      if (videoId) {
        return (
          <div className="aspect-video w-full overflow-hidden rounded-lg border-4 border-black bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="h-full w-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video"
            />
          </div>
        );
      }
    }

    // Uploaded video file with auto-detected aspect ratio
    if (videoType === "upload" && videoFile) {
      const aspectClass =
        videoAspectRatio === "vertical" ? "aspect-[9/16]" :
          videoAspectRatio === "horizontal" ? "aspect-video" :
            "aspect-square";

      return (
        <div className={`${aspectClass} w-full overflow-hidden rounded-lg border-4 border-black bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
          <video
            ref={videoRef}
            src={videoFile}
            controls
            className="h-full w-full object-contain"
            playsInline
          >
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      );
    }

    return null;
  };

  // Video size mapping - Tamaños reducidos significativamente
  const videoSizeClasses = {
    small: "lg:w-64", // 256px - Muy pequeño, como thumbnail
    medium: "lg:w-80", // 320px - Pequeño
    large: "lg:w-96", // 384px - Mediano (antes era full width)
  };

  const hasVideo = videoType !== "none";

  // Background style mapping
  const backgroundClasses = {
    gray: "bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100",
    book: "bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200",
    dark: "bg-gradient-to-br from-slate-900 via-blue-900 to-black",
    light: "bg-gradient-to-br from-white via-blue-50 to-slate-50",
  };

  const textColorClasses = {
    gray: "text-slate-900",
    book: "text-blue-900",
    dark: "text-blue-50",
    light: "text-slate-900",
  };

  const accentColorClasses = {
    gray: "bg-primary-500",
    book: "bg-blue-600",
    dark: "bg-primary-500",
    light: "bg-primary-500",
  };

  return (
    <section className={`${backgroundClasses[backgroundStyle]} py-12 sm:py-16 lg:py-20`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout - Video on side */}
        <div className={`hidden lg:flex gap-8 lg:gap-12 ${videoPosition === "left" ? "lg:flex-row" : "lg:flex-row-reverse"} lg:items-start`}>
          {/* Video - Desktop */}
          {hasVideo && (
            <div className={`${videoSizeClasses[videoSize]} lg:sticky lg:top-24 shrink-0`}>
              {renderVideo()}
            </div>
          )}

          {/* Text Content - Desktop */}
          <div className="flex-1 space-y-6 min-w-0">
            <h2 className={`text-4xl font-black ${textColorClasses[backgroundStyle]} sm:text-5xl lg:text-6xl`}>
              {title}
            </h2>

            <div className={`h-2 w-20 ${accentColorClasses[backgroundStyle]} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`} />

            <div className={`prose prose-lg max-w-none ${textColorClasses[backgroundStyle]}`}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className={`mb-4 text-lg leading-relaxed ${textColorClasses[backgroundStyle]}`}>{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className={`font-black ${textColorClasses[backgroundStyle]}`}>
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className={`italic ${accentColorClasses[backgroundStyle].replace('bg-', 'text-')}`}>{children}</em>
                  ),
                  h3: ({ children }) => (
                    <h3 className={`mb-3 mt-6 text-2xl font-black ${textColorClasses[backgroundStyle]}`}>
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 list-inside list-disc space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 list-inside list-decimal space-y-2">
                      {children}
                    </ol>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>

            {/* Call to Action Section - Desktop */}
            <div className="mt-10 pt-8 border-t-4 border-black">
              <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  ¿Tienes una idea en mente?
                </h3>
                <p className="text-gray-700 mb-6 text-lg">
                  Convierte tu visión en una obra única. Solicita una pintura personalizada adaptada a tus deseos y estilo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/obra-a-pedido"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-black text-white bg-primary-500 border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Solicitar Obra a Pedido
                  </a>
                  <a
                    href="/#galeria"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-black text-gray-900 bg-white border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Ver Galería
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Stacked with compact video */}
        <div className="lg:hidden space-y-6">
          {/* Title */}
          <h2 className={`text-3xl font-black ${textColorClasses[backgroundStyle]} sm:text-4xl`}>
            {title}
          </h2>

          <div className={`h-2 w-20 ${accentColorClasses[backgroundStyle]} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`} />

          {/* Video + CTA Side by Side on Mobile */}
          {hasVideo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Video - Compact on mobile */}
              <div className="w-full">
                {renderVideo()}
              </div>

              {/* Call to Action - Compact on mobile */}
              <div className="bg-white border-4 border-black rounded-lg p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center">
                <h3 className="text-lg font-black text-gray-900 mb-2">
                  ¿Tienes una idea en mente?
                </h3>
                <p className="text-gray-700 mb-4 text-sm">
                  Solicita una obra personalizada única.
                </p>
                <a
                  href="/obra-a-pedido"
                  className="inline-flex items-center justify-center px-4 py-3 text-sm font-black text-white bg-primary-500 border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Obra a Pedido
                </a>
              </div>
            </div>
          )}

          {/* Text Content - Mobile */}
          <div className={`prose max-w-none ${textColorClasses[backgroundStyle]}`}>
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className={`mb-3 text-base leading-relaxed ${textColorClasses[backgroundStyle]}`}>{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className={`font-black ${textColorClasses[backgroundStyle]}`}>
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className={`italic ${accentColorClasses[backgroundStyle].replace('bg-', 'text-')}`}>{children}</em>
                ),
                h3: ({ children }) => (
                  <h3 className={`mb-2 mt-4 text-xl font-black ${textColorClasses[backgroundStyle]}`}>
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 list-inside list-disc space-y-1.5">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 list-inside list-decimal space-y-1.5">
                    {children}
                  </ol>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Secondary CTA Button - Mobile */}
          <a
            href="/#galeria"
            className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-black text-gray-900 bg-white border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
          >
            Ver Galería
          </a>
        </div>
      </div>
    </section>
  );
}
