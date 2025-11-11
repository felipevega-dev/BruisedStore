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
    gray: "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300",
    book: "bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100",
    dark: "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
    light: "bg-gradient-to-br from-white via-gray-50 to-gray-100",
  };

  const textColorClasses = {
    gray: "text-gray-900",
    book: "text-amber-900",
    dark: "text-gray-100",
    light: "text-gray-900",
  };

  const accentColorClasses = {
    gray: "bg-red-600",
    book: "bg-amber-600",
    dark: "bg-red-500",
    light: "bg-red-600",
  };

  return (
    <section className={`${backgroundClasses[backgroundStyle]} py-16 sm:py-24`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col lg:flex-row gap-8 lg:gap-12 ${videoPosition === "left" ? "lg:flex-row" : "lg:flex-row-reverse"} lg:items-start`}>
          {/* Video - Always on side with fixed width */}
          {hasVideo && (
            <div className={`flex-shrink-0 ${videoSizeClasses[videoSize]} lg:sticky lg:top-24`}>
              {renderVideo()}
            </div>
          )}

          {/* Text Content - Takes remaining space */}
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
          </div>
        </div>
      </div>
    </section>
  );
}
