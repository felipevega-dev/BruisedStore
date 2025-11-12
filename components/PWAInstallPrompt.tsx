"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GeneralSettings } from "@/types";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pwaEnabled, setPwaEnabled] = useState(false);

  // Cargar configuración para ver si PWA está habilitada
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "generalSettings", "main"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as GeneralSettings;
          setPwaEnabled(data.showPWAPrompt ?? false);
        } else {
          setPwaEnabled(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration);
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 3 seconds if not dismissed before AND if enabled in settings
      setTimeout(() => {
        const dismissed = localStorage.getItem("pwa-install-dismissed");
        if (!dismissed && pwaEnabled) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [pwaEnabled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installed");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom duration-500">
      <div className="rounded-lg border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-start gap-3">
          <div className="rounded-full border-2 border-red-600 bg-red-50 p-2">
            <Download className="h-5 w-5 text-red-600" />
          </div>

          <div className="flex-1">
            <h3 className="mb-1 font-bold text-gray-900">
              Instala la App
            </h3>
            <p className="mb-3 text-sm text-gray-600">
              Accede más rápido a la galería desde tu pantalla de inicio
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 rounded border-2 border-black bg-red-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="rounded border-2 border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
              >
                Ahora no
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
