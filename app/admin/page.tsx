"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import Link from "next/link";
import { Palette, Package, LogOut, Loader2, Shield } from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError("Credenciales incorrectas");
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black">
        <div className="rounded-lg border-2 border-red-900 bg-black/60 p-8 backdrop-blur-sm">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (!user) {
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
              <p className="rounded-lg border-2 border-red-900 bg-red-950/30 p-3 text-sm font-semibold text-red-400">
                {error}
              </p>
            )}
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold text-red-100 sm:text-5xl">
            Panel de Administración
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-900 bg-red-900/20 px-4 py-2 font-semibold text-red-100 transition-all hover:bg-red-900 hover:shadow-lg hover:shadow-red-900/50"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
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
