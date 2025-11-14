"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GeneralSettings, DEFAULT_GENERAL_SETTINGS } from "@/types";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Save, Loader2, Palette, Mail, Phone, Share2, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";

const SETTINGS_DOC_ID = "main";

export default function GeneralSettingsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const [settings, setSettings] = useState<Omit<GeneralSettings, "id" | "updatedAt">>({
    ...DEFAULT_GENERAL_SETTINGS,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push("/admin");
      } else {
        fetchSettings();
      }
    }
  }, [authLoading, user, isAdmin, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "generalSettings", SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as GeneralSettings;
        setSettings({
          showPWAPrompt: data.showPWAPrompt ?? false,
          primaryColor: data.primaryColor || DEFAULT_GENERAL_SETTINGS.primaryColor,
          secondaryColor: data.secondaryColor || DEFAULT_GENERAL_SETTINGS.secondaryColor,
          accentColor: data.accentColor || DEFAULT_GENERAL_SETTINGS.accentColor,
          contactEmail: data.contactEmail || DEFAULT_GENERAL_SETTINGS.contactEmail,
          contactPhone: data.contactPhone || DEFAULT_GENERAL_SETTINGS.contactPhone,
          whatsappNumber: data.whatsappNumber || DEFAULT_GENERAL_SETTINGS.whatsappNumber,
          instagramUrl: data.instagramUrl,
          tiktokUrl: data.tiktokUrl,
          facebookUrl: data.facebookUrl,
          footerText: data.footerText || DEFAULT_GENERAL_SETTINGS.footerText,
          showSocialInFooter: data.showSocialInFooter ?? true,
          bannerBackgroundColor: data.bannerBackgroundColor || DEFAULT_GENERAL_SETTINGS.bannerBackgroundColor,
          bannerOverlayOpacity: data.bannerOverlayOpacity ?? DEFAULT_GENERAL_SETTINGS.bannerOverlayOpacity,
          enableAnimations: data.enableAnimations ?? true,
          buttonStyle: data.buttonStyle || DEFAULT_GENERAL_SETTINGS.buttonStyle,
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

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const docRef = doc(db, "generalSettings", SETTINGS_DOC_ID);

      const dataToSave = {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      };

      await setDoc(docRef, dataToSave);
      showToast("Configuración guardada exitosamente", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Error al guardar configuración", "error");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-moss-900 to-black">
        <Loader2 className="h-8 w-8 animate-spin text-terra-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-moss-900 to-black py-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="rounded-lg border-2 border-terra-900 bg-moss-900/50 p-2 text-terra-100 transition-all hover:bg-terra-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-terra-100">
                Configuraciones Generales
              </h1>
              <p className="text-sm text-terra-300">
                Configura los aspectos generales del sitio
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg border-2 border-moss-500 bg-moss-500 px-6 py-3 font-bold text-white transition-all hover:bg-moss-600 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* PWA Settings */}
          <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <SettingsIcon className="h-6 w-6 text-terra-400" />
              <h2 className="text-xl font-bold text-terra-100">PWA y App</h2>
            </div>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.showPWAPrompt}
                onChange={(e) =>
                  setSettings({ ...settings, showPWAPrompt: e.target.checked })
                }
                className="h-5 w-5 rounded border-terra-900 bg-gray-900 text-moss-600 focus:ring-2 focus:ring-moss-500"
              />
              <div>
                <span className="font-bold text-terra-100">Mostrar Prompt de Instalación PWA</span>
                <p className="text-sm text-terra-300">
                  Invita a los usuarios a instalar la app como PWA
                </p>
              </div>
            </label>
          </div>

          {/* Brand Colors */}
          <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Palette className="h-6 w-6 text-terra-400" />
              <h2 className="text-xl font-bold text-terra-100">Paleta de Colores</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Color Principal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className="h-12 w-16 cursor-pointer rounded border-2 border-terra-900"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className="flex-1 rounded border-2 border-terra-900 bg-gray-900 px-3 py-2 text-terra-100"
                    placeholder="#DC2626"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Color Secundario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, secondaryColor: e.target.value })
                    }
                    className="h-12 w-16 cursor-pointer rounded border-2 border-terra-900"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, secondaryColor: e.target.value })
                    }
                    className="flex-1 rounded border-2 border-terra-900 bg-gray-900 px-3 py-2 text-terra-100"
                    placeholder="#991B1B"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Color de Acento
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) =>
                      setSettings({ ...settings, accentColor: e.target.value })
                    }
                    className="h-12 w-16 cursor-pointer rounded border-2 border-terra-900"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) =>
                      setSettings({ ...settings, accentColor: e.target.value })
                    }
                    className="flex-1 rounded border-2 border-terra-900 bg-gray-900 px-3 py-2 text-terra-100"
                    placeholder="#EF4444"
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-terra-300">
              💡 Estos colores se aplicarán a botones, enlaces y elementos destacados del sitio
            </p>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-6 w-6 text-terra-400" />
              <h2 className="text-xl font-bold text-terra-100">Información de Contacto</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                  placeholder="contacto@josevega.art"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, contactPhone: e.target.value })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  <Phone className="mr-2 inline h-4 w-4" />
                  Número de WhatsApp
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappNumber: e.target.value })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                  placeholder="56912345678"
                />
                <p className="mt-1 text-xs text-terra-300">
                  Solo números, con código de país (ej: 56912345678 para Chile)
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Share2 className="h-6 w-6 text-terra-400" />
              <h2 className="text-xl font-bold text-terra-100">Redes Sociales</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Instagram
                </label>
                <input
                  type="url"
                  value={settings.instagramUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, instagramUrl: e.target.value })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                  placeholder="https://instagram.com/usuario"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  TikTok
                </label>
                <input
                  type="url"
                  value={settings.tiktokUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, tiktokUrl: e.target.value })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                  placeholder="https://tiktok.com/@usuario"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Facebook
                </label>
                <input
                  type="url"
                  value={settings.facebookUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, facebookUrl: e.target.value })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                  placeholder="https://facebook.com/usuario"
                />
              </div>
            </div>
          </div>

          {/* Footer Settings */}
          <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-terra-100">Footer</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Texto del Footer
                </label>
                <input
                  type="text"
                  value={settings.footerText}
                  onChange={(e) =>
                    setSettings({ ...settings, footerText: e.target.value })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                  placeholder="© 2024 José Vega. Todos los derechos reservados."
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.showSocialInFooter}
                  onChange={(e) =>
                    setSettings({ ...settings, showSocialInFooter: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-terra-900 bg-gray-900 text-moss-600 focus:ring-2 focus:ring-moss-500"
                />
                <span className="text-sm font-bold text-terra-100">
                  Mostrar redes sociales en el footer
                </span>
              </label>
            </div>
          </div>

          {/* Banner Settings */}
          <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-terra-100">Banner / Hero</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Color de Fondo del Banner
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.bannerBackgroundColor}
                    onChange={(e) =>
                      setSettings({ ...settings, bannerBackgroundColor: e.target.value })
                    }
                    className="h-12 w-16 cursor-pointer rounded border-2 border-terra-900"
                  />
                  <input
                    type="text"
                    value={settings.bannerBackgroundColor}
                    onChange={(e) =>
                      setSettings({ ...settings, bannerBackgroundColor: e.target.value })
                    }
                    className="flex-1 rounded border-2 border-terra-900 bg-gray-900 px-3 py-2 text-terra-100"
                    placeholder="#1F2937"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Opacidad de Capa Oscura: {settings.bannerOverlayOpacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.bannerOverlayOpacity}
                  onChange={(e) =>
                    setSettings({ ...settings, bannerOverlayOpacity: parseInt(e.target.value) })
                  }
                  className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-moss-900/50 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-moss-500"
                />
                <p className="mt-1 text-xs text-terra-300">
                  Controla qué tan oscura es la capa sobre las imágenes del banner
                </p>
              </div>
            </div>
          </div>

          {/* UI Preferences */}
          <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-terra-100">Preferencias de UI</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableAnimations}
                  onChange={(e) =>
                    setSettings({ ...settings, enableAnimations: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-terra-900 bg-gray-900 text-moss-600 focus:ring-2 focus:ring-moss-500"
                />
                <div>
                  <span className="font-bold text-terra-100">Habilitar Animaciones</span>
                  <p className="text-sm text-terra-300">
                    Transiciones y animaciones en la interfaz
                  </p>
                </div>
              </label>

              <div>
                <label className="mb-2 block text-sm font-bold text-terra-100">
                  Estilo de Botones
                </label>
                <select
                  value={settings.buttonStyle}
                  onChange={(e) =>
                    setSettings({ ...settings, buttonStyle: e.target.value as GeneralSettings["buttonStyle"] })
                  }
                  className="w-full rounded border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100"
                >
                  <option value="rounded">Redondeados</option>
                  <option value="square">Cuadrados</option>
                  <option value="pill">Pastilla (muy redondeados)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
