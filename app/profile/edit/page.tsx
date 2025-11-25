"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { User, Mail, Lock, ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setFormData((prev) => ({
        ...prev,
        displayName: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      let updated = false;

      // Actualizar nombre de perfil
      if (formData.displayName && formData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: formData.displayName });
        updated = true;
      }

      // Actualizar email
      if (formData.email && formData.email !== user.email) {
        await updateEmail(user, formData.email);
        updated = true;
      }

      // Actualizar contraseña
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          showToast("Las contraseñas no coinciden", "error");
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          showToast("La contraseña debe tener al menos 6 caracteres", "error");
          setLoading(false);
          return;
        }
        await updatePassword(user, formData.newPassword);
        updated = true;
      }

      if (updated) {
        showToast("Perfil actualizado correctamente", "success");
        // Limpiar campos de contraseña
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        showToast("No hay cambios que guardar", "info");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.code === "auth/requires-recent-login") {
        showToast(
          "Por seguridad, debes volver a iniciar sesión para hacer este cambio",
          "warning"
        );
      } else if (error.code === "auth/email-already-in-use") {
        showToast("Este email ya está en uso", "error");
      } else {
        showToast("Error al actualizar el perfil", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-moss-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-slate-50 to-blue-50 py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/profile"
              className="group mb-3 inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-2 text-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-50 hover:text-primary-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 sm:mb-4"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-black">Volver</span>
            </Link>
            <h1 className="mb-2 text-3xl font-black text-slate-900 sm:text-4xl">Editar Perfil</h1>
            <p className="text-sm text-slate-600 sm:text-base">
              Actualiza tu información personal
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:space-y-6 sm:p-6"
          >
            {/* Display Name */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-900 sm:text-sm">
                <User className="mb-1 inline-block h-4 w-4" /> Nombre de Usuario
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full rounded-lg border-4 border-black bg-white px-4 py-2.5 font-bold text-slate-900 transition-all placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                placeholder="Tu nombre"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-900 sm:text-sm">
                <Mail className="mb-1 inline-block h-4 w-4" /> Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-lg border-4 border-black bg-white px-4 py-2.5 font-bold text-slate-900 transition-all placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                placeholder="tu@email.com"
              />
              <p className="mt-2 text-xs text-slate-600">
                Si cambias tu email, es posible que tengas que volver a iniciar
                sesión
              </p>
            </div>

            {/* Divider */}
            <div className="my-4 border-t-4 border-black sm:my-6"></div>

            {/* Password Section */}
            <div>
              <h3 className="mb-3 text-base font-black text-slate-900 sm:mb-4 sm:text-lg">
                <Lock className="mb-1 inline-block h-4 w-4" /> Cambiar
                Contraseña
              </h3>
              <p className="mb-4 text-xs text-slate-600 sm:text-sm">
                Deja estos campos vacíos si no deseas cambiar tu contraseña
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-900 sm:text-sm">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className="w-full rounded-lg border-4 border-black bg-white px-4 py-2.5 font-bold text-slate-900 transition-all placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-900 sm:text-sm">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border-4 border-black bg-white px-4 py-2.5 font-bold text-slate-900 transition-all placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border-4 border-black bg-primary-500 px-6 py-3 font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
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
              <Link
                href="/profile"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border-4 border-black bg-white px-6 py-3 font-black text-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-slate-50 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
