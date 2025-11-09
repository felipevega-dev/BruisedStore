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
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/admin"
            className="text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
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
                  className={`cursor-pointer rounded-lg border bg-white p-4 transition-all hover:shadow-md ${
                    selectedOrder?.id === order.id
                      ? "border-gray-900 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {order.customerName}
                      </h3>
                      <p className="text-sm text-gray-600">{order.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-gray-600">
                    {order.selectedSize.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </p>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  No hay pedidos personalizados
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-6 flex items-start justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detalles del Pedido
                  </h2>
                  <button
                    onClick={() => handleDelete(selectedOrder.id!)}
                    className="text-red-600 transition-colors hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Image */}
                <div className="mb-6">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Imagen de Referencia
                  </h3>
                  <div
                    className="relative mx-auto overflow-hidden rounded-lg"
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
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Información del Cliente
                  </h3>
                  <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teléfono:</span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(selectedOrder.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="mb-6">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Detalles del Pedido
                  </h3>
                  <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tamaño:</span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.selectedSize.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensiones:</span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.selectedSize.width} x{" "}
                        {selectedOrder.selectedSize.height} cm
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(selectedOrder.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="mb-6">
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Notas del Cliente
                    </h3>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-gray-700">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Actualizar Estado
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleStatusChange(selectedOrder.id!, "pending")
                      }
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        selectedOrder.status === "pending"
                          ? "bg-yellow-600 text-white"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      }`}
                    >
                      Pendiente
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedOrder.id!, "in-progress")
                      }
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        selectedOrder.status === "in-progress"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                    >
                      En Progreso
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedOrder.id!, "completed")
                      }
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        selectedOrder.status === "completed"
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      Completado
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedOrder.id!, "cancelled")
                      }
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        selectedOrder.status === "cancelled"
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      Cancelado
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-white p-12 text-center shadow-md">
                <p className="text-gray-500">
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
