"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppWidget() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem("chat-widget-hidden");
    if (dismissed === "true") {
      setIsVisible(false);
    }
  }, []);

  // Don't show on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("chat-widget-hidden", "true");
  };

  const getContextMessage = () => {
    const baseMessage = "Hola! Estoy interesado en las obras de José Vega. ";

    // Mensajes según la página actual
    if (pathname === "/") {
      return baseMessage + "Me gustaría conocer más sobre las pinturas disponibles.";
    } else if (pathname.startsWith("/obra/")) {
      return baseMessage + "Tengo una consulta sobre una obra específica.";
    } else if (pathname === "/carrito") {
      return baseMessage + "Tengo una consulta sobre mi carrito de compras.";
    } else if (pathname === "/obra-a-pedido") {
      return baseMessage + "Me gustaría solicitar una obra personalizada.";
    } else if (pathname === "/checkout") {
      return baseMessage + "Necesito ayuda con mi compra.";
    } else if (pathname === "/wishlist") {
      return baseMessage + "Tengo consultas sobre mis obras favoritas.";
    }

    return baseMessage + "Tengo una consulta.";
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56912345678";
    const message = encodeURIComponent(getContextMessage());
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-2">
      {/* Expanded Message Bubble */}
      {isExpanded && (
        <div className="animate-in slide-in-from-bottom-2 mb-2 max-w-[280px] border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="text-sm font-black text-black">
              ¿Necesitas ayuda?
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-gray-100"
              aria-label="Cerrar mensaje"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-3 text-xs text-gray-700">
            Contáctanos y te responderemos lo antes posible.
          </p>
          <button
            onClick={handleWhatsAppClick}
            className="flex w-full items-center justify-center gap-2 border-4 border-black bg-green-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-green-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar Mensaje
          </button>
        </div>
      )}

      {/* Main Widget Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDismiss}
          className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-black bg-primary-500 text-white transition-all hover:bg-primary-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95"
          aria-label="Cerrar chat"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-black bg-green-500 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-green-600 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:scale-95 sm:h-16 sm:w-16"
          aria-label="Abrir chat"
        >
          <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8" />
        </button>
      </div>
    </div>
  );
}
