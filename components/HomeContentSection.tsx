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
}

export default function HomeContentSection({
  title,
  content,
  videoType,
  videoUrl,
  videoFile,
  videoSize = "medium",
  videoPosition = "right",
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

  // Video size mapping
  const videoSizeClasses = {
    small: "lg:col-span-1",
    medium: "lg:col-span-1",
    large: "lg:col-span-2 lg:max-w-4xl lg:mx-auto",
  };

  const hasVideo = videoType !== "none";
  const gridCols = !hasVideo ? "lg:grid-cols-1 lg:max-w-4xl lg:mx-auto" :
                   videoSize === "large" ? "lg:grid-cols-1" :
                   "lg:grid-cols-2";

  return (
    <section className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid gap-12 ${gridCols} lg:items-start`}>
          {/* Video on left if videoPosition is 'left' */}
          {hasVideo && videoPosition === "left" && videoSize !== "large" && (
            <div className={`${videoSizeClasses[videoSize]} lg:sticky lg:top-24`}>
              {renderVideo()}
            </div>
          )}

          {/* Text Content */}
          <div className={`space-y-6 ${videoSize === "large" ? "lg:max-w-4xl lg:mx-auto" : ""}`}>
            <h2 className="text-4xl font-black text-gray-900 sm:text-5xl lg:text-6xl">
              {title}
            </h2>

            <div className="h-2 w-20 bg-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />

            <div className="prose prose-lg max-w-none text-gray-800">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-4 text-lg leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-black text-gray-900">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-red-600">{children}</em>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-3 mt-6 text-2xl font-black text-gray-900">
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

          {/* Video on right if videoPosition is 'right' */}
          {hasVideo && videoPosition === "right" && videoSize !== "large" && (
            <div className={`${videoSizeClasses[videoSize]} lg:sticky lg:top-24`}>
              {renderVideo()}
            </div>
          )}

          {/* Large video full width below text */}
          {hasVideo && videoSize === "large" && (
            <div className={`${videoSizeClasses[videoSize]} mt-8`}>
              {renderVideo()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
