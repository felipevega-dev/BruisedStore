"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Order, Review, Painting } from "@/types";
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Star, Package, Users, BarChart3 } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-surface-950 via-surface-900 to-black">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-lg font-semibold text-surface-100">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-surface-950 via-surface-900 to-black">
        <div className="text-center text-surface-100">
          <p>Error al cargar analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-surface-950 via-surface-900 to-black py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-surface-300 transition-colors hover:text-surface-400"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al Panel
            </Link>
            <h1 className="text-3xl font-black text-surface-100 sm:text-4xl">
              📊 Dashboard de Analytics
            </h1>
            <p className="mt-2 text-surface-300">Métricas y estadísticas de tu negocio</p>
          </div>

          {/* Date Range Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange("all")}
              className={`rounded-lg border-2 px-4 py-2 font-semibold transition-all ${dateRange === "all"
                  ? "border-orange-500 bg-primary-500 text-white"
                  : "border-surface-700 bg-transparent text-surface-300 hover:border-orange-500"
                }`}
            >
              Todo
            </button>
            <button
              onClick={() => setDateRange("month")}
              className={`rounded-lg border-2 px-4 py-2 font-semibold transition-all ${dateRange === "month"
                  ? "border-orange-500 bg-primary-500 text-white"
                  : "border-surface-700 bg-transparent text-surface-300 hover:border-orange-500"
                }`}
            >
              Último Mes
            </button>
            <button
              onClick={() => setDateRange("week")}
              className={`rounded-lg border-2 px-4 py-2 font-semibold transition-all ${dateRange === "week"
                  ? "border-orange-500 bg-primary-500 text-white"
                  : "border-surface-700 bg-transparent text-surface-300 hover:border-orange-500"
                }`}
            >
              Última Semana
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <div className="rounded-lg border-2 border-surface-700 bg-surface-800/50 p-6 backdrop-blur">
            <div className="mb-2 flex items-center gap-2 text-surface-300">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-semibold">Ingresos Totales</span>
            </div>
            <p className="text-3xl font-black text-surface-100">{formatPrice(analytics.totalRevenue)}</p>
          </div>

          {/* Total Orders */}
          <div className="rounded-lg border-2 border-surface-700 bg-surface-800/50 p-6 backdrop-blur">
            <div className="mb-2 flex items-center gap-2 text-surface-300">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm font-semibold">Órdenes Totales</span>
            </div>
            <p className="text-3xl font-black text-surface-100">{analytics.totalOrders}</p>
          </div>

          {/* Average Order Value */}
          <div className="rounded-lg border-2 border-surface-700 bg-surface-800/50 p-6 backdrop-blur">
            <div className="mb-2 flex items-center gap-2 text-surface-300">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold">Ticket Promedio</span>
            </div>
            <p className="text-3xl font-black text-surface-100">{formatPrice(analytics.averageOrderValue)}</p>
          </div>

          {/* Average Rating */}
          <div className="rounded-lg border-2 border-surface-700 bg-surface-800/50 p-6 backdrop-blur">
            <div className="mb-2 flex items-center gap-2 text-surface-300">
              <Star className="h-5 w-5" />
              <span className="text-sm font-semibold">Calificación Promedio</span>
            </div>
            <p className="text-3xl font-black text-surface-100">
              {analytics.averageRating.toFixed(1)} ⭐
            </p>
            <p className="mt-1 text-sm text-surface-400">{analytics.totalReviews} reseñas</p>
          </div>
        </div>

        {/* Orders Status */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-surface-700 bg-surface-800/50 p-6 backdrop-blur">
            <div className="mb-4 flex items-center gap-2 text-surface-300">
              <Package className="h-5 w-5" />
              <span className="font-semibold">Estado de Órdenes</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-surface-200">Pendientes</span>
                <span className="rounded-full bg-orange-600 px-3 py-1 text-sm font-bold text-white">
                  {analytics.pendingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-200">Completadas</span>
                <span className="rounded-full bg-primary-600 px-3 py-1 text-sm font-bold text-white">
                  {analytics.completedOrders}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue by Month Chart (Simple) */}
          <div className="rounded-lg border-2 border-surface-700 bg-surface-800/50 p-6 backdrop-blur">
            <div className="mb-4 flex items-center gap-2 text-surface-300">
              <BarChart3 className="h-5 w-5" />
              <span className="font-semibold">Ingresos (últimos 6 meses)</span>
            </div>
            <div className="space-y-2">
              {analytics.revenueByMonth.slice(-6).map((item) => {
                const maxRevenue = Math.max(...analytics.revenueByMonth.map((m) => m.revenue));
                const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={item.month}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-surface-200">{item.month}</span>
                      <span className="font-bold text-surface-100">{formatPrice(item.revenue)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-900">
                      <div
                        className="h-full bg-primary-500 transition-all"
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
        <div className="rounded-lg border-2 border-surface-700 bg-surface-800/50 p-6 backdrop-blur">
          <div className="mb-6 flex items-center gap-2 text-surface-300">
            <TrendingUp className="h-6 w-6" />
            <h2 className="text-xl font-bold text-surface-100">Top 5 Obras Más Vendidas</h2>
          </div>

          {analytics.topPaintings.length === 0 ? (
            <p className="text-center text-surface-300">No hay datos de ventas aún</p>
          ) : (
            <div className="space-y-4">
              {analytics.topPaintings.map((item, index) => (
                <div
                  key={item.painting.id}
                  className="flex items-center gap-4 rounded-lg border border-surface-700/50 bg-surface-800/30 p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xl font-black text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-surface-100">{item.painting.title}</h3>
                    <p className="text-sm text-surface-300">
                      {item.sales} {item.sales === 1 ? "venta" : "ventas"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-surface-100">{formatPrice(item.revenue)}</p>
                    <p className="text-sm text-surface-400">{formatPrice(item.painting.price)}/u</p>
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
