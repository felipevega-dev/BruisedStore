"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Order, Review, Painting } from "@/types";
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Star, Package, Users, BarChart3,Loader2 } from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  topPaintings: Array<{
    painting: Painting;
    sales: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  averageRating: number;
  totalReviews: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<"all" | "month" | "week">("all");

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push("/admin");
      } else {
        setLoading(false);
        fetchAnalytics();
      }
    }
  }, [user, isAdmin, authLoading, router, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calcular fecha de inicio según el rango
      let startDate = new Date(0); // Desde el inicio de los tiempos
      if (dateRange === "month") {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (dateRange === "week") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      }

      // Obtener todas las órdenes
      const ordersQuery = dateRange === "all"
        ? query(collection(db, "orders"))
        : query(
          collection(db, "orders"),
          where("createdAt", ">=", startDate)
        );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order;
      });

      // Calcular métricas básicas
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const pendingOrders = orders.filter((o) => o.status === "pending").length;
      const completedOrders = orders.filter((o) => o.status === "delivered").length;

      // Calcular ventas por pintura
      const paintingSales: Record<string, { count: number; revenue: number; paintingId: string }> = {};

      orders.forEach((order) => {
        order.items.forEach((item) => {
          const paintingId = item.painting.id;
          if (!paintingSales[paintingId]) {
            paintingSales[paintingId] = {
              count: 0,
              revenue: 0,
              paintingId,
            };
          }
          paintingSales[paintingId].count += item.quantity;
          paintingSales[paintingId].revenue += item.painting.price * item.quantity;
        });
      });

      // Obtener información completa de las pinturas más vendidas
      const paintingsSnapshot = await getDocs(collection(db, "paintings"));
      const paintings = paintingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Painting[];

      const topPaintings = Object.values(paintingSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((sale) => {
          const painting = paintings.find((p) => p.id === sale.paintingId);
          return {
            painting: painting!,
            sales: sale.count,
            revenue: sale.revenue,
          };
        })
        .filter((item) => item.painting); // Filtrar los que no se encontró la pintura

      // Calcular revenue por mes (últimos 6 meses)
      const monthlyData: Record<string, { revenue: number; orders: number }> = {};
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleString("es-CL", { year: "numeric", month: "short" });
      }).reverse();

      last6Months.forEach((month) => {
        monthlyData[month] = { revenue: 0, orders: 0 };
      });

      orders.forEach((order) => {
        const monthKey = order.createdAt.toLocaleString("es-CL", { year: "numeric", month: "short" });
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += order.total;
          monthlyData[monthKey].orders += 1;
        }
      });

      const revenueByMonth = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders,
      }));

      // Obtener reseñas
      const reviewsSnapshot = await getDocs(collection(db, "reviews"));
      const reviews = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

      setAnalytics({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        pendingOrders,
        completedOrders,
        topPaintings,
        revenueByMonth,
        averageRating,
        totalReviews,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 via-gray-50 to-slate-50">
        <div className="rounded-2xl border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 via-gray-50 to-slate-50">
        <div className="rounded-2xl border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="font-bold text-gray-900">Error al cargar analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-gray-50 to-slate-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl border-4 border-black bg-linear-to-r from-emerald-500 to-emerald-600 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="rounded-xl border-2 border-white bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-white">
                <BarChart3 className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">
                  Dashboard de Analytics
                </h1>
                <p className="text-sm text-white/90">Métricas y estadísticas de tu negocio</p>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setDateRange("all")}
                className={`rounded-xl border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${dateRange === "all"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Todo
              </button>
              <button
                onClick={() => setDateRange("month")}
                className={`rounded-xl border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${dateRange === "month"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Último Mes
              </button>
              <button
                onClick={() => setDateRange("week")}
                className={`rounded-xl border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${dateRange === "week"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Última Semana
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <div className="rounded-2xl border-4 border-black bg-linear-to-br from-green-50 to-green-100 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-2 flex items-center gap-2 text-green-800">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-semibold">Ingresos Totales</span>
            </div>
            <p className="text-3xl font-black text-green-900">{formatPrice(analytics.totalRevenue)}</p>
          </div>

          {/* Total Orders */}
          <div className="rounded-2xl border-4 border-black bg-linear-to-br from-blue-50 to-blue-100 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-2 flex items-center gap-2 text-blue-800">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm font-semibold">Órdenes Totales</span>
            </div>
            <p className="text-3xl font-black text-blue-900">{analytics.totalOrders}</p>
          </div>

          {/* Average Order Value */}
          <div className="rounded-2xl border-4 border-black bg-linear-to-br from-purple-50 to-purple-100 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-2 flex items-center gap-2 text-purple-800">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold">Ticket Promedio</span>
            </div>
            <p className="text-3xl font-black text-purple-900">{formatPrice(analytics.averageOrderValue)}</p>
          </div>

          {/* Average Rating */}
          <div className="rounded-2xl border-4 border-black bg-linear-to-br from-yellow-50 to-yellow-100 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-2 flex items-center gap-2 text-yellow-800">
              <Star className="h-5 w-5" />
              <span className="text-sm font-semibold">Calificación Promedio</span>
            </div>
            <p className="text-3xl font-black text-yellow-900">
              {analytics.averageRating.toFixed(1)} ⭐
            </p>
            <p className="mt-1 text-sm text-yellow-700">{analytics.totalReviews} reseñas</p>
          </div>
        </div>

        {/* Orders Status */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 flex items-center gap-2 text-gray-700">
              <Package className="h-5 w-5" />
              <span className="font-bold">Estado de Órdenes</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">Pendientes</span>
                <span className="rounded-xl border-4 border-black bg-orange-500 px-3 py-1 text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {analytics.pendingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">Completadas</span>
                <span className="rounded-xl border-4 border-black bg-green-600 px-3 py-1 text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {analytics.completedOrders}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue by Month Chart (Simple) */}
          <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 flex items-center gap-2 text-gray-700">
              <BarChart3 className="h-5 w-5" />
              <span className="font-bold">Ingresos (últimos 6 meses)</span>
            </div>
            <div className="space-y-2">
              {analytics.revenueByMonth.slice(-6).map((item) => {
                const maxRevenue = Math.max(...analytics.revenueByMonth.map((m) => m.revenue));
                const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={item.month}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-700">{item.month}</span>
                      <span className="font-bold text-gray-900">{formatPrice(item.revenue)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Paintings */}
        <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-6 flex items-center gap-2 text-gray-700">
            <TrendingUp className="h-6 w-6" />
            <h2 className="text-xl font-bold text-gray-900">Top 5 Obras Más Vendidas</h2>
          </div>

          {analytics.topPaintings.length === 0 ? (
            <p className="text-center font-semibold text-gray-600">No hay datos de ventas aún</p>
          ) : (
            <div className="space-y-4">
              {analytics.topPaintings.map((item, index) => (
                <div
                  key={item.painting.id}
                  className="flex items-center gap-4 rounded-xl border-4 border-black bg-gray-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-black bg-emerald-500 text-xl font-black text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-gray-900">{item.painting.title}</h3>
                    <p className="text-sm font-semibold text-gray-600">
                      {item.sales} {item.sales === 1 ? "venta" : "ventas"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">{formatPrice(item.revenue)}</p>
                    <p className="text-sm font-semibold text-gray-600">{formatPrice(item.painting.price)}/u</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
