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
import { AdminLogHelpers } from "@/lib/adminLogs";

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
          bankName: data.bankName,
          bankAccountType: data.bankAccountType,
          bankAccountNumber: data.bankAccountNumber,
          bankAccountHolder: data.bankAccountHolder,
          bankRut: data.bankRut,
          bankEmail: data.bankEmail,
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
      
      // Registrar log de actividad
      if (user.email) {
        await AdminLogHelpers.logGeneralSettingsUpdated(
          user.email,
          user.uid
        );
      }
      
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
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 via-gray-50 to-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-linear-to-br from-slate-100 via-gray-50 to-slate-50 py-8">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Header */}
          <div className="mb-8 rounded-2xl border-4 border-black bg-linear-to-r from-cyan-500 to-cyan-600 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="rounded-xl border-2 border-white bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-white">
                <SettingsIcon className="h-7 w-7 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">
                  Configuraciones Generales
                </h1>
                <p className="text-sm text-white/90">
                  Configura los aspectos generales del sitio
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border-4 border-white bg-white px-6 py-3 font-bold text-cyan-600 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] disabled:opacity-50"
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
          <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 flex items-center gap-3">
              <SettingsIcon className="h-6 w-6 text-cyan-600" />
              <h2 className="text-xl font-bold text-black">PWA y App</h2>
            </div>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.showPWAPrompt}
                onChange={(e) =>
                  setSettings({ ...settings, showPWAPrompt: e.target.checked })
                }
                className="h-5 w-5 rounded border-gray-300 bg-white text-cyan-600 focus:ring-2 focus:ring-cyan-500"
              />
              <div>
                <span className="font-bold text-black">Mostrar Prompt de Instalación PWA</span>
                <p className="text-sm text-gray-600">
                  Invita a los usuarios a instalar la app como PWA
                </p>
              </div>
            </label>
          </div>

          {/* Brand Colors */}
          <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 flex items-center gap-3">
              <Palette className="h-6 w-6 text-cyan-600" />
              <h2 className="text-xl font-bold text-black">Paleta de Colores</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Color Principal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className="h-12 w-16 cursor-pointer rounded border-2 border-black"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className="flex-1 rounded border-2 border-gray-300 bg-white px-3 py-2 text-black"
                    placeholder="#DC2626"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Color Secundario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, secondaryColor: e.target.value })
                    }
                    className="h-12 w-16 cursor-pointer rounded border-2 border-black"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, secondaryColor: e.target.value })
                    }
                    className="flex-1 rounded border-2 border-gray-300 bg-white px-3 py-2 text-black"
                    placeholder="#991B1B"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Color de Acento
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) =>
                      setSettings({ ...settings, accentColor: e.target.value })
                    }
                    className="h-12 w-16 cursor-pointer rounded border-2 border-black"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) =>
                      setSettings({ ...settings, accentColor: e.target.value })
                    }
                    className="flex-1 rounded border-2 border-gray-300 bg-white px-3 py-2 text-black"
                    placeholder="#EF4444"
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              💡 Estos colores se aplicarán a botones, enlaces y elementos destacados del sitio
            </p>
          </div>

          {/* Contact Information */}
          <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-6 w-6 text-cyan-600" />
              <h2 className="text-xl font-bold text-black">Información de Contacto</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black"
                  placeholder="contacto@josevega.art"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, contactPhone: e.target.value })
                  }
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-black">
                  <Phone className="mr-2 inline h-4 w-4" />
                  Número de WhatsApp
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappNumber: e.target.value })
                  }
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black"
                  placeholder="56912345678"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Solo números, con código de país (ej: 56912345678 para Chile)
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 flex items-center gap-3">
              <Share2 className="h-6 w-6 text-cyan-600" />
              <h2 className="text-xl font-bold text-black">Redes Sociales</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Instagram
                </label>
                <input
                  type="url"
                  value={settings.instagramUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, instagramUrl: e.target.value })
                  }
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black"
                  placeholder="https://instagram.com/usuario"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  TikTok
                </label>
                <input
                  type="url"
                  value={settings.tiktokUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, tiktokUrl: e.target.value })
                  }
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black"
                  placeholder="https://tiktok.com/@usuario"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Facebook
                </label>
                <input
                  type="url"
                  value={settings.facebookUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, facebookUrl: e.target.value })
                  }
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black"
                  placeholder="https://facebook.com/usuario"
                />
              </div>
            </div>
          </div>

          {/* Footer Settings */}
          <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-4 text-xl font-bold text-black">Footer</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Texto del Footer
                </label>
                <input
                  type="text"
                  value={settings.footerText}
                  onChange={(e) =>
                    setSettings({ ...settings, footerText: e.target.value })
                  }
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black"
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
                  className="h-5 w-5 rounded border-gray-300 bg-white text-cyan-600 focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-sm font-bold text-black">
                  Mostrar redes sociales en el footer
                </span>
              </label>
            </div>
          </div>

          {/* Banner Settings */}
          <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-4 text-xl font-bold text-black">Banner / Hero</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Color de Fondo del Banner
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.bannerBackgroundColor}
                    onChange={(e) =>
                      setSettings({ ...settings, bannerBackgroundColor: e.target.value })
                    }
                    className="h-12 w-16 cursor-pointer rounded border-2 border-black"
                  />
                  <input
                    type="text"
                    value={settings.bannerBackgroundColor}
                    onChange={(e) =>
                      setSettings({ ...settings, bannerBackgroundColor: e.target.value })
                    }
                    className="flex-1 rounded border-2 border-gray-300 bg-white px-3 py-2 text-black"
                    placeholder="#1F2937"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
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
                  className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-cyan-600"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Controla qué tan oscura es la capa sobre las imágenes del banner
                </p>
              </div>
            </div>
          </div>

          {/* UI Preferences */}
          <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-4 text-xl font-bold text-black">Preferencias de UI</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableAnimations}
                  onChange={(e) =>
                    setSettings({ ...settings, enableAnimations: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 bg-white text-cyan-600 focus:ring-2 focus:ring-cyan-500"
                />
                <div>
                  <span className="font-bold text-black">Habilitar Animaciones</span>
                  <p className="text-sm text-gray-600">
                    Transiciones y animaciones en la interfaz
                  </p>
                </div>
              </label>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Estilo de Botones
                </label>
                <select
                  value={settings.buttonStyle}
                  onChange={(e) =>
                    setSettings({ ...settings, buttonStyle: e.target.value as GeneralSettings["buttonStyle"] })
                  }
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black"
                >
                  <option value="rounded">Redondeados</option>
                  <option value="square">Cuadrados</option>
                  <option value="pill">Pastilla (muy redondeados)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bank Transfer Information */}
          <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-2 text-xl font-bold text-black">💳 Datos de Transferencia Bancaria</h2>
            <p className="mb-4 text-sm text-gray-600">
              Estos datos se mostrarán a los clientes cuando seleccionen "Transferencia" como método de pago
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Banco
                </label>
                <input
                  type="text"
                  placeholder="Ej: Banco de Chile"
                  value={settings.bankName || ""}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black placeholder-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Tipo de Cuenta
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cuenta Corriente"
                  value={settings.bankAccountType || ""}
                  onChange={(e) => setSettings({ ...settings, bankAccountType: e.target.value })}
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black placeholder-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Número de Cuenta
                </label>
                <input
                  type="text"
                  placeholder="Ej: 12345678"
                  value={settings.bankAccountNumber || ""}
                  onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black placeholder-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Titular de la Cuenta
                </label>
                <input
                  type="text"
                  placeholder="Ej: José Vega Ramírez"
                  value={settings.bankAccountHolder || ""}
                  onChange={(e) => setSettings({ ...settings, bankAccountHolder: e.target.value })}
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black placeholder-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  RUT del Titular
                </label>
                <input
                  type="text"
                  placeholder="Ej: 12.345.678-9"
                  value={settings.bankRut || ""}
                  onChange={(e) => setSettings({ ...settings, bankRut: e.target.value })}
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black placeholder-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Email para Notificaciones
                </label>
                <input
                  type="email"
                  placeholder="Ej: pagos@josevega.art"
                  value={settings.bankEmail || ""}
                  onChange={(e) => setSettings({ ...settings, bankEmail: e.target.value })}
                  className="w-full rounded border-2 border-gray-300 bg-white px-4 py-2 text-black placeholder-gray-500"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Email donde recibirás notificaciones de transferencias
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
              <p className="text-sm text-black">
                <strong>Vista previa:</strong> Estos datos se mostrarán al cliente después de confirmar su pedido cuando elija "Transferencia".
              </p>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
