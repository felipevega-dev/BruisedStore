"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Palette, Package, Loader2, Shield, AlertCircle, MessageCircle, Tag, BarChart3, Home, BookOpen, Bell, Music, Settings, FileText, Users } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Contadores de notificaciones por categoría
  const [ordersCount, setOrdersCount] = useState(0);
  const [customOrdersCount, setCustomOrdersCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);

  // Obtener conteos de notificaciones
  useEffect(() => {
    if (!user || !isAdmin) return;

    // Cargar IDs vistos
    const viewedOrderIds = new Set<string>();
    const viewedCustomOrderIds = new Set<string>();

    try {
      const storedOrders = localStorage.getItem("viewedOrderIds");
      const storedCustomOrders = localStorage.getItem("viewedCustomOrderIds");

      if (storedOrders) {
        JSON.parse(storedOrders).forEach((id: string) => viewedOrderIds.add(id));
      }
      if (storedCustomOrders) {
        JSON.parse(storedCustomOrders).forEach((id: string) => viewedCustomOrderIds.add(id));
      }
    } catch (e) {
      console.error("Error loading viewed orders:", e);
    }

    // Listener para órdenes de compra pendientes no vistas
    const ordersQuery = query(
      collection(db, "orders"),
      where("status", "==", "pending")
    );

    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const count = snapshot.docs.filter(doc => !viewedOrderIds.has(doc.id)).length;
      setOrdersCount(count);
    });

    // Listener para órdenes personalizadas pendientes no vistas
    const customOrdersQuery = query(
      collection(db, "customOrders"),
      where("status", "==", "pending")
    );

    const unsubCustomOrders = onSnapshot(customOrdersQuery, (snapshot) => {
      const count = snapshot.docs.filter(doc => !viewedCustomOrderIds.has(doc.id)).length;
      setCustomOrdersCount(count);
    });

    // Listener para reviews pendientes
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("approved", "==", false)
    );

    const unsubReviews = onSnapshot(reviewsQuery, (snapshot) => {
      setReviewsCount(snapshot.size);
    });

    // Listener para cambios en localStorage (cuando se marcan como vistas)
    const handleStorageChange = () => {
      // Re-cargar los IDs y actualizar contadores
      const newViewedOrders = new Set<string>();
      const newViewedCustomOrders = new Set<string>();

      try {
        const storedOrders = localStorage.getItem("viewedOrderIds");
        const storedCustomOrders = localStorage.getItem("viewedCustomOrderIds");

        if (storedOrders) {
          JSON.parse(storedOrders).forEach((id: string) => newViewedOrders.add(id));
        }
        if (storedCustomOrders) {
          JSON.parse(storedCustomOrders).forEach((id: string) => newViewedCustomOrders.add(id));
        }
      } catch (e) {
        console.error("Error reloading viewed orders:", e);
      }
    };

    window.addEventListener("ordersViewed", handleStorageChange);

    return () => {
      unsubOrders();
      unsubCustomOrders();
      unsubReviews();
      window.removeEventListener("ordersViewed", handleStorageChange);
    };
  }, [user, isAdmin]);

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
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary-50 via-white to-surface-100">
        <div className="rounded-2xl border border-primary-200 bg-white/95 p-8 shadow-xl shadow-primary-900/10 backdrop-blur">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary-50 via-white to-surface-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-primary-200 bg-white/95 p-8 shadow-xl shadow-primary-900/10 backdrop-blur">
          <div className="mb-6 flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-semibold text-surface-900">
              Admin Login
            </h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-surface-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-surface-900 transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 placeholder:text-surface-400"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-surface-700">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-surface-900 transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 placeholder:text-surface-400"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-100/80 p-3 text-sm font-medium text-orange-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            <div className="rounded-xl border border-orange-200 bg-orange-50/80 p-4 text-xs text-orange-700">
              <p className="mb-2 font-semibold">⚠️ Nota importante:</p>
              <p>
                Tu cuenta debe tener el rol "admin" asignado mediante Custom Claims en Firebase. Contacta al administrador del sistema si no puedes acceder.
              </p>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-linear-to-r from-primary-500 via-primary-500 to-primary-500 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-900/10 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-gray-50 to-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with better contrast */}
        <div className="mb-8 rounded-2xl border-4 border-black bg-linear-to-r from-primary-500 to-primary-600 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] sm:text-4xl">
                Panel de Administración
              </h1>
              <p className="mt-1 font-semibold text-primary-100">Bienvenido, {user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/paintings"
            className="group rounded-xl border-4 border-black bg-blue-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full border-4 border-blue-500 bg-blue-100 p-4 transition group-hover:scale-105">
                <Palette className="h-8 w-8 text-blue-700" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-black">
                  Gestionar Pinturas
                </h2>
                <p className="font-semibold text-gray-800">
                  Agregar, editar o eliminar obras de la galería
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders-store"
            className={`group relative rounded-xl border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${ordersCount > 0
                ? "bg-orange-100 animate-pulse"
                : "bg-green-50"
              }`}
          >
            {ordersCount > 0 && (
              <div className="absolute -right-3 -top-3 z-10">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-black bg-orange-400 text-base font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {ordersCount}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className={`rounded-full border-4 p-4 transition group-hover:scale-105 ${ordersCount > 0
                  ? "border-orange-500 bg-orange-200"
                  : "border-green-500 bg-green-100"
                }`}>
                <Package className={`h-8 w-8 ${ordersCount > 0 ? "text-orange-700" : "text-green-700"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="mb-2 text-xl font-black text-black">
                    Órdenes de Compra
                  </h2>
                  {ordersCount > 0 && (
                    <Bell className="h-5 w-5 text-orange-600 animate-bounce" />
                  )}
                </div>
                <p className={`font-semibold ${ordersCount > 0 ? "text-orange-800" : "text-gray-800"}`}>
                  Ver y gestionar pedidos de pinturas
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className={`group relative rounded-xl border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${customOrdersCount > 0
                ? "bg-orange-100 animate-pulse"
                : "bg-purple-50"
              }`}
          >
            {customOrdersCount > 0 && (
              <div className="absolute -right-3 -top-3 z-10">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-black bg-orange-400 text-base font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {customOrdersCount}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className={`rounded-full border-4 p-4 transition group-hover:scale-105 ${customOrdersCount > 0
                  ? "border-orange-500 bg-orange-200"
                  : "border-purple-500 bg-purple-100"
                }`}>
                <Palette className={`h-8 w-8 ${customOrdersCount > 0 ? "text-orange-700" : "text-purple-700"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="mb-2 text-xl font-black text-black">
                    Pedidos Personalizados
                  </h2>
                  {customOrdersCount > 0 && (
                    <Bell className="h-5 w-5 text-orange-600 animate-bounce" />
                  )}
                </div>
                <p className={`font-semibold ${customOrdersCount > 0 ? "text-orange-800" : "text-gray-800"}`}>
                  Ver y gestionar pedidos de obras a pedido
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/reviews"
            className={`group relative rounded-xl border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${reviewsCount > 0
                ? "bg-orange-100 animate-pulse"
                : "bg-yellow-50"
              }`}
          >
            {reviewsCount > 0 && (
              <div className="absolute -right-3 -top-3 z-10">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-black bg-orange-400 text-base font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {reviewsCount}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className={`rounded-full border-4 p-4 transition group-hover:scale-105 ${reviewsCount > 0
                  ? "border-orange-500 bg-orange-200"
                  : "border-yellow-500 bg-yellow-100"
                }`}>
                <MessageCircle className={`h-8 w-8 ${reviewsCount > 0 ? "text-orange-700" : "text-yellow-700"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="mb-2 text-xl font-black text-black">
                    Moderación de Reseñas
                  </h2>
                  {reviewsCount > 0 && (
                    <Bell className="h-5 w-5 text-orange-600 animate-bounce" />
                  )}
                </div>
                <p className={`font-semibold ${reviewsCount > 0 ? "text-orange-800" : "text-gray-800"}`}>
                  Aprobar, rechazar y gestionar comentarios
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/blog"
            className="group rounded-xl border-4 border-black bg-pink-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full border-4 border-pink-500 bg-pink-100 p-4 transition group-hover:scale-105">
                <BookOpen className="h-8 w-8 text-pink-700" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-black">
                  Administrar Blog
                </h2>
                <p className="font-semibold text-gray-800">
                  Crear, editar y publicar posts del blog
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/home-settings"
            className="group rounded-xl border-4 border-black bg-moss-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full border-4 border-moss-500 bg-moss-100 p-4 transition group-hover:scale-105">
                <Home className="h-8 w-8 text-moss-700" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-black">
                  Configuración del Home
                </h2>
                <p className="font-semibold text-gray-800">
                  Personalizar banner, contenido y videos
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/general-settings"
            className="group rounded-xl border-4 border-black bg-cyan-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full border-4 border-cyan-500 bg-cyan-100 p-4 transition group-hover:scale-105">
                <Settings className="h-8 w-8 text-cyan-700" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-black">
                  Configuraciones Generales
                </h2>
                <p className="font-semibold text-gray-800">
                  Colores, contacto, redes sociales y más
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/music"
            className="group rounded-xl border-4 border-black bg-indigo-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full border-4 border-indigo-500 bg-indigo-100 p-4 transition group-hover:scale-105">
                <Music className="h-8 w-8 text-indigo-700" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-black">
                  Música de Fondo
                </h2>
                <p className="font-semibold text-gray-800">
                  Configurar música ambiente del sitio
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/coupons"
            className="group rounded-xl border-4 border-black bg-amber-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full border-4 border-amber-500 bg-amber-100 p-4 transition group-hover:scale-105">
                <Tag className="h-8 w-8 text-amber-700" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-black">
                  Cupones de Descuento
                </h2>
                <p className="font-semibold text-gray-800">
                  Crear y gestionar cupones promocionales
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="group rounded-xl border-4 border-black bg-emerald-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full border-4 border-emerald-500 bg-emerald-100 p-4 transition group-hover:scale-105">
                <BarChart3 className="h-8 w-8 text-emerald-700" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-black">
                  Dashboard de Analytics
                </h2>
                <p className="font-semibold text-gray-800">
                  Métricas de ventas y estadísticas
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/activity-logs"
            className="group rounded-xl border-4 border-black bg-slate-100 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full border-4 border-slate-500 bg-slate-200 p-4 transition group-hover:scale-105">
                <FileText className="h-8 w-8 text-slate-700" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-black">
                  Registro de Actividad
                </h2>
                <p className="font-semibold text-gray-800">
                  Historial de acciones de administradores
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="group rounded-xl border-4 border-black bg-violet-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full border-4 border-violet-500 bg-violet-100 p-4 transition group-hover:scale-105">
                <Users className="h-8 w-8 text-violet-700" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-black text-black">
                  Gestión de Usuarios
                </h2>
                <p className="font-semibold text-gray-800">
                  Administrar roles y permisos de usuarios
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
