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
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/profile"
              className="group mb-4 inline-flex items-center gap-2 text-gray-700 transition-colors hover:text-red-600"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-bold">Volver al Perfil</span>
            </Link>
            <h1 className="text-4xl font-black text-black">Editar Perfil</h1>
            <p className="mt-2 text-gray-600">
              Actualiza tu información personal
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8"
          >
            {/* Display Name */}
            <div>
              <label className="mb-2 block text-sm font-black uppercase tracking-wide text-black">
                <User className="mb-1 inline-block h-4 w-4" /> Nombre de Usuario
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full border-4 border-black bg-white px-4 py-3 font-semibold text-black transition-all placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/20"
                placeholder="Tu nombre"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-black uppercase tracking-wide text-black">
                <Mail className="mb-1 inline-block h-4 w-4" /> Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border-4 border-black bg-white px-4 py-3 font-semibold text-black transition-all placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/20"
                placeholder="tu@email.com"
              />
              <p className="mt-2 text-xs text-gray-600">
                Si cambias tu email, es posible que tengas que volver a iniciar
                sesión
              </p>
            </div>

            {/* Divider */}
            <div className="my-6 border-t-4 border-black"></div>

            {/* Password Section */}
            <div>
              <h3 className="mb-4 text-lg font-black text-black">
                <Lock className="mb-1 inline-block h-4 w-4" /> Cambiar
                Contraseña
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Deja estos campos vacíos si no deseas cambiar tu contraseña
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-black">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className="w-full border-4 border-black bg-white px-4 py-3 font-semibold text-black transition-all placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/20"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-black">
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
                    className="w-full border-4 border-black bg-white px-4 py-3 font-semibold text-black transition-all placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/20"
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
                className="flex flex-1 items-center justify-center gap-2 border-4 border-black bg-red-600 px-6 py-3 font-black text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 disabled:bg-gray-400"
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
                className="flex flex-1 items-center justify-center gap-2 border-4 border-black bg-white px-6 py-3 font-black text-black transition-all hover:bg-gray-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
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
