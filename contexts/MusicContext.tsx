"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MusicSettings } from "@/types";

interface MusicContextType {
  hasMusicBar: boolean;
  isMounted: boolean;
}

const MusicContext = createContext<MusicContextType>({
  hasMusicBar: false,
  isMounted: false,
});

export function MusicProvider({ children }: { children: ReactNode }) {
  const [hasMusicBar, setHasMusicBar] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const isDev = process.env.NODE_ENV === "development";

    const unsubscribe = onSnapshot(
      doc(db, "musicSettings", "main"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as MusicSettings;
          // Mostrar barra si está habilitada Y tiene tracks
          // En desarrollo, también mostrar si no hay tracks (para debugging)
          const shouldShow = data.enabled && data.tracks && data.tracks.length > 0;
          const showInDev = isDev && data.tracks && data.tracks.length === 0;
          setHasMusicBar(shouldShow || showInDev);
        } else {
          // Si no hay configuración, mostrar en desarrollo para debugging
          setHasMusicBar(isDev);
        }
      },
      (error) => {
        console.error("Error listening to music settings:", error);
        setHasMusicBar(isDev);
      }
    );

    return () => unsubscribe();
  }, [isMounted]);

  return (
    <MusicContext.Provider value={{ hasMusicBar, isMounted }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
