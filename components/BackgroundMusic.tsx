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

  // Calcular el volumen REAL del audio: userVolume * masterVolume (del admin)
  const getRealVolume = () => {
    const masterVolume = settings?.defaultVolume ?? 100; // Volumen maestro del admin
    return (userVolume / 100) * (masterVolume / 100);
  };

  // Marcar como montado para evitar hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cargar configuración de música y preferencia de mute del usuario
  useEffect(() => {
    // Verificar si el usuario había muteado anteriormente
    const savedMutePreference = localStorage.getItem("musicMuted");
    if (savedMutePreference === "true") {
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

  // Auto-play cuando se carga la configuración
  useEffect(() => {
    if (
      settings?.enabled &&
      settings.tracks.length > 0 &&
      !userHasMuted &&
      !isPlaying
    ) {
      setTimeout(() => {
        handlePlay();
      }, 1000);
    }
  }, [settings, userHasMuted]);

  // Actualizar tiempo actual
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioRef.current]);

  // Manejar reproducción
  const handlePlay = async () => {
    if (!audioRef.current || !settings?.tracks.length) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setIsMuted(false);
      setUserHasMuted(false);
      localStorage.setItem("musicMuted", "false");
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
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      setUserHasMuted(true);
      localStorage.setItem("musicMuted", "true");
      handlePause();
    } else {
      localStorage.setItem("musicMuted", "false");
      handlePlay();
    }
  };

  const handlePrevious = () => {
    if (!settings) return;
    const prevIndex = currentTrackIndex === 0 
      ? settings.tracks.length - 1 
      : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    if (isPlaying && audioRef.current) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const handleNext = () => {
    if (!settings) return;
    const nextIndex = (currentTrackIndex + 1) % settings.tracks.length;
    setCurrentTrackIndex(nextIndex);
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
      <div className="fixed left-0 right-0 top-0 z-50 border-b-2 border-black bg-linear-to-r from-moss-900 via-black to-moss-900 shadow-lg">
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
      <div className="fixed left-0 right-0 top-0 z-50 border-b-2 border-black bg-linear-to-r from-moss-900 via-black to-moss-900 shadow-lg">
        <div className="container mx-auto flex items-center gap-2 px-4 py-1">
          <Music className="h-4 w-4 text-gray-600" />
          <span className="text-xs text-gray-500">
            No hay pistas - Sube música en{" "}
            <a href="/admin/music" className="text-moss-600 underline">
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
        onLoadedData={() => {
          // Aplicar volumen cuando el audio se carga
          if (audioRef.current) {
            const realVolume = getRealVolume();
            audioRef.current.volume = realVolume;
            console.log(`🎧 Audio cargado - Usuario: ${userVolume}% | Master: ${settings?.defaultVolume ?? 100}% | Real: ${(realVolume * 100).toFixed(1)}%`);
          }
        }}
      />

      {/* Barra de Reproducción Superior */}
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-moss-200 bg-linear-to-r from-moss-50 via-canvas-100 to-azure-50 shadow-md">
        <div className="container mx-auto flex items-center gap-2 px-4 py-1">
          {/* Icono de música */}
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-moss-500" />
          </div>

          {/* Controles de reproducción */}
          <div className="flex items-center gap-1">
            {settings.tracks.length > 1 && (
              <button
                onClick={handlePrevious}
                className="rounded p-1 text-slate-500 transition-colors hover:bg-moss-100 hover:text-moss-600"
                aria-label="Anterior"
              >
                <SkipBack className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="rounded bg-moss-500 p-1 text-white transition-all hover:bg-moss-600"
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
                className="rounded p-1 text-slate-500 transition-colors hover:bg-moss-100 hover:text-moss-600"
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
            <span className="text-xs text-slate-500">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-moss-100 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-moss-500"
            />
            <span className="text-xs text-slate-500">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control de volumen */}
          <div className="relative hidden items-center gap-2 md:flex">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-moss-100 hover:text-moss-600"
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
                  className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-moss-100 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-moss-500"
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
            className="rounded-full border border-moss-200 bg-white/70 p-1.5 transition hover:border-moss-300 hover:bg-moss-100"
            aria-label={isMuted ? "Activar música" : "Silenciar música"}
          >
            {isMuted || !isPlaying ? (
              <VolumeX className="h-4 w-4 text-slate-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-moss-500" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

