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

    const unsubscribe = onSnapshot(
      doc(db, "musicSettings", "main"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as MusicSettings;
          // Mostrar barra solo si está habilitada Y tiene tracks
          // No mostrar en desarrollo si está deshabilitada explícitamente
          setHasMusicBar(data.enabled && data.tracks && data.tracks.length > 0);
        } else {
          // Si no hay configuración, no mostrar barra (ni en desarrollo)
          setHasMusicBar(false);
        }
      },
      (error) => {
        console.error("Error listening to music settings:", error);
        setHasMusicBar(false);
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
