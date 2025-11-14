"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Palette, Package, Loader2, Shield, AlertCircle, MessageCircle, Tag, BarChart3, Home, BookOpen, Bell, Music, Settings } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-moss-50 via-white to-slate-100">
        <div className="rounded-2xl border border-moss-200 bg-white/95 p-8 shadow-xl shadow-moss-900/10 backdrop-blur">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-moss-600" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-moss-50 via-white to-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-moss-200 bg-white/95 p-8 shadow-xl shadow-moss-900/10 backdrop-blur">
          <div className="mb-6 flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-moss-600" />
            <h1 className="text-3xl font-semibold text-slate-900">
              Admin Login
            </h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-moss-200 bg-white px-4 py-3 text-slate-900 transition focus:border-moss-300 focus:outline-none focus:ring-2 focus:ring-moss-100 placeholder:text-slate-400"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-moss-200 bg-white px-4 py-3 text-slate-900 transition focus:border-moss-300 focus:outline-none focus:ring-2 focus:ring-moss-100 placeholder:text-slate-400"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-terra-200 bg-terra-100/80 p-3 text-sm font-medium text-terra-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-700">
              <p className="mb-2 font-semibold">⚠️ Nota importante:</p>
              <p>
                Tu cuenta debe tener el rol "admin" asignado mediante Custom Claims en Firebase. Contacta al administrador del sistema si no puedes acceder.
              </p>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-linear-to-r from-moss-500 via-moss-500 to-moss-500 px-6 py-3 font-semibold text-white shadow-lg shadow-moss-900/10 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-moss-50 via-white to-slate-100 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            Panel de Administración
          </h1>
          <p className="mt-2 text-slate-600">Bienvenido, {user?.email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/paintings"
            className="group rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-lg shadow-moss-900/10 backdrop-blur transition hover:border-moss-300 hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-moss-200 bg-moss-50 p-4 transition group-hover:border-moss-300 group-hover:bg-white">
                <Palette className="h-8 w-8 text-moss-500" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold text-slate-900">
                  Gestionar Pinturas
                </h2>
                <p className="text-slate-600">
                  Agregar, editar o eliminar obras de la galería
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders-store"
            className={`group relative rounded-2xl border p-6 shadow-lg backdrop-blur transition ${
              ordersCount > 0
                ? "border-amber-300 bg-amber-50/80 shadow-amber-900/10 hover:border-amber-400 hover:shadow-amber-900/20 animate-pulse"
                : "border-moss-200 bg-white/95 shadow-moss-900/10 hover:border-moss-300 hover:shadow-xl"
            }`}
          >
            {ordersCount > 0 && (
              <div className="absolute -right-2 -top-2 z-10">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 bg-amber-400 text-sm font-semibold text-amber-900 shadow">
                  {ordersCount}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className={`rounded-xl border p-4 transition ${
                ordersCount > 0
                  ? "border-amber-300 bg-amber-100/60 group-hover:border-amber-400 group-hover:bg-amber-50"
                  : "border-moss-200 bg-moss-50 group-hover:border-moss-300 group-hover:bg-white"
              }`}>
                <Package className={`h-8 w-8 ${ordersCount > 0 ? "text-amber-500" : "text-moss-500"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className={`mb-2 text-xl font-semibold ${ordersCount > 0 ? "text-amber-800" : "text-slate-900"}`}>
                    Órdenes de Compra
                  </h2>
                  {ordersCount > 0 && (
                    <Bell className="h-5 w-5 text-amber-500 animate-bounce" />
                  )}
                </div>
                <p className={ordersCount > 0 ? "text-amber-700" : "text-slate-600"}>
                  Ver y gestionar pedidos de pinturas
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className={`group relative rounded-2xl border p-6 shadow-lg backdrop-blur transition ${
              customOrdersCount > 0
                ? "border-amber-300 bg-amber-50/80 shadow-amber-900/10 hover:border-amber-400 hover:shadow-amber-900/20 animate-pulse"
                : "border-moss-200 bg-white/95 shadow-moss-900/10 hover:border-moss-300 hover:shadow-xl"
            }`}
          >
            {customOrdersCount > 0 && (
              <div className="absolute -right-2 -top-2 z-10">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 bg-amber-400 text-sm font-semibold text-amber-900 shadow">
                  {customOrdersCount}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className={`rounded-xl border p-4 transition ${
                customOrdersCount > 0
                  ? "border-amber-300 bg-amber-100/60 group-hover:border-amber-400 group-hover:bg-amber-50"
                  : "border-moss-200 bg-moss-50 group-hover:border-moss-300 group-hover:bg-white"
              }`}>
                <Palette className={`h-8 w-8 ${customOrdersCount > 0 ? "text-amber-500" : "text-moss-500"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className={`mb-2 text-xl font-semibold ${customOrdersCount > 0 ? "text-amber-800" : "text-slate-900"}`}>
                    Pedidos Personalizados
                  </h2>
                  {customOrdersCount > 0 && (
                    <Bell className="h-5 w-5 text-amber-500 animate-bounce" />
                  )}
                </div>
                <p className={customOrdersCount > 0 ? "text-amber-700" : "text-slate-600"}>
                  Ver y gestionar pedidos de obras a pedido
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/reviews"
            className={`group relative rounded-2xl border p-6 shadow-lg backdrop-blur transition ${
              reviewsCount > 0
                ? "border-amber-300 bg-amber-50/80 shadow-amber-900/10 hover:border-amber-400 hover:shadow-amber-900/20 animate-pulse"
                : "border-moss-200 bg-white/95 shadow-moss-900/10 hover:border-moss-300 hover:shadow-xl"
            }`}
          >
            {reviewsCount > 0 && (
              <div className="absolute -right-2 -top-2 z-10">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 bg-amber-400 text-sm font-semibold text-amber-900 shadow">
                  {reviewsCount}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className={`rounded-xl border p-4 transition ${
                reviewsCount > 0
                  ? "border-amber-300 bg-amber-100/60 group-hover:border-amber-400 group-hover:bg-amber-50"
                  : "border-moss-200 bg-moss-50 group-hover:border-moss-300 group-hover:bg-white"
              }`}>
                <MessageCircle className={`h-8 w-8 ${reviewsCount > 0 ? "text-amber-500" : "text-moss-500"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className={`mb-2 text-xl font-semibold ${reviewsCount > 0 ? "text-amber-800" : "text-slate-900"}`}>
                    Moderación de Reseñas
                  </h2>
                  {reviewsCount > 0 && (
                    <Bell className="h-5 w-5 text-amber-500 animate-bounce" />
                  )}
                </div>
                <p className={reviewsCount > 0 ? "text-amber-700" : "text-slate-600"}>
                  Aprobar, rechazar y gestionar comentarios
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/blog"
            className="group rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-lg shadow-moss-900/10 backdrop-blur transition hover:border-moss-300 hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-moss-200 bg-moss-50 p-4 transition group-hover:border-moss-300 group-hover:bg-white">
                <BookOpen className="h-8 w-8 text-moss-500" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold text-slate-900">
                  Administrar Blog
                </h2>
                <p className="text-slate-600">
                  Crear, editar y publicar posts del blog
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/home-settings"
            className="group rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-lg shadow-moss-900/10 backdrop-blur transition hover:border-moss-300 hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-moss-200 bg-moss-50 p-4 transition group-hover:border-moss-300 group-hover:bg-white">
                <Home className="h-8 w-8 text-moss-500" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold text-slate-900">
                  Configuración del Home
                </h2>
                <p className="text-slate-600">
                  Personalizar banner, contenido y videos
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/general-settings"
            className="group rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-lg shadow-moss-900/10 backdrop-blur transition hover:border-moss-300 hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-moss-200 bg-moss-50 p-4 transition group-hover:border-moss-300 group-hover:bg-white">
                <Settings className="h-8 w-8 text-moss-500" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold text-slate-900">
                  Configuraciones Generales
                </h2>
                <p className="text-slate-600">
                  Colores, contacto, redes sociales y más
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/music"
            className="group rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-lg shadow-moss-900/10 backdrop-blur transition hover:border-moss-300 hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-moss-200 bg-moss-50 p-4 transition group-hover:border-moss-300 group-hover:bg-white">
                <Music className="h-8 w-8 text-moss-500" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold text-slate-900">
                  Música de Fondo
                </h2>
                <p className="text-slate-600">
                  Configurar música ambiente del sitio
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/coupons"
            className="group rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-lg shadow-moss-900/10 backdrop-blur transition hover:border-moss-300 hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-moss-200 bg-moss-50 p-4 transition group-hover:border-moss-300 group-hover:bg-white">
                <Tag className="h-8 w-8 text-moss-500" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold text-slate-900">
                  Cupones de Descuento
                </h2>
                <p className="text-slate-600">
                  Crear y gestionar cupones promocionales
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="group rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-lg shadow-moss-900/10 backdrop-blur transition hover:border-moss-300 hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-moss-200 bg-moss-50 p-4 transition group-hover:border-moss-300 group-hover:bg-white">
                <BarChart3 className="h-8 w-8 text-moss-500" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold text-slate-900">
                  Dashboard de Analytics
                </h2>
                <p className="text-slate-600">
                  Métricas de ventas y estadísticas
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
