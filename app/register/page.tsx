"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validación de email con regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un email válido (ejemplo: usuario@dominio.com)");
      return;
    }

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Crear usuario
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Actualizar perfil con el nombre
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      // Enviar email de verificación
      await sendEmailVerification(userCredential.user);

      // Redirigir a página de verificación pendiente
      router.push("/verify-email");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Mensajes de error en español
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("Este email ya está registrado");
          break;
        case "auth/invalid-email":
          setError("Email inválido");
          break;
        case "auth/weak-password":
          setError("La contraseña es muy débil");
          break;
        default:
          setError("Error al crear la cuenta. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-700 transition-colors hover:text-red-600"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver a la tienda
        </Link>

        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-6 flex items-center justify-center gap-3">
            <UserPlus className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border-2 border-black bg-white py-3 pl-12 pr-4 text-gray-900 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (error) setError("");
                  }}
                  required
                  className="w-full rounded-lg border-2 border-black bg-white py-3 pl-12 pr-4 text-gray-900 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (error) setError("");
                  }}
                  required
                  className="w-full rounded-lg border-2 border-black bg-white py-3 pl-12 pr-12 text-gray-900 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (error) setError("");
                  }}
                  required
                  className="w-full rounded-lg border-2 border-black bg-white py-3 pl-12 pr-12 text-gray-900 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border-2 border-black bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando cuenta...
                </span>
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-bold text-red-600 hover:text-red-700"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
