"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { CustomOrder } from "@/types";
import Image from "next/image";
import { Loader2, ArrowLeft, Trash2, Eye, Bell, Package } from "lucide-react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [viewedOrderIds, setViewedOrderIds] = useState<Set<string>>(new Set());
  const [pendingCount, setPendingCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Cargar órdenes vistas del localStorage
  useEffect(() => {
    const stored = localStorage.getItem("viewedCustomOrderIds");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setViewedOrderIds(new Set(parsed));
      } catch (e) {
        console.error("Error parsing viewed orders:", e);
      }
    }
  }, []);

  // Marcar una orden como vista
  const markOrderAsViewed = (orderId: string) => {
    setViewedOrderIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(orderId);
      // Guardar en localStorage
      localStorage.setItem("viewedCustomOrderIds", JSON.stringify([...newSet]));
      // Disparar evento para que el Header se actualice
      window.dispatchEvent(new Event("ordersViewed"));
      return newSet;
    });
  };

  // Verificar si una orden es nueva (no vista)
  const isOrderNew = (order: CustomOrder): boolean => {
    return !viewedOrderIds.has(order.id!) && order.status === "pending";
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push("/admin");
      } else {
        setLoading(false);
      }
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (user && isAdmin) {
      // NO marcar todas como vistas aquí
      localStorage.setItem("adminLastViewedCustomOrdersPage", Date.now().toString());
      
      fetchOrders();
    }
  }, [user, isAdmin]);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "customOrders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as CustomOrder;
      });
      setOrders(ordersData);
      
      // Contar pendientes NO VISTAS
      const newOrders = ordersData.filter((o) => isOrderNew(o));
      setPendingCount(newOrders.length);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: CustomOrder["status"]) => {
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, "customOrders", orderId), {
        status: newStatus,
      });
      
      // Actualizar el estado local inmediatamente
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error al actualizar el estado");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("¿Estás seguro de eliminar este pedido?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "customOrders", orderId));
      await fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Error al eliminar el pedido");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status: CustomOrder["status"]) => {
    const colors = {
      pending: "bg-yellow-900/30 border-yellow-900 text-yellow-300",
      "in-progress": "bg-blue-900/30 border-blue-900 text-blue-300",
      completed: "bg-green-900/30 border-green-900 text-green-300",
      cancelled: "bg-red-900/30 border-red-900 text-red-300",
    };
    return colors[status];
  };

  const getStatusLabel = (status: CustomOrder["status"]) => {
    const labels = {
      pending: "Pendiente",
      "in-progress": "En Progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return labels[status];
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-300 transition-colors hover:text-red-400"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-red-100 sm:text-4xl">
                Pedidos Personalizados
              </h1>
              <p className="text-gray-400">Obras a pedido</p>
            </div>
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border-2 border-yellow-900 bg-yellow-950/30 px-4 py-2">
              <Bell className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-yellow-300">
                {pendingCount} nuevo{pendingCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="space-y-3">
              {orders.map((order) => {
                const isNew = isOrderNew(order);
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      // Marcar como vista cuando se hace clic
                      if (order.id) {
                        markOrderAsViewed(order.id);
                        // Actualizar el contador
                        setPendingCount((prev) => Math.max(0, prev - 1));
                      }
                    }}
                    className={`relative cursor-pointer rounded-lg border-2 bg-black/60 p-4 backdrop-blur-sm transition-all hover:shadow-xl ${
                      selectedOrder?.id === order.id
                        ? "border-red-700 shadow-2xl shadow-red-900/40"
                        : "border-red-900/30 hover:border-red-700 hover:shadow-red-900/20"
                    }`}
                  >
                    {/* Badge NUEVO */}
                    {isNew && (
                      <div className="absolute -right-2 -top-2 z-10 animate-pulse">
                        <span className="inline-flex items-center gap-1 rounded-full border-2 border-yellow-400 bg-yellow-500 px-2 py-1 text-xs font-black text-black shadow-lg">
                          <Bell className="h-3 w-3" />
                          NUEVO
                        </span>
                      </div>
                    )}

                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-red-100">
                          {order.customerName}
                        </h3>
                        <p className="text-sm text-gray-400">{order.email}</p>
                      </div>
                      <span
                        className={`rounded-lg border-2 px-2 py-1 text-xs font-bold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="mb-1 text-sm text-gray-400">
                      {order.selectedSize.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-red-500">
                        {formatPrice(order.totalPrice)}
                      </p>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}

              {orders.length === 0 && (
                <div className="rounded-lg border-2 border-red-900 bg-black/60 p-12 text-center backdrop-blur-sm shadow-2xl shadow-red-900/30">
                  <Package className="mx-auto mb-4 h-16 w-16 text-red-600" />
                  <p className="text-xl font-semibold text-red-100">
                    No hay pedidos personalizados
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Los pedidos aparecerán aquí cuando los clientes soliciten obras a pedido
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="rounded-lg border-2 border-red-900 bg-black/60 p-6 shadow-2xl shadow-red-900/30 backdrop-blur-sm">
                <div className="mb-6 flex items-start justify-between">
                  <h2 className="text-2xl font-bold text-red-100">
                    Detalles del Pedido
                  </h2>
                  <button
                    onClick={() => handleDelete(selectedOrder.id!)}
                    className="text-red-400 transition-colors hover:text-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Status Update - MOVIDO ARRIBA */}
                <div className="mb-6 rounded-lg border-2 border-yellow-900/50 bg-yellow-950/20 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-yellow-300">
                    <Package className="h-5 w-5" />
                    Estado del Pedido
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(["pending", "in-progress", "completed", "cancelled"] as CustomOrder["status"][]).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(selectedOrder.id!, status)}
                          disabled={updatingStatus}
                          className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-all ${
                            selectedOrder.status === status
                              ? `${getStatusColor(status)} shadow-lg ring-2 ring-white/50`
                              : `${getStatusColor(status)} opacity-50 hover:opacity-100 hover:scale-105`
                          } disabled:cursor-not-allowed disabled:opacity-30`}
                        >
                          {getStatusLabel(status)}
                        </button>
                      )
                    )}
                  </div>
                  {updatingStatus && (
                    <p className="mt-2 text-sm text-yellow-300">
                      Actualizando estado...
                    </p>
                  )}
                </div>

                {/* Image */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-red-100">
                    Imagen de Referencia
                  </h3>
                  <div
                    className="relative mx-auto overflow-hidden rounded-lg border-2 border-red-900/30"
                    style={{
                      maxWidth: "400px",
                      aspectRatio: `${selectedOrder.selectedSize.width}/${selectedOrder.selectedSize.height}`,
                    }}
                  >
                    <Image
                      src={selectedOrder.referenceImageUrl}
                      alt="Reference"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-red-100">
                    Información del Cliente
                  </h3>
                  <div className="space-y-2 rounded-lg border-2 border-red-900/30 bg-red-950/20 p-4 backdrop-blur-sm">
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Nombre:</span>
                      <span className="font-semibold text-red-100">
                        {selectedOrder.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Email:</span>
                      <span className="font-semibold text-red-100">
                        {selectedOrder.email}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Teléfono:</span>
                      <span className="font-semibold text-red-100">
                        {selectedOrder.phone}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-400">Fecha:</span>
                      <span className="font-semibold text-red-100">
                        {formatDate(selectedOrder.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-red-100">
                    Detalles del Pedido
                  </h3>
                  <div className="space-y-2 rounded-lg border-2 border-red-900/30 bg-red-950/20 p-4 backdrop-blur-sm">
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Tamaño:</span>
                      <span className="font-semibold text-red-100">
                        {selectedOrder.selectedSize.name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Dimensiones:</span>
                      <span className="font-semibold text-red-100">
                        {selectedOrder.selectedSize.width} x{" "}
                        {selectedOrder.selectedSize.height} cm
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-red-900/30 pt-3">
                      <span className="text-lg font-medium text-gray-300">Total:</span>
                      <span className="text-2xl font-bold text-red-500">
                        {formatPrice(selectedOrder.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="mb-6">
                    <h3 className="mb-3 font-bold text-red-100">
                      Notas del Cliente
                    </h3>
                    <div className="rounded-lg border-2 border-red-900/30 bg-red-950/20 p-4 backdrop-blur-sm">
                      <p className="text-gray-300">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-red-900/30 bg-black/60 p-12 text-center backdrop-blur-sm shadow-2xl shadow-red-900/30">
                <p className="text-xl font-semibold text-gray-400">
                  Selecciona un pedido para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
