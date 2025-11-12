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
  const [volume, setVolume] = useState(30);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userHasMuted, setUserHasMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Cargar configuración de música y preferencia de mute del usuario
  useEffect(() => {
    // Verificar si el usuario había muteado anteriormente
    const savedMutePreference = localStorage.getItem("musicMuted");
    if (savedMutePreference === "true") {
      setUserHasMuted(true);
      setIsMuted(true);
    }

    // Cargar volumen guardado
    const savedVolume = localStorage.getItem("musicVolume");
    if (savedVolume) {
      setVolume(parseInt(savedVolume));
    }

    // Listener en tiempo real para settings
    const unsubscribe = onSnapshot(
      doc(db, "musicSettings", "main"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setSettings({
            id: docSnapshot.id,
            ...data,
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as MusicSettings);
        } else {
          // Usar defaults si no existe configuración
          setSettings({
            id: "main",
            ...DEFAULT_MUSIC_SETTINGS,
            updatedAt: new Date(),
          });
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

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem("musicVolume", newVolume.toString());
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Actualizar volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Si no hay configuración o está deshabilitado, mostrar barra vacía en desarrollo
  const isDev = process.env.NODE_ENV === "development";
  
  if (!settings) {
    return isDev ? (
      <>
        <div className="h-9"></div>
        <div className="fixed left-0 right-0 top-0 z-50 border-b-2 border-black bg-gradient-to-r from-red-950 via-black to-red-950 shadow-lg">
          <div className="container mx-auto flex items-center gap-2 px-4 py-1">
            <Music className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-500">Cargando configuración de música...</span>
          </div>
        </div>
      </>
    ) : null;
  }

  if (!settings.enabled) {
    return isDev ? (
      <>
        <div className="h-9"></div>
        <div className="fixed left-0 right-0 top-0 z-50 border-b-2 border-black bg-gradient-to-r from-red-950 via-black to-red-950 shadow-lg">
          <div className="container mx-auto flex items-center gap-2 px-4 py-1">
            <Music className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-500">
              Música deshabilitada - Actívala en{" "}
              <a href="/admin/music" className="text-red-400 underline">
                /admin/music
              </a>
            </span>
          </div>
        </div>
      </>
    ) : null;
  }

  if (settings.tracks.length === 0) {
    return isDev ? (
      <>
        <div className="h-9"></div>
        <div className="fixed left-0 right-0 top-0 z-50 border-b-2 border-black bg-gradient-to-r from-red-950 via-black to-red-950 shadow-lg">
          <div className="container mx-auto flex items-center gap-2 px-4 py-1">
            <Music className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-500">
              No hay pistas - Sube música en{" "}
              <a href="/admin/music" className="text-red-400 underline">
                /admin/music
              </a>
            </span>
          </div>
        </div>
      </>
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
      />

      {/* Espaciador para compensar la barra fixed */}
      <div className="h-9"></div>

      {/* Barra de Reproducción Superior */}
      <div className="fixed left-0 right-0 top-0 z-50 border-b-2 border-black bg-gradient-to-r from-red-950 via-black to-red-950 shadow-lg">
        <div className="container mx-auto flex items-center gap-2 px-4 py-1">
          {/* Icono de música */}
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-red-400" />
          </div>

          {/* Controles de reproducción */}
          <div className="flex items-center gap-1">
            {settings.tracks.length > 1 && (
              <button
                onClick={handlePrevious}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-red-900/30 hover:text-red-300"
                aria-label="Anterior"
              >
                <SkipBack className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="rounded bg-red-600 p-1 text-white transition-all hover:bg-red-700"
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
                className="rounded p-1 text-gray-400 transition-colors hover:bg-red-900/30 hover:text-red-300"
                aria-label="Siguiente"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Título de la pista */}
          <div className="flex-1 overflow-hidden">
            <div className="truncate text-xs font-bold text-red-100">
              {currentTrack.title}
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="hidden items-center gap-2 sm:flex sm:flex-1">
            <span className="text-xs text-gray-400">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-red-950/50 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
            />
            <span className="text-xs text-gray-400">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control de volumen */}
          <div className="relative hidden items-center gap-2 md:flex">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-red-900/30 hover:text-red-300"
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
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-red-950/50 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
                />
                <span className="text-xs font-bold text-gray-400">
                  {volume}%
                </span>
              </div>
            )}
          </div>

          {/* Botón de mute */}
          <button
            onClick={handleToggleMute}
            className="rounded-full border-2 border-red-900 bg-red-950/50 p-1.5 transition-all hover:border-red-600 hover:bg-red-900"
            aria-label={isMuted ? "Activar música" : "Silenciar música"}
          >
            {isMuted || !isPlaying ? (
              <VolumeX className="h-4 w-4 text-gray-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-red-400" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

