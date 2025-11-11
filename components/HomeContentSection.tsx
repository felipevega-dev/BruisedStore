"use client";

import { HomeSettings } from "@/types";
import ReactMarkdown from "react-markdown";

interface HomeContentSectionProps {
  title: string;
  content: string;
  videoType: HomeSettings["videoType"];
  videoUrl?: string;
  videoFile?: string;
}

export default function HomeContentSection({
  title,
  content,
  videoType,
  videoUrl,
  videoFile,
}: HomeContentSectionProps) {
  const renderVideo = () => {
    if (videoType === "none") return null;

    // Instagram embed
    if (videoType === "instagram" && videoUrl) {
      // Extract Instagram post ID from URL
      const instagramRegex = /instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/;
      const match = videoUrl.match(instagramRegex);
      const postId = match ? match[2] : null;

      if (postId) {
        return (
          <div className="h-[600px] w-full overflow-hidden rounded-lg border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <iframe
              src={`https://www.instagram.com/p/${postId}/embed/captioned`}
              className="h-full w-full"
              frameBorder="0"
              scrolling="no"
              allowtransparency="true"
              allow="encrypted-media"
              title="Instagram post"
            />
          </div>
        );
      }
    }

    // YouTube embed
    if (videoType === "youtube" && videoUrl) {
      const youtubeRegex =
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/;
      const match = videoUrl.match(youtubeRegex);
      const videoId = match ? match[1] : null;

      if (videoId) {
        return (
          <div className="aspect-[9/16] w-full overflow-hidden rounded-lg border-4 border-black bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="h-full w-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    // Uploaded video file
    if (videoType === "upload" && videoFile) {
      return (
        <div className="overflow-hidden rounded-lg border-4 border-black bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <video
            src={videoFile}
            controls
            className="aspect-[9/16] w-full sm:aspect-video"
            playsInline
          >
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      );
    }

    return null;
  };

  return (
    <section className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Text Content */}
          <div className="space-y-6">
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

          {/* Video Content */}
          {videoType !== "none" && (
            <div className="lg:sticky lg:top-24">{renderVideo()}</div>
          )}
        </div>
      </div>
    </section>
  );
}
