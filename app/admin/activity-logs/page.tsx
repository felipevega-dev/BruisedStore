"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminLog, AdminAction } from "@/types";
import { FileText, Calendar, User, Filter, X, Loader2 } from "lucide-react";

const ACTION_LABELS: Record<AdminAction, string> = {
  order_status_updated: "Pedido Actualizado",
  order_deleted: "Pedido Eliminado",
  custom_order_status_updated: "Obra Personalizada Actualizada",
  custom_order_deleted: "Obra Personalizada Eliminada",
  painting_created: "Obra Agregada",
  painting_updated: "Obra Actualizada",
  painting_deleted: "Obra Eliminada",
  review_approved: "Reseña Aprobada",
  review_rejected: "Reseña Rechazada",
  review_deleted: "Reseña Eliminada",
  coupon_created: "Cupón Creado",
  coupon_updated: "Cupón Actualizado",
  coupon_deleted: "Cupón Eliminado",
  blog_post_created: "Post Creado",
  blog_post_updated: "Post Actualizado",
  blog_post_deleted: "Post Eliminado",
  blog_post_published: "Post Publicado",
  blog_post_unpublished: "Post Despublicado",
  home_settings_updated: "Configuración Home Actualizada",
  music_settings_updated: "Configuración Música Actualizada",
  general_settings_updated: "Configuración General Actualizada",
};

const ACTION_CATEGORIES = {
  orders: ["order_status_updated", "order_deleted", "custom_order_status_updated", "custom_order_deleted"],
  paintings: ["painting_created", "painting_updated", "painting_deleted"],
  reviews: ["review_approved", "review_rejected", "review_deleted"],
  coupons: ["coupon_created", "coupon_updated", "coupon_deleted"],
  blog: ["blog_post_created", "blog_post_updated", "blog_post_deleted", "blog_post_published", "blog_post_unpublished"],
  settings: ["home_settings_updated", "music_settings_updated", "general_settings_updated"],
};

export default function ActivityLogsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<keyof typeof ACTION_CATEGORIES | "all">("all");
  const [filterAdmin, setFilterAdmin] = useState<string>("all");
  const [filteredLogs, setFilteredLogs] = useState<AdminLog[]>([]);

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push("/admin");
      return;
    }

    fetchLogs();
  }, [user, isAdmin, router]);

  useEffect(() => {
    // Aplicar filtros
    let filtered = [...logs];

    if (filterCategory !== "all") {
      const actionsInCategory = ACTION_CATEGORIES[filterCategory];
      filtered = filtered.filter((log) => actionsInCategory.includes(log.action));
    }

    if (filterAdmin !== "all") {
      filtered = filtered.filter((log) => log.adminEmail === filterAdmin);
    }

    setFilteredLogs(filtered);
  }, [logs, filterCategory, filterAdmin]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching logs from Firestore...");
      const logsRef = collection(db, "adminLogs");
      const q = query(logsRef, orderBy("timestamp", "desc"), limit(100));
      const snapshot = await getDocs(q);

      console.log("📊 Logs encontrados:", snapshot.size);

      const logsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("📝 Log data:", { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp
            ? data.timestamp.toDate()
            : new Date(data.timestamp),
        } as AdminLog;
      });

      console.log("✅ Logs procesados:", logsData.length);
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error("❌ Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
        -Math.floor(diffInHours),
        "hour"
      );
    } else {
      return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  };

  const getActionColor = (action: AdminAction): string => {
    if (action.includes("created") || action.includes("approved") || action.includes("published")) {
      return "bg-primary-100 text-primary-800 border-primary-300";
    }
    if (action.includes("deleted") || action.includes("rejected")) {
      return "bg-orange-100 text-orange-800 border-orange-300";
    }
    if (action.includes("updated")) {
      return "bg-secondary-100 text-secondary-800 border-secondary-300";
    }
    return "bg-surface-100 text-surface-800 border-surface-300";
  };

  const uniqueAdmins = Array.from(new Set(logs.map((log) => log.adminEmail)));

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-100 via-gray-50 to-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-slate-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-gray-50 to-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 rounded-2xl border-4 border-black bg-linear-to-r from-slate-500 to-slate-600 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-white">
              <FileText className="h-7 w-7 text-slate-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">
                Registro de Actividad
              </h1>
              <p className="text-sm text-white/90">
                Historial de acciones realizadas por administradores (últimas 100)
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span className="font-bold">Filtros:</span>
          </div>

          {/* Filter by Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="rounded-md border-2 border-black px-4 py-2 font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todas las Categorías</option>
            <option value="orders">Pedidos</option>
            <option value="paintings">Obras</option>
            <option value="reviews">Reseñas</option>
            <option value="coupons">Cupones</option>
            <option value="blog">Blog</option>
            <option value="settings">Configuración</option>
          </select>

          {/* Filter by Admin */}
          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value)}
            className="rounded-md border-2 border-black px-4 py-2 font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos los Admins</option>
            {uniqueAdmins.map((admin) => (
              <option key={admin} value={admin}>
                {admin}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(filterCategory !== "all" || filterAdmin !== "all") && (
            <button
              onClick={() => {
                setFilterCategory("all");
                setFilterAdmin("all");
              }}
              className="flex items-center gap-2 rounded-md border-2 border-black bg-gray-200 px-4 py-2 font-medium transition-all hover:bg-gray-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
            >
              <X className="h-4 w-4" />
              Limpiar
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black text-primary-500">{filteredLogs.length}</div>
            <div className="text-sm text-gray-600">Acciones Registradas</div>
          </div>
          <div className="rounded-lg border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black text-secondary-500">{uniqueAdmins.length}</div>
            <div className="text-sm text-gray-600">Administradores Activos</div>
          </div>
          <div className="rounded-lg border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-2xl font-black text-orange-500">
              {logs.length > 0 ? formatDate(logs[0].timestamp).replace("hace ", "") : "N/A"}
            </div>
            <div className="text-sm text-gray-600">Última Actividad</div>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="rounded-lg border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="text-xl font-bold text-gray-600">
                No hay registros para mostrar
              </p>
              <p className="text-gray-500">
                {filterCategory !== "all" || filterAdmin !== "all"
                  ? "Intenta cambiar los filtros"
                  : "Las acciones se registrarán aquí automáticamente"}
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-block rounded-md border-2 px-3 py-1 text-sm font-bold ${getActionColor(log.action)}`}
                      >
                        {ACTION_LABELS[log.action]}
                      </span>
                      {log.metadata?.orderNumber && (
                        <span className="text-sm font-medium text-gray-600">
                          #{log.metadata.orderNumber}
                        </span>
                      )}
                    </div>

                    {log.metadata?.description && (
                      <p className="mb-2 text-sm text-gray-700">
                        {log.metadata.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{log.adminEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Info */}
        {logs.length >= 100 && (
          <div className="mt-6 rounded-lg border-4 border-orange-400 bg-orange-50 p-4 text-center">
            <p className="font-bold text-orange-800">
              ⚠️ Mostrando las últimas 100 acciones
            </p>
            <p className="text-sm text-orange-700">
              Los registros más antiguos están archivados en Firestore
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
