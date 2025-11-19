"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { MusicSettings, MusicTrack, DEFAULT_MUSIC_SETTINGS } from "@/types";
import {
  Loader2,
  ArrowLeft,
  Music,
  Upload,
  Trash2,
  Play,
  Pause,
  Volume2,
  Save,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { AdminLogHelpers } from "@/lib/adminLogs";

export default function AdminMusicSettingsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [settings, setSettings] = useState<MusicSettings>({
    id: "main",
    ...DEFAULT_MUSIC_SETTINGS,
    updatedAt: new Date(),
  });

  const [previewTrack, setPreviewTrack] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [draggedTrack, setDraggedTrack] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push("/admin");
      } else {
        setLoading(false);
        fetchSettings();
      }
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, "musicSettings", "main");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          id: docSnap.id,
          ...data,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as MusicSettings);
      }
    } catch (error) {
      console.error("Error fetching music settings:", error);
      showToast("Error al cargar configuración", "error");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea un archivo de audio
    if (!file.type.startsWith("audio/")) {
      showToast("Por favor selecciona un archivo de audio", "error");
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("El archivo es demasiado grande (máx. 10MB)", "error");
      return;
    }

    setUploading(true);

    try {
      // Obtener duración del audio
      const audio = new Audio(URL.createObjectURL(file));
      await new Promise((resolve) => {
        audio.addEventListener("loadedmetadata", resolve);
      });
      const duration = audio.duration;

      // Subir a Firebase Storage
      const fileName = `music/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Crear objeto de track
      const newTrack: MusicTrack = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ""), // Quitar extensión
        fileUrl: downloadURL,
        duration: Math.round(duration),
        uploadedAt: new Date(),
      };

      // Agregar al array de tracks
      setSettings((prev) => ({
        ...prev,
        tracks: [...prev.tracks, newTrack],
      }));

      showToast("Música subida exitosamente", "success");
    } catch (error) {
      console.error("Error uploading music:", error);
      showToast("Error al subir la música", "error");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleDeleteTrack = async (track: MusicTrack) => {
    if (!confirm(`¿Eliminar "${track.title}"?`)) return;

    try {
      // Eliminar de Storage
      const storageRef = ref(storage, track.fileUrl);
      await deleteObject(storageRef);

      // Eliminar del array
      setSettings((prev) => ({
        ...prev,
        tracks: prev.tracks.filter((t) => t.id !== track.id),
        currentTrackId: prev.currentTrackId === track.id ? undefined : prev.currentTrackId,
      }));

      showToast("Música eliminada", "success");
    } catch (error) {
      console.error("Error deleting track:", error);
      showToast("Error al eliminar", "error");
    }
  };

  const handlePreview = (trackUrl: string) => {
    if (previewTrack === trackUrl) {
      // Pausar
      previewAudio?.pause();
      setPreviewTrack(null);
    } else {
      // Reproducir
      if (previewAudio) {
        previewAudio.pause();
      }
      const audio = new Audio(trackUrl);
      audio.volume = settings.volume / 100;
      audio.play();
      setPreviewAudio(audio);
      setPreviewTrack(trackUrl);

      audio.onended = () => {
        setPreviewTrack(null);
      };
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const docRef = doc(db, "musicSettings", "main");
      await setDoc(
        docRef,
        {
          ...settings,
          updatedAt: new Date(),
          updatedBy: user?.uid,
        },
        { merge: true }
      );

      // Registrar log de actividad
      if (user?.email && user?.uid) {
        await AdminLogHelpers.logMusicSettingsUpdated(
          user.email,
          user.uid
        );
      }

      showToast("Configuración guardada exitosamente", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (trackId: string) => {
    setDraggedTrack(trackId);
  };

  const handleDragOver = (e: React.DragEvent, targetTrackId: string) => {
    e.preventDefault();
    if (!draggedTrack || draggedTrack === targetTrackId) return;

    const newTracks = [...settings.tracks];
    const draggedIndex = newTracks.findIndex((t) => t.id === draggedTrack);
    const targetIndex = newTracks.findIndex((t) => t.id === targetTrackId);

    const [removed] = newTracks.splice(draggedIndex, 1);
    newTracks.splice(targetIndex, 0, removed);

    setSettings({ ...settings, tracks: newTracks });
  };

  const handleDragEnd = () => {
    setDraggedTrack(null);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "?:??";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSetFirstTrack = (trackId: string) => {
    const trackIndex = settings.tracks.findIndex((t) => t.id === trackId);
    if (trackIndex === 0) return;

    const newTracks = [...settings.tracks];
    const [track] = newTracks.splice(trackIndex, 1);
    newTracks.unshift(track);

    setSettings({ ...settings, tracks: newTracks });
    showToast("Pista movida al inicio", "success");
  };

  useEffect(() => {
    // Limpiar audio al desmontar
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, [previewAudio]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-moss-900 to-black">
        <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-8 backdrop-blur-sm">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-moss-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-moss-900 to-black py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-300 transition-colors hover:text-terra-400"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-terra-100 sm:text-4xl">
                Configuración de Música
              </h1>
              <p className="text-gray-400">Música de fondo para el sitio</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Enable/Disable */}
            <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-terra-100">Activar Música</h3>
                  <p className="text-sm text-gray-400">
                    Reproducir música de fondo en el sitio
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) =>
                      setSettings({ ...settings, enabled: e.target.checked })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-8 w-14 rounded-full border-4 border-terra-900 bg-gray-700 after:absolute after:left-[4px] after:top-[4px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-moss-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                </label>
              </div>
            </div>

            {/* Play Mode */}
            <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-xl font-bold text-terra-100">
                Modo de Reproducción
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => setSettings({ ...settings, playMode: "single" })}
                  className={`rounded-lg border-4 px-4 py-3 font-bold transition-all ${
                    settings.playMode === "single"
                      ? "border-moss-500 bg-moss-500 text-white shadow-lg"
                      : "border-terra-900 bg-moss-900/30 text-terra-100 hover:bg-terra-900/30"
                  }`}
                >
                  Una vez
                </button>
                <button
                  onClick={() => setSettings({ ...settings, playMode: "loop" })}
                  className={`rounded-lg border-4 px-4 py-3 font-bold transition-all ${
                    settings.playMode === "loop"
                      ? "border-moss-500 bg-moss-500 text-white shadow-lg"
                      : "border-terra-900 bg-moss-900/30 text-terra-100 hover:bg-terra-900/30"
                  }`}
                >
                  Repetir
                </button>
                <button
                  onClick={() => setSettings({ ...settings, playMode: "playlist" })}
                  className={`rounded-lg border-4 px-4 py-3 font-bold transition-all ${
                    settings.playMode === "playlist"
                      ? "border-moss-500 bg-moss-500 text-white shadow-lg"
                      : "border-terra-900 bg-moss-900/30 text-terra-100 hover:bg-terra-900/30"
                  }`}
                >
                  Playlist
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-400">
                {settings.playMode === "single" &&
                  "Reproduce la pista seleccionada una vez"}
                {settings.playMode === "loop" &&
                  "Repite la misma pista continuamente"}
                {settings.playMode === "playlist" &&
                  "Reproduce todas las pistas en orden"}
              </p>
            </div>

            {/* Volume Control */}
            <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-terra-100">Volumen de la Barra</h3>
                <span className="text-2xl font-black text-terra-500">
                  {settings.volume}%
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-400">
                Volumen actual de la barra de reproducción (se sincroniza con los controles de la barra)
              </p>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) =>
                  setSettings({ ...settings, volume: parseInt(e.target.value) })
                }
                className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-moss-900/50 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-moss-500"
              />
            </div>

            {/* Default Volume Control */}
            <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-terra-100">Volumen Inicial</h3>
                <span className="text-2xl font-black text-terra-500">
                  {settings.defaultVolume}%
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-400">
                Volumen con el que empezarán los nuevos visitantes (primera vez). Después cada usuario guardará su preferencia.
              </p>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.defaultVolume || 30}
                onChange={(e) =>
                  setSettings({ ...settings, defaultVolume: parseInt(e.target.value) })
                }
                className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-moss-900/50 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-moss-500"
              />
            </div>

            {/* Upload Music */}
            <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-xl font-bold text-terra-100">
                Subir Música
              </h3>
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-4 border-dashed border-terra-900 bg-moss-900/20 py-8 transition-all hover:border-moss-500 hover:bg-moss-900/30">
                {uploading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-terra-500" />
                    <span className="font-bold text-terra-100">Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-terra-500" />
                    <span className="font-bold text-terra-100">
                      Seleccionar archivo de audio
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="mt-2 text-xs text-gray-400">
                Formatos: MP3, WAV, OGG. Máximo 10MB
              </p>
            </div>

            {/* Music List */}
            <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-terra-100">
                  Pistas ({settings.tracks.length})
                </h3>
                {settings.tracks.length > 0 && (
                  <p className="text-sm text-gray-400">
                    💡 Arrastra para reordenar
                  </p>
                )}
              </div>

              {settings.tracks.length === 0 ? (
                <div className="rounded-lg border-2 border-terra-900/30 bg-moss-900/20 p-8 text-center">
                  <Music className="mx-auto mb-3 h-12 w-12 text-moss-600/50" />
                  <p className="text-gray-400">
                    No hay música subida. Sube tu primera pista arriba.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settings.tracks.map((track, index) => (
                    <div
                      key={track.id}
                      draggable={true}
                      onDragStart={() => handleDragStart(track.id)}
                      onDragOver={(e) => handleDragOver(e, track.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex cursor-move items-center gap-3 rounded-lg border-2 bg-moss-900/20 p-4 transition-all ${
                        draggedTrack === track.id
                          ? "border-moss-500 opacity-50"
                          : "border-terra-900/30 hover:border-moss-600"
                      }`}
                    >
                      {/* Número de orden */}
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-terra-900 bg-moss-900/50 text-sm font-bold text-terra-100">
                        {index + 1}
                      </div>

                      {/* Botón preview */}
                      <button
                        onClick={() => handlePreview(track.fileUrl)}
                        className="flex-shrink-0 rounded-full border-2 border-terra-900 bg-moss-900/50 p-2 text-terra-100 transition-all hover:bg-moss-500 hover:text-white"
                      >
                        {previewTrack === track.fileUrl ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </button>

                      {/* Info de la pista */}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              tracks: settings.tracks.map((t) =>
                                t.id === track.id
                                  ? { ...t, title: e.target.value }
                                  : t
                              ),
                            })
                          }
                          className="w-full rounded border-2 border-terra-900/30 bg-transparent px-2 py-1 font-bold text-terra-100 focus:border-moss-500 focus:outline-none"
                        />
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                          <span>⏱️ {formatDuration(track.duration)}</span>
                          {index === 0 && (
                            <span className="rounded border border-green-600 bg-green-950/50 px-2 py-0.5 text-green-400">
                              Primera
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        {index !== 0 && (
                          <button
                            onClick={() => handleSetFirstTrack(track.id)}
                            className="rounded-lg border-2 border-green-900 bg-green-950/50 px-3 py-2 text-xs font-bold text-green-400 transition-all hover:bg-green-900/70"
                            title="Marcar como primera"
                          >
                            ⬆️ Primera
                          </button>
                        )}

                        {settings.playMode === "single" && (
                          <label className="flex items-center gap-2 text-sm text-gray-400">
                            <input
                              type="radio"
                              name="currentTrack"
                              checked={settings.currentTrackId === track.id}
                              onChange={() =>
                                setSettings({
                                  ...settings,
                                  currentTrackId: track.id,
                                })
                              }
                              className="h-4 w-4 accent-terra-600"
                            />
                            Activa
                          </label>
                        )}

                        <button
                          onClick={() => handleDeleteTrack(track)}
                          className="rounded-lg border-2 border-terra-900 bg-moss-900/50 p-2 text-terra-400 transition-all hover:bg-moss-500 hover:text-white"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="sticky bottom-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border-4 border-white bg-moss-500 px-8 py-3 font-black text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-moss-600 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
