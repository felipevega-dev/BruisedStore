"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface ShareButtonsProps {
  url: string;
  title: string;
  imageUrl?: string;
}

export default function ShareButtons({ url, title, imageUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const shareUrls = {
    whatsapp: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    facebook: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  };

  const handleShare = (platform: string) => {
    const shareText = `${title} - José Vega Art`;
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

    let shareUrl = "";
    switch (platform) {
      case "whatsapp":
        shareUrl = shareUrls.whatsapp(fullUrl, shareText);
        break;
      case "facebook":
        shareUrl = shareUrls.facebook(fullUrl);
        break;
      case "twitter":
        shareUrl = shareUrls.twitter(fullUrl, shareText);
        break;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const handleCopyLink = async () => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      showToast("Enlace copiado al portapapeles", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast("Error al copiar enlace", "error");
    }
  };

  return (
    <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="mb-4 flex items-center gap-2">
        <Share2 className="h-5 w-5 text-gray-900" />
        <h3 className="text-xl font-black text-gray-900">Compartir</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* WhatsApp */}
        <button
          onClick={() => handleShare("whatsapp")}
          className="flex items-center gap-2 rounded-lg border-4 border-black bg-green-500 px-4 py-2 font-bold text-white transition-all hover:bg-green-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Compartir en WhatsApp"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          WhatsApp
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleShare("facebook")}
          className="flex items-center gap-2 rounded-lg border-4 border-black bg-blue-600 px-4 py-2 font-bold text-white transition-all hover:bg-blue-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Compartir en Facebook"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>

        {/* Twitter/X */}
        <button
          onClick={() => handleShare("twitter")}
          className="flex items-center gap-2 rounded-lg border-4 border-black bg-gray-900 px-4 py-2 font-bold text-white transition-all hover:bg-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Compartir en Twitter/X"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 rounded-lg border-4 border-black bg-white px-4 py-2 font-bold text-gray-900 transition-all hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Copiar enlace"
        >
          {copied ? (
            <>
              <Check className="h-5 w-5 text-green-600" />
              ¡Copiado!
            </>
          ) : (
            <>
              <Copy className="h-5 w-5" />
              Copiar Enlace
            </>
          )}
        </button>
      </div>
    </div>
  );
}
