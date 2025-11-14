"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { HomeSettings, DEFAULT_HOME_SETTINGS } from "@/types";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { ArrowLeft, Save, Upload, Trash2, Loader2, Eye, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";
import { compressImage } from "@/lib/utils";

const SETTINGS_DOC_ID = "main";

export default function HomeSettingsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const profileImageRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<Omit<HomeSettings, "id" | "updatedAt">>({
    ...DEFAULT_HOME_SETTINGS,
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [videoUploadFile, setVideoUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Banner images management
  const [newBannerImages, setNewBannerImages] = useState<File[]>([]);
  const bannerImagesRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push("/admin");
      } else {
        fetchSettings();
      }
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "homeSettings", SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as HomeSettings;
        setSettings({
          profileImageUrl: data.profileImageUrl,
          bannerImages: data.bannerImages,
          heroTitle: data.heroTitle,
          heroSubtitle: data.heroSubtitle,
          contentTitle: data.contentTitle,
          contentText: data.contentText,
          videoType: data.videoType,
          videoUrl: data.videoUrl,
          videoFile: data.videoFile,
          videoSize: data.videoSize || "medium",
          videoPosition: data.videoPosition || "right",
          backgroundStyle: data.backgroundStyle,
          updatedBy: data.updatedBy,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      showToast("Error al cargar configuración", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("La imagen debe ser menor a 5MB", "error");
        return;
      }

      try {
        // Compress profile image (smaller size for profile)
        const compressed = await compressImage(file, 800, 0.9);
        setProfileImageFile(compressed);
        const previewUrl = URL.createObjectURL(compressed);
        setSettings({ ...settings, profileImageUrl: previewUrl });
        showToast("Imagen de perfil lista para subir", "success");
      } catch (error) {
        console.error("Error compressing profile image:", error);
        setProfileImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setSettings({ ...settings, profileImageUrl: previewUrl });
      }
    }
  };

  const handleBannerImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + settings.bannerImages.length > 12) {
      showToast("Máximo 12 imágenes en el banner", "warning");
      return;
    }

    // Compress images before storing
    const compressedFiles: File[] = [];
    for (const file of files) {
      try {
        const compressed = await compressImage(file, 1200, 0.85);
        compressedFiles.push(compressed);
      } catch (error) {
        console.error("Error compressing image:", error);
        compressedFiles.push(file); // Use original if compression fails
      }
    }

    setNewBannerImages(compressedFiles);
    showToast(`${compressedFiles.length} imagen(es) lista(s) para subir`, "success");
  };

  const removeBannerImage = (index: number) => {
    const updated = [...settings.bannerImages];
    updated.splice(index, 1);
    setSettings({ ...settings, bannerImages: updated });
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showToast("El video debe ser menor a 50MB", "error");
        return;
      }
      setVideoUploadFile(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      let finalSettings = { ...settings };

      // Upload profile image if changed
      if (profileImageFile) {
        setUploading(true);
        const imageRef = ref(storage, `home-settings/profile-${Date.now()}.jpg`);
        await uploadBytes(imageRef, profileImageFile);
        const imageUrl = await getDownloadURL(imageRef);
        finalSettings.profileImageUrl = imageUrl;
        setProfileImageFile(null);
      }

      // Upload banner images if any
      if (newBannerImages.length > 0) {
        setUploading(true);
        const uploadPromises = newBannerImages.map(async (file) => {
          const imageRef = ref(storage, `home-settings/banner-${Date.now()}-${file.name}`);
          await uploadBytes(imageRef, file);
          return await getDownloadURL(imageRef);
        });
        const urls = await Promise.all(uploadPromises);
        finalSettings.bannerImages = [...finalSettings.bannerImages, ...urls];
        setNewBannerImages([]);
      }

      // Upload video file if needed
      if (videoUploadFile && settings.videoType === "upload") {
        setUploading(true);
        const videoRef = ref(storage, `home-settings/video-${Date.now()}.mp4`);
        await uploadBytes(videoRef, videoUploadFile);
        const videoUrl = await getDownloadURL(videoRef);
        finalSettings.videoFile = videoUrl;
        setVideoUploadFile(null);
      }

      setUploading(false);

      // Save to Firestore - Filter out undefined values
      const docRef = doc(db, "homeSettings", SETTINGS_DOC_ID);

      // Remove undefined fields to prevent Firestore errors
      const dataToSave: any = {
        heroTitle: finalSettings.heroTitle,
        heroSubtitle: finalSettings.heroSubtitle || "",
        bannerImages: finalSettings.bannerImages,
        contentTitle: finalSettings.contentTitle,
        contentText: finalSettings.contentText,
        videoType: finalSettings.videoType,
        videoSize: finalSettings.videoSize || "medium",
        videoPosition: finalSettings.videoPosition || "right",
        backgroundStyle: finalSettings.backgroundStyle,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      };

      // Only include optional fields if they have values
      if (finalSettings.profileImageUrl && finalSettings.profileImageUrl.startsWith('http')) {
        dataToSave.profileImageUrl = finalSettings.profileImageUrl;
      }
      if (finalSettings.videoUrl) {
        dataToSave.videoUrl = finalSettings.videoUrl;
      }
      if (finalSettings.videoFile) {
        dataToSave.videoFile = finalSettings.videoFile;
      }

      await setDoc(docRef, dataToSave);

      showToast("Configuración guardada exitosamente", "success");
      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Error al guardar configuración", "error");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-moss-900 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-moss-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-moss-900 to-black py-8">
      <ToastContainer />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-terra-300 transition-colors hover:text-terra-400"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al Panel
            </Link>
            <h1 className="text-3xl font-black text-terra-100 sm:text-4xl">
              Configuración del Home
            </h1>
            <p className="mt-2 text-terra-300">Personaliza la página principal</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-lg border-2 border-blue-900 bg-blue-950 px-4 py-2 font-bold text-blue-300 transition-all hover:bg-blue-900"
            >
              <Eye className="h-5 w-5" />
              Vista Previa
            </Link>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex items-center gap-2 rounded-lg border-2 border-terra-900 bg-moss-500 px-6 py-2 font-bold text-white transition-all hover:bg-moss-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving || uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {uploading ? "Subiendo..." : saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Banner Settings */}
          <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-terra-100">Banner Principal</h2>

            {/* Profile Image */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-terra-100">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-4">
                {settings.profileImageUrl && (
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white">
                    <Image
                      src={settings.profileImageUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <input
                    ref={profileImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => profileImageRef.current?.click()}
                    className="flex items-center gap-2 rounded border-2 border-terra-900 bg-moss-900 px-4 py-2 text-sm font-bold text-terra-100 transition-all hover:bg-terra-900"
                  >
                    <Upload className="h-4 w-4" />
                    {settings.profileImageUrl ? "Cambiar" : "Subir"}
                  </button>
                </div>
              </div>
            </div>

            {/* Hero Title */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-terra-100">
                Título Principal *
              </label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) =>
                  setSettings({ ...settings, heroTitle: e.target.value })
                }
                className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                placeholder="José Vega"
              />
            </div>

            {/* Hero Subtitle */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-terra-100">
                Subtítulo
              </label>
              <input
                type="text"
                value={settings.heroSubtitle || ""}
                onChange={(e) =>
                  setSettings({ ...settings, heroSubtitle: e.target.value })
                }
                className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                placeholder="Arte Contemporáneo"
              />
            </div>

            {/* Banner Images */}
            <div>
              <label className="mb-2 block text-sm font-bold text-terra-100">
                Imágenes del Carrusel ({settings.bannerImages.length}/12)
              </label>
              <div className="mb-3 grid grid-cols-3 gap-2">
                {settings.bannerImages.map((img, index) => (
                  <div key={index} className="group relative aspect-square">
                    <Image
                      src={img}
                      alt={`Banner ${index + 1}`}
                      fill
                      className="rounded border-2 border-terra-900 object-cover"
                    />
                    <button
                      onClick={() => removeBannerImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-moss-500 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <input
                ref={bannerImagesRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleBannerImagesChange}
                className="hidden"
              />
              <button
                onClick={() => bannerImagesRef.current?.click()}
                disabled={settings.bannerImages.length >= 12}
                className="flex w-full items-center justify-center gap-2 rounded border-2 border-terra-900 bg-moss-900 px-4 py-3 font-bold text-terra-100 transition-all hover:bg-terra-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImageIcon className="h-5 w-5" />
                Agregar Imágenes
              </button>
              {newBannerImages.length > 0 && (
                <p className="mt-2 text-sm text-green-400">
                  {newBannerImages.length} nueva(s) imagen(es) lista(s) para subir
                </p>
              )}
            </div>
          </div>

          {/* Content Settings */}
          <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-terra-100">Contenido Principal</h2>

            {/* Content Title */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-terra-100">
                Título de Sección *
              </label>
              <input
                type="text"
                value={settings.contentTitle}
                onChange={(e) =>
                  setSettings({ ...settings, contentTitle: e.target.value })
                }
                className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
              />
            </div>

            {/* Content Text */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-terra-100">
                Texto de Contenido (Markdown soportado) *
              </label>
              <textarea
                value={settings.contentText}
                onChange={(e) =>
                  setSettings({ ...settings, contentText: e.target.value })
                }
                rows={6}
                className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
              />
              <p className="mt-1 text-xs text-terra-300">
                Soporta **negrita**, *cursiva*, listas, etc.
              </p>
            </div>

            {/* Video Type */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-terra-100">
                Tipo de Video
              </label>
              <select
                value={settings.videoType}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    videoType: e.target.value as HomeSettings["videoType"],
                  })
                }
                className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
              >
                <option value="none">Sin Video</option>
                <option value="youtube">YouTube</option>
                <option value="upload">Subir Video (detecta orientación automáticamente)</option>
              </select>
            </div>

            {/* Video URL */}
            {settings.videoType === "youtube" && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  URL del Video
                </label>
                <input
                  type="url"
                  value={settings.videoUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, videoUrl: e.target.value })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            )}

            {/* Video Upload */}
            {settings.videoType === "upload" && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Archivo de Video (máx 50MB)
                </label>

                {/* Current video preview */}
                {settings.videoFile && !videoUploadFile && (
                  <div className="mb-4 overflow-hidden rounded-lg border-2 border-terra-900 bg-black">
                    <video
                      src={settings.videoFile}
                      controls
                      className="w-full max-h-64 object-contain"
                      playsInline
                    >
                      Tu navegador no soporta el elemento de video.
                    </video>
                    <div className="p-2 text-center">
                      <p className="text-xs text-terra-300">Video actual</p>
                    </div>
                  </div>
                )}

                {/* New video selected preview */}
                {videoUploadFile && (
                  <div className="mb-4 rounded-lg border-2 border-green-600 bg-green-950/30 p-3">
                    <p className="text-sm font-bold text-green-400">
                      ✓ Nuevo video seleccionado: {videoUploadFile.name}
                    </p>
                    <p className="text-xs text-green-300 mt-1">
                      Se subirá al guardar los cambios
                    </p>
                  </div>
                )}

                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => videoFileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded border-2 border-terra-900 bg-moss-900 px-4 py-3 font-bold text-terra-100 transition-all hover:bg-terra-900"
                >
                  <Upload className="h-5 w-5" />
                  {settings.videoFile ? "Cambiar Video" : "Seleccionar Video"}
                </button>
              </div>
            )}

            {/* Video Size */}
            {settings.videoType !== "none" && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Tamaño del Video
                </label>
                <select
                  value={settings.videoSize || "medium"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      videoSize: e.target.value as HomeSettings["videoSize"],
                    })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                >
                  <option value="small">Pequeño (256px)</option>
                  <option value="medium">Mediano (320px)</option>
                  <option value="large">Grande (384px)</option>
                </select>
              </div>
            )}

            {/* Video Position */}
            {settings.videoType !== "none" && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Posición del Video
                </label>
                <select
                  value={settings.videoPosition || "right"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      videoPosition: e.target.value as HomeSettings["videoPosition"],
                    })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                >
                  <option value="left">Izquierda (texto a la derecha)</option>
                  <option value="right">Derecha (texto a la izquierda)</option>
                </select>
                <p className="mt-1 text-xs text-terra-300">
                  El video siempre aparece al lado del texto (no debajo)
                </p>
              </div>
            )}

            {/* Background Style */}
            <div>
              <label className="mb-2 block text-sm font-bold text-terra-100">
                Estilo de Fondo
              </label>
              <select
                value={settings.backgroundStyle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    backgroundStyle: e.target.value as HomeSettings["backgroundStyle"],
                  })
                }
                className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
              >
                <option value="gray">Gris</option>
                <option value="book">Libro (Beige)</option>
                <option value="dark">Oscuro</option>
                <option value="light">Claro</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
