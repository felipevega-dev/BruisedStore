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
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Order, OrderStatus, ShippingStatus } from "@/types";
import Image from "next/image";
import { Loader2, ArrowLeft, Trash2, Eye, Package, Bell } from "lucide-react";
import Link from "next/link";

export default function AdminStoreOrdersPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

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
      // Listener en tiempo real
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            paymentInfo: {
              ...data.paymentInfo,
              paidAt: data.paymentInfo?.paidAt?.toDate(),
            },
          } as Order;
        });
        setOrders(ordersData);

        // Contar pendientes
        const pending = ordersData.filter((o) => o.status === "pending").length;
        setPendingCount(pending);
      });

      return () => unsubscribe();
    }
  }, [user, isAdmin]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error al actualizar el estado");
    }
  };

  const handleShippingStatusChange = async (
    orderId: string,
    newStatus: ShippingStatus
  ) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        shippingStatus: newStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating shipping status:", error);
      alert("Error al actualizar el estado de envío");
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("¿Estás seguro de eliminar este pedido?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "orders", orderId));
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

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: "bg-yellow-900/30 border-yellow-900 text-yellow-300",
      confirmed: "bg-blue-900/30 border-blue-900 text-blue-300",
      processing: "bg-purple-900/30 border-purple-900 text-purple-300",
      shipped: "bg-indigo-900/30 border-indigo-900 text-indigo-300",
      delivered: "bg-green-900/30 border-green-900 text-green-300",
      cancelled: "bg-red-900/30 border-red-900 text-red-300",
    };
    return colors[status];
  };

  const getShippingStatusColor = (status: ShippingStatus) => {
    const colors = {
      pending: "bg-gray-900/30 border-gray-700 text-gray-300",
      processing: "bg-blue-900/30 border-blue-900 text-blue-300",
      shipped: "bg-purple-900/30 border-purple-900 text-purple-300",
      delivered: "bg-green-900/30 border-green-900 text-green-300",
      cancelled: "bg-red-900/30 border-red-900 text-red-300",
    };
    return colors[status];
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return labels[status];
  };

  const getShippingStatusLabel = (status: ShippingStatus) => {
    const labels = {
      pending: "Pendiente",
      processing: "Preparando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return labels[status];
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      webpay: "WebPay Plus",
      mercadopago: "Mercado Pago",
      transferencia: "Transferencia",
      efectivo: "Efectivo",
    };
    return labels[method as keyof typeof labels] || method;
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
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-300 transition-colors hover:text-red-400"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-red-100 sm:text-4xl">
                Órdenes de Compra
              </h1>
              <p className="text-gray-400">Pinturas de la galería</p>
            </div>
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border-2 border-yellow-900 bg-yellow-950/30 px-4 py-2">
              <Bell className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-yellow-300">
                {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
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
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {order.shippingInfo.fullName}
                      </p>
                    </div>
                    <span
                      className={`rounded-lg border-2 px-2 py-1 text-xs font-bold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="mb-1 text-xs text-gray-500">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-red-500">
                      {formatPrice(order.total)}
                    </p>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="rounded-lg border-2 border-red-900 bg-black/60 p-12 text-center backdrop-blur-sm shadow-2xl shadow-red-900/30">
                  <Package className="mx-auto mb-4 h-16 w-16 text-red-600" />
                  <p className="text-xl font-semibold text-red-100">
                    No hay órdenes de compra
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Las órdenes aparecerán aquí cuando los clientes realicen compras
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
                  <div>
                    <h2 className="text-2xl font-bold text-red-100">
                      Orden {selectedOrder.orderNumber}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedOrder.id!)}
                    className="text-red-400 transition-colors hover:text-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-red-100">Productos</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.painting.id}
                        className="flex gap-4 rounded-lg border-2 border-red-900/30 bg-red-950/20 p-3"
                      >
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 border-red-900/30">
                          <Image
                            src={item.painting.imageUrl}
                            alt={item.painting.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-red-100">
                            {item.painting.title}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {item.painting.dimensions.width} x{" "}
                            {item.painting.dimensions.height} cm
                          </p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              Cantidad: {item.quantity}
                            </span>
                            <span className="font-bold text-red-400">
                              {formatPrice(item.painting.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-red-100">
                    Información del Cliente
                  </h3>
                  <div className="space-y-2 rounded-lg border-2 border-red-900/30 bg-red-950/20 p-4">
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Nombre:</span>
                      <span className="font-semibold text-red-100">
                        {selectedOrder.shippingInfo.fullName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Email:</span>
                      <span className="font-semibold text-red-100">
                        {selectedOrder.shippingInfo.email}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Teléfono:</span>
                      <span className="font-semibold text-red-100">
                        {selectedOrder.shippingInfo.phone}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Dirección:</span>
                      <span className="font-semibold text-right text-red-100">
                        {selectedOrder.shippingInfo.address}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Ciudad:</span>
                      <span className="font-semibold text-red-100">
                        {selectedOrder.shippingInfo.city}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-gray-400">Región:</span>
                      <span className="font-semibold text-red-100">
                        {selectedOrder.shippingInfo.region}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-red-100">
                    Información de Pago
                  </h3>
                  <div className="space-y-2 rounded-lg border-2 border-red-900/30 bg-red-950/20 p-4">
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Método:</span>
                      <span className="font-semibold text-red-100">
                        {getPaymentMethodLabel(selectedOrder.paymentInfo.method)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Estado:</span>
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold ${
                          selectedOrder.paymentInfo.status === "paid"
                            ? "bg-green-900/30 text-green-300"
                            : selectedOrder.paymentInfo.status === "failed"
                            ? "bg-red-900/30 text-red-300"
                            : "bg-yellow-900/30 text-yellow-300"
                        }`}
                      >
                        {selectedOrder.paymentInfo.status === "paid"
                          ? "Pagado"
                          : selectedOrder.paymentInfo.status === "failed"
                          ? "Fallido"
                          : "Pendiente"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-gray-400">ID Transacción:</span>
                      <span className="font-mono text-sm text-red-100">
                        {selectedOrder.paymentInfo.transactionId || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-red-100">
                    Resumen del Pedido
                  </h3>
                  <div className="space-y-2 rounded-lg border-2 border-red-900/30 bg-red-950/20 p-4">
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="font-semibold text-red-100">
                        {formatPrice(selectedOrder.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-red-900/20 pb-2">
                      <span className="text-gray-400">Envío:</span>
                      <span className="font-semibold text-red-100">
                        {formatPrice(selectedOrder.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-red-900/30 pt-3">
                      <span className="text-lg font-medium text-gray-300">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-red-500">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.shippingInfo.notes && (
                  <div className="mb-6">
                    <h3 className="mb-3 font-bold text-red-100">
                      Notas del Cliente
                    </h3>
                    <div className="rounded-lg border-2 border-red-900/30 bg-red-950/20 p-4">
                      <p className="text-gray-300">
                        {selectedOrder.shippingInfo.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-red-100">
                    Estado del Pedido
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleStatusChange(selectedOrder.id!, status)
                          }
                          className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-all ${
                            selectedOrder.status === status
                              ? `${getStatusColor(status)} shadow-lg`
                              : `${getStatusColor(status)} opacity-50 hover:opacity-100`
                          }`}
                        >
                          {getStatusLabel(status)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Shipping Status Update */}
                <div>
                  <h3 className="mb-3 font-bold text-red-100">
                    Estado de Envío
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(["pending", "processing", "shipped", "delivered", "cancelled"] as ShippingStatus[]).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleShippingStatusChange(selectedOrder.id!, status)
                          }
                          className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-all ${
                            selectedOrder.shippingStatus === status
                              ? `${getShippingStatusColor(status)} shadow-lg`
                              : `${getShippingStatusColor(status)} opacity-50 hover:opacity-100`
                          }`}
                        >
                          {getShippingStatusLabel(status)}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-red-900/30 bg-black/60 p-12 text-center backdrop-blur-sm shadow-2xl shadow-red-900/30">
                <p className="text-xl font-semibold text-gray-400">
                  Selecciona una orden para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
