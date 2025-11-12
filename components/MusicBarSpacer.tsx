"use client";

import { useMusic } from "@/contexts/MusicContext";

/**
 * Componente que añade espacio para la barra de música cuando está activa
 * Debe colocarse después del Header y antes del contenido principal
 */
export default function MusicBarSpacer() {
  const { hasMusicBar, isMounted } = useMusic();

  // No renderizar nada hasta estar montado (evita hydration mismatch)
  if (!isMounted) {
    return null;
  }

  return null;
}
