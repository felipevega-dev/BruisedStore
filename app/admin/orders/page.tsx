"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { CustomOrder } from "@/types";
import Image from "next/image";
import { Loader2, ArrowLeft, Trash2, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin");
      } else {
        setUser(user);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

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
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: CustomOrder["status"]) => {
    try {
      await updateDoc(doc(db, "customOrders", orderId), {
        status: newStatus,
      });
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error al actualizar el estado");
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

  if (loading) {
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
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/admin"
            className="text-gray-300 transition-colors hover:text-red-400"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-red-100 sm:text-4xl">
            Pedidos Personalizados
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`cursor-pointer rounded-lg border-2 bg-black/60 p-4 backdrop-blur-sm transition-all hover:shadow-xl ${
                    selectedOrder?.id === order.id
                      ? "border-red-700 shadow-2xl shadow-red-900/40"
                      : "border-red-900/30 hover:border-red-700 hover:shadow-red-900/20"
                  }`}
                >
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
              ))}

              {orders.length === 0 && (
                <div className="rounded-lg border-2 border-red-900 bg-black/60 p-12 text-center backdrop-blur-sm shadow-2xl shadow-red-900/30">
                  <p className="text-xl font-semibold text-red-100">
                    No hay pedidos personalizados
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

                {/* Status Update */}
                <div>
                  <h3 className="mb-3 font-bold text-red-100">
                    Actualizar Estado
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleStatusChange(selectedOrder.id!, "pending")
                      }
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-all ${
                        selectedOrder.status === "pending"
                          ? "border-yellow-600 bg-yellow-900/50 text-yellow-300 shadow-lg shadow-yellow-900/50"
                          : "border-yellow-900 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40"
                      }`}
                    >
                      Pendiente
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedOrder.id!, "in-progress")
                      }
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-all ${
                        selectedOrder.status === "in-progress"
                          ? "border-blue-600 bg-blue-900/50 text-blue-300 shadow-lg shadow-blue-900/50"
                          : "border-blue-900 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40"
                      }`}
                    >
                      En Progreso
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedOrder.id!, "completed")
                      }
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-all ${
                        selectedOrder.status === "completed"
                          ? "border-green-600 bg-green-900/50 text-green-300 shadow-lg shadow-green-900/50"
                          : "border-green-900 bg-green-900/20 text-green-400 hover:bg-green-900/40"
                      }`}
                    >
                      Completado
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedOrder.id!, "cancelled")
                      }
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-all ${
                        selectedOrder.status === "cancelled"
                          ? "border-red-600 bg-red-900/50 text-red-300 shadow-lg shadow-red-900/50"
                          : "border-red-900 bg-red-900/20 text-red-400 hover:bg-red-900/40"
                      }`}
                    >
                      Cancelado
                    </button>
                  </div>
                </div>
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
