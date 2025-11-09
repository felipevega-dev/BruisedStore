"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Palette, Package, Loader2, Shield, AlertCircle } from "lucide-react";

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      // Ya está logueado y es admin, puede ver el panel
    } else if (!authLoading && user && !isAdmin) {
      // Está logueado pero no es admin, redirigir
      router.push("/");
    }
  }, [user, isAdmin, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Refrescar el token para obtener los custom claims actualizados
      await refreshUser();
      // El useEffect se encargará de redirigir si no es admin
    } catch (error: any) {
      setError("Credenciales incorrectas o no tienes permisos de administrador");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black">
        <div className="rounded-lg border-2 border-red-900 bg-black/60 p-8 backdrop-blur-sm">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black px-4">
        <div className="w-full max-w-md rounded-lg border-2 border-red-900 bg-black/60 p-8 shadow-2xl shadow-red-900/30 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-red-100">
              Admin Login
            </h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg border-2 border-red-900 bg-red-950/30 p-3 text-sm font-semibold text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            <div className="rounded-lg border-2 border-yellow-900 bg-yellow-950/20 p-4 text-xs text-yellow-300">
              <p className="font-semibold mb-2">⚠️ Nota importante:</p>
              <p>Tu cuenta debe tener el rol "admin" asignado mediante Custom Claims en Firebase. Contacta al administrador del sistema si no puedes acceder.</p>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-3 font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-100 sm:text-5xl">
            Panel de Administración
          </h1>
          <p className="mt-2 text-gray-400">Bienvenido, {user?.email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/paintings"
            className="group rounded-lg border-2 border-red-900/30 bg-black/60 p-6 shadow-xl shadow-red-900/20 backdrop-blur-sm transition-all hover:border-red-700 hover:shadow-2xl hover:shadow-red-900/40"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg border-2 border-red-900 bg-red-950/30 p-4 transition-all group-hover:border-red-600 group-hover:bg-red-950/50">
                <Palette className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-bold text-red-100">
                  Gestionar Pinturas
                </h2>
                <p className="text-gray-400">
                  Agregar, editar o eliminar obras de la galería
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="group rounded-lg border-2 border-red-900/30 bg-black/60 p-6 shadow-xl shadow-red-900/20 backdrop-blur-sm transition-all hover:border-red-700 hover:shadow-2xl hover:shadow-red-900/40"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg border-2 border-red-900 bg-red-950/30 p-4 transition-all group-hover:border-red-600 group-hover:bg-red-950/50">
                <Package className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-bold text-red-100">
                  Pedidos Personalizados
                </h2>
                <p className="text-gray-400">
                  Ver y gestionar pedidos de obras a pedido
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
