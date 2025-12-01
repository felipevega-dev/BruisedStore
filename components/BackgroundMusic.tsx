"use client";

import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MusicSettings, DEFAULT_MUSIC_SETTINGS } from "@/types";
import {
  Volume2,
  VolumeX,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from "lucide-react";

export default function BackgroundMusic() {
  const [settings, setSettings] = useState<MusicSettings | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [userVolume, setUserVolume] = useState(100); // Volumen del slider del usuario (0-100)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userHasMuted, setUserHasMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [autoPlayAttempted, setAutoPlayAttempted] = useState(false);

  // Calcular el volumen REAL del audio: userVolume * masterVolume (del admin)
  const getRealVolume = () => {
    const masterVolume = settings?.defaultVolume ?? 100; // Volumen maestro del admin
    return (userVolume / 100) * (masterVolume / 100);
  };

  // Marcar como montado para evitar hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detectar primera interacción del usuario para activar auto-play
  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasUserInteracted(true);
      // Remover los listeners después de la primera interacción
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Cargar configuración de música y preferencia de mute del usuario
  useEffect(() => {
    // Verificar si el usuario pausó la música en esta sesión
    // Nota: Ya NO persistimos el estado de mute entre sesiones para permitir auto-play
    const sessionMuted = sessionStorage.getItem("musicMuted");
    if (sessionMuted === "true") {
      setUserHasMuted(true);
      setIsMuted(true);
    }

    // Listener en tiempo real para settings
    const unsubscribe = onSnapshot(
      doc(db, "musicSettings", "main"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const musicSettings = {
            id: docSnapshot.id,
            ...data,
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as MusicSettings;

          setSettings(musicSettings);

          // Cargar volumen del usuario (su preferencia de slider, siempre 0-100)
          const savedUserVolume = localStorage.getItem("userVolume");
          if (savedUserVolume) {
            setUserVolume(parseInt(savedUserVolume));
          } else {
            // Primera vez: slider al 100%
            setUserVolume(100);
            localStorage.setItem("userVolume", "100");
          }
        } else {
          // Usar defaults si no existe configuración
          setSettings({
            id: "main",
            ...DEFAULT_MUSIC_SETTINGS,
            updatedAt: new Date(),
          });

          // Cargar volumen del usuario
          const savedUserVolume = localStorage.getItem("userVolume");
          if (savedUserVolume) {
            setUserVolume(parseInt(savedUserVolume));
          }
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Auto-play cuando se carga la configuración Y el usuario ha interactuado (solo una vez)
  useEffect(() => {
    if (
      settings?.enabled &&
      settings.tracks.length > 0 &&
      !autoPlayAttempted &&
      audioRef.current &&
      hasUserInteracted
    ) {
      // Intentar reproducir después de que el audio esté listo
      const attemptAutoPlay = async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
          setIsMuted(false);
          setAutoPlayAttempted(true);
        } catch (error) {
          console.log("Auto-play bloqueado:", error);
          setAutoPlayAttempted(true);
        }
      };

      // Pequeño delay para asegurar que el audio esté cargado
      const timer = setTimeout(attemptAutoPlay, 300);
      return () => clearTimeout(timer);
    }
  }, [settings?.enabled, settings?.tracks.length, autoPlayAttempted, hasUserInteracted]);

  // Manejar reproducción
  const handlePlay = async () => {
    if (!audioRef.current || !settings?.tracks.length) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setIsMuted(false);
      setUserHasMuted(false);
      sessionStorage.setItem("musicMuted", "false");
    } catch (error) {
      console.log("Play prevented:", error);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Solo cambiar el volumen del audio, NO pausar
    audioRef.current.muted = newMutedState;
    
    if (newMutedState) {
      sessionStorage.setItem("musicMuted", "true");
    } else {
      sessionStorage.setItem("musicMuted", "false");
    }
  };

  const handlePrevious = () => {
    if (!settings) return;
    const prevIndex = currentTrackIndex === 0
      ? settings.tracks.length - 1
      : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setCurrentTime(0);
    setDuration(0);
    if (isPlaying && audioRef.current) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const handleNext = () => {
    if (!settings) return;
    const nextIndex = (currentTrackIndex + 1) % settings.tracks.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
    if (isPlaying && audioRef.current) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const handleTrackEnd = () => {
    if (!settings) return;

    if (settings.playMode === "loop") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (settings.playMode === "playlist") {
      handleNext();
    } else {
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newUserVolume: number) => {
    setUserVolume(newUserVolume);
    localStorage.setItem("userVolume", newUserVolume.toString());
    // Aplicar el volumen real al audio inmediatamente
    if (audioRef.current) {
      const realVolume = (newUserVolume / 100) * ((settings?.defaultVolume ?? 100) / 100);
      audioRef.current.volume = realVolume;
      console.log(`🎚️ Usuario: ${newUserVolume}% | Master: ${settings?.defaultVolume ?? 100}% | Real: ${(realVolume * 100).toFixed(1)}%`);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Actualizar volumen cuando cambia el valor o cuando se carga el audio
  useEffect(() => {
    if (audioRef.current) {
      const realVolume = getRealVolume();
      audioRef.current.volume = realVolume;
      console.log(`🔊 Volumen aplicado - Usuario: ${userVolume}% | Master: ${settings?.defaultVolume ?? 100}% | Real: ${(realVolume * 100).toFixed(1)}%`);
    }
  }, [userVolume, settings?.defaultVolume, audioRef.current]);

  // Aplicar volumen inicial al audio cuando se monta
  useEffect(() => {
    if (audioRef.current) {
      const realVolume = getRealVolume();
      audioRef.current.volume = realVolume;
      console.log(`🎵 Volumen inicial - Usuario: ${userVolume}% | Master: ${settings?.defaultVolume ?? 100}% | Real: ${(realVolume * 100).toFixed(1)}%`);
    }
  }, []);

  // No renderizar nada hasta que esté montado (evita hydration mismatch)
  if (!isMounted) {
    return null;
  }

  // Si no hay configuración o está deshabilitado, mostrar barra vacía solo en desarrollo
  const isDev = process.env.NODE_ENV === "development";

  if (!settings) {
    return isDev ? (
      <div className="fixed left-0 right-0 top-0 z-50 border-b-2 border-black bg-linear-to-r from-primary-900 via-black to-primary-900 shadow-lg">
        <div className="container mx-auto flex items-center gap-2 px-4 py-1">
          <Music className="h-4 w-4 text-gray-600" />
          <span className="text-xs text-gray-500">Cargando configuración de música...</span>
        </div>
      </div>
    ) : null;
  }

  if (!settings.enabled) {
    // Si está deshabilitada, NO mostrar nada (ni siquiera en desarrollo)
    return null;
  }

  if (settings.tracks.length === 0) {
    return isDev ? (
      <div className="fixed left-0 right-0 top-0 z-50 border-b-2 border-black bg-linear-to-r from-primary-900 via-black to-primary-900 shadow-lg">
        <div className="container mx-auto flex items-center gap-2 px-4 py-1">
          <Music className="h-4 w-4 text-gray-600" />
          <span className="text-xs text-gray-500">
            No hay pistas - Sube música en{" "}
            <a href="/admin/music" className="text-primary-600 underline">
              /admin/music
            </a>
          </span>
        </div>
      </div>
    ) : null;
  }

  const currentTrack =
    settings.playMode === "single" && settings.currentTrackId
      ? settings.tracks.find((t) => t.id === settings.currentTrackId)
      : settings.tracks[currentTrackIndex];

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.fileUrl}
        onEnded={handleTrackEnd}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }}
        onDurationChange={() => {
          if (audioRef.current && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }}
        onLoadedData={() => {
          // Aplicar volumen cuando el audio se carga
          if (audioRef.current) {
            const realVolume = getRealVolume();
            audioRef.current.volume = realVolume;
            // Obtener duración
            if (!isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration)) {
              setDuration(audioRef.current.duration);
            }
          }
        }}
      />

      {/* Barra de Reproducción Superior */}
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-primary-200 bg-linear-to-r from-primary-50 via-surface-100 to-secondary-50 shadow-md">
        <div className="container mx-auto flex items-center gap-2 px-4 py-1">
          {/* Icono de música */}
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-primary-500" />
          </div>

          {/* Controles de reproducción */}
          <div className="flex items-center gap-1">
            {settings.tracks.length > 1 && (
              <button
                onClick={handlePrevious}
                className="rounded p-1 text-slate-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
                aria-label="Anterior"
              >
                <SkipBack className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="rounded bg-primary-500 p-1 text-white transition-all hover:bg-primary-600"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>

            {settings.tracks.length > 1 && (
              <button
                onClick={handleNext}
                className="rounded p-1 text-slate-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
                aria-label="Siguiente"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Título de la pista */}
          <div className="flex-1 overflow-hidden">
            <div className="truncate text-xs font-semibold text-slate-700">
              {currentTrack.title}
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="hidden items-center gap-2 sm:flex sm:flex-1">
            <span className="text-xs font-medium text-slate-600">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-300 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-125"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / (duration || 1)) * 100}%, #cbd5e1 ${(currentTime / (duration || 1)) * 100}%, #cbd5e1 100%)`
                }}
              />
            </div>
            <span className="text-xs font-medium text-slate-600">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control de volumen */}
          <div className="relative hidden items-center gap-2 md:flex">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
              aria-label="Volumen"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            {showVolumeSlider && (
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={userVolume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-primary-100 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
                />
                <span className="text-xs font-semibold text-slate-600">
                  {userVolume}%
                </span>
              </div>
            )}
          </div>

          {/* Botón de mute */}
          <button
            onClick={handleToggleMute}
            className="rounded-full border border-primary-200 bg-white/70 p-1.5 transition hover:border-primary-300 hover:bg-primary-100"
            aria-label={isMuted ? "Activar música" : "Silenciar música"}
          >
            {isMuted || !isPlaying ? (
              <VolumeX className="h-4 w-4 text-slate-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-primary-500" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

