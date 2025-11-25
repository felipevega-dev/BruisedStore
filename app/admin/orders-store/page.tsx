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
import { Loader2, ArrowLeft, Trash2, Eye, Package, Bell, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { formatPrice } from "@/lib/utils";
import { AdminLogHelpers, logAdminAction } from "@/lib/adminLogs";

export default function AdminStoreOrdersPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingShipping, setUpdatingShipping] = useState(false);
  const [viewedOrderIds, setViewedOrderIds] = useState<Set<string>>(new Set());

  // Cargar órdenes vistas del localStorage
  useEffect(() => {
    const stored = localStorage.getItem("viewedOrderIds");
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
      localStorage.setItem("viewedOrderIds", JSON.stringify([...newSet]));
      // Disparar evento para que el Header se actualice
      window.dispatchEvent(new Event("ordersViewed"));
      return newSet;
    });
  };

  // Verificar si una orden es nueva (no vista)
  const isOrderNew = (order: Order): boolean => {
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
      // NO marcar todas como vistas aquí, solo actualizar el timestamp de entrada
      localStorage.setItem("adminLastViewedOrdersPage", Date.now().toString());

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
              transferProofUploadedAt: data.paymentInfo?.transferProofUploadedAt?.toDate(),
            },
          } as Order;
        });
        setOrders(ordersData);

        // Contar pendientes NO VISTAS
        const newOrders = ordersData.filter((o) => isOrderNew(o));
        setPendingCount(newOrders.length);
      });

      return () => unsubscribe();
    }
  }, [user, isAdmin, viewedOrderIds]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    setUpdatingStatus(true);
    try {
      const order = orders.find(o => o.id === orderId);
      const oldStatus = order?.status;
      
      console.log("📦 Cambiando estado de orden:", { orderId, oldStatus, newStatus, order: order?.orderNumber });

      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      
      // Registrar log de actividad
      if (user?.email && user?.uid && order) {
        console.log("📝 Creando log de cambio de estado...");
        await AdminLogHelpers.logOrderStatusChange(
          user.email,
          user.uid,
          orderId,
          order.orderNumber,
          oldStatus || 'unknown',
          newStatus
        );
        console.log("✅ Log de cambio de estado creado");
      } else {
        console.warn("⚠️ No se pudo crear log de estado:", { 
          hasEmail: !!user?.email, 
          hasUid: !!user?.uid, 
          hasOrder: !!order 
        });
      }
      
      // Actualizar el estado local inmediatamente
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      showToast("Estado del pedido actualizado exitosamente", "success");
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      showToast("Error al actualizar el estado", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleShippingStatusChange = async (
    orderId: string,
    newStatus: ShippingStatus
  ) => {
    setUpdatingShipping(true);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        shippingStatus: newStatus,
        updatedAt: new Date(),
      });
      
      // Actualizar el estado local inmediatamente
      setSelectedOrder(prev => prev ? { ...prev, shippingStatus: newStatus } : null);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, shippingStatus: newStatus } : order
      ));
      
      showToast("Estado de envío actualizado exitosamente", "success");
    } catch (error) {
      console.error("Error updating shipping status:", error);
      showToast("Error al actualizar el estado de envío", "error");
    } finally {
      setUpdatingShipping(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("¿Estás seguro de eliminar este pedido?")) {
      return;
    }

    try {
      const order = orders.find(o => o.id === orderId);
      console.log("🗑️ Eliminando orden:", { orderId, order, user: user?.email });
      
      await deleteDoc(doc(db, "orders", orderId));
      
      // Registrar log de actividad
      if (user?.email && user?.uid && order) {
        console.log("📝 Creando log de eliminación...");
        await logAdminAction(
          'order_deleted',
          user.email,
          user.uid,
          {
            orderId,
            orderNumber: order.orderNumber,
            description: `Pedido #${order.orderNumber} eliminado`,
          }
        );
        console.log("✅ Log creado exitosamente");
      } else {
        console.warn("⚠️ No se pudo crear log:", { 
          hasEmail: !!user?.email, 
          hasUid: !!user?.uid, 
          hasOrder: !!order 
        });
      }
      
      setSelectedOrder(null);
      showToast("Pedido eliminado exitosamente", "success");
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      showToast("Error al eliminar el pedido", "error");
    }
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
      pending: "bg-terra-900/30 border-terra-900 text-terra-300",
      confirmed: "bg-blue-900/30 border-blue-900 text-blue-300",
      processing: "bg-purple-900/30 border-purple-900 text-purple-300",
      shipped: "bg-indigo-900/30 border-indigo-900 text-indigo-300",
      delivered: "bg-green-900/30 border-green-900 text-green-300",
      cancelled: "bg-terra-900/30 border-terra-900 text-terra-300",
    };
    return colors[status];
  };

  const getShippingStatusColor = (status: ShippingStatus) => {
    const colors = {
      pending: "bg-gray-900/30 border-gray-700 text-gray-300",
      processing: "bg-blue-900/30 border-blue-900 text-blue-300",
      shipped: "bg-purple-900/30 border-purple-900 text-purple-300",
      delivered: "bg-green-900/30 border-green-900 text-green-300",
      cancelled: "bg-terra-900/30 border-terra-900 text-terra-300",
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

  const handleWhatsAppContact = (order: Order) => {
    const phoneNumber = order.shippingInfo.phone.replace(/\s/g, "").replace(/^56/, "");
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+56${phoneNumber}`;

    const message = encodeURIComponent(
      `Hola ${order.shippingInfo.fullName}! 👋\n\n` +
      `Te escribo sobre tu pedido #${order.orderNumber}\n\n` +
      `Detalles:\n` +
      `• ${order.items.length} producto(s)\n` +
      `• Total: ${formatPrice(order.total)}\n` +
      `• Estado: ${getStatusLabel(order.status)}\n\n` +
      `¿En qué puedo ayudarte?`
    );

    window.open(`https://wa.me/${formattedPhone.replace("+", "")}?text=${message}`, "_blank");
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 via-gray-50 to-slate-50">
        <div className="rounded-2xl border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-moss-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-linear-to-br from-slate-100 via-gray-50 to-slate-50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 rounded-2xl border-4 border-black bg-linear-to-r from-green-500 to-green-600 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-white transition-colors hover:text-green-100"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] sm:text-4xl">
                  Órdenes de Compra
                </h1>
                <p className="text-green-100 font-semibold">Pinturas de la galería</p>
              </div>
            </div>
          </div>

        {pendingCount > 0 && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border-4 border-black bg-orange-400 px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Bell className="h-5 w-5 text-black" />
            <span className="font-black text-black">
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
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
                      // Marcar como vista cuando se hace clic y actualizar contador
                      if (order.id && isNew) {
                        markOrderAsViewed(order.id);
                        setPendingCount((prev) => Math.max(0, prev - 1));
                      }
                    }}
                    className={`relative cursor-pointer rounded-lg border-2 bg-black/60 p-4 backdrop-blur-sm transition-all hover:shadow-xl ${
                      selectedOrder?.id === order.id
                        ? "border-moss-600 shadow-2xl shadow-terra-900/40"
                        : "border-terra-900/30 hover:border-moss-600 hover:shadow-terra-900/20"
                    }`}
                  >
                    {/* Badge NUEVO */}
                    {isNew && (
                      <div className="absolute -right-2 -top-2 z-10 animate-pulse">
                        <span className="inline-flex items-center gap-1 rounded-full border-2 border-terra-400 bg-terra-500 px-2 py-1 text-xs font-black text-black shadow-lg">
                          <Bell className="h-3 w-3" />
                          NUEVO
                        </span>
                      </div>
                    )}
                    
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-terra-100">
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
                      <p className="font-bold text-terra-500">
                        {formatPrice(order.total)}
                      </p>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}

              {orders.length === 0 && (
                <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-12 text-center backdrop-blur-sm shadow-2xl shadow-terra-900/30">
                  <Package className="mx-auto mb-4 h-16 w-16 text-moss-600" />
                  <p className="text-xl font-semibold text-terra-100">
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
              <div className="rounded-lg border-2 border-terra-900 bg-black/60 p-6 shadow-2xl shadow-terra-900/30 backdrop-blur-sm">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-terra-100">
                      Orden {selectedOrder.orderNumber}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedOrder.id!)}
                    className="text-terra-400 transition-colors hover:text-terra-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Status Update - MOVIDO ARRIBA */}
                <div className="mb-6 rounded-lg border-2 border-terra-900/50 bg-moss-950/20 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-terra-300">
                    <Package className="h-5 w-5" />
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
                    <p className="mt-2 text-sm text-terra-300">
                      Actualizando estado...
                    </p>
                  )}
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-terra-100">Productos</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.painting.id}
                        className="flex gap-4 rounded-lg border-2 border-terra-900/30 bg-moss-900/20 p-3"
                      >
                        <div className="relative h-20 w-20 overflow-hidden rounded-md border-2 border-terra-900/30">
                          <Image
                            src={item.painting.imageUrl}
                            alt={item.painting.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-terra-100">
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
                            <span className="font-bold text-terra-400">
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
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-terra-100">
                      Información del Cliente
                    </h3>
                    <button
                      onClick={() => handleWhatsAppContact(selectedOrder)}
                      className="flex items-center gap-2 rounded-lg border-2 border-moss-500 bg-moss-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-moss-900/20 transition hover:bg-moss-600 hover:border-moss-600"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contactar
                    </button>
                  </div>
                  <div className="space-y-2 rounded-lg border-2 border-terra-900/30 bg-moss-900/20 p-4">
                    <div className="flex justify-between border-b border-terra-900/20 pb-2">
                      <span className="text-gray-400">Nombre:</span>
                      <span className="font-semibold text-terra-100">
                        {selectedOrder.shippingInfo.fullName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-terra-900/20 pb-2">
                      <span className="text-gray-400">Email:</span>
                      <span className="font-semibold text-terra-100">
                        {selectedOrder.shippingInfo.email}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-terra-900/20 pb-2">
                      <span className="text-gray-400">Teléfono:</span>
                      <span className="font-semibold text-terra-100">
                        {selectedOrder.shippingInfo.phone}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-terra-900/20 pb-2 sm:flex-row sm:justify-between">
                      <span className="text-gray-400">Dirección:</span>
                      <span className="font-semibold text-terra-100 sm:text-right sm:max-w-[60%]">
                        {selectedOrder.shippingInfo.address}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-terra-900/20 pb-2">
                      <span className="text-gray-400">Ciudad:</span>
                      <span className="font-semibold text-terra-100">
                        {selectedOrder.shippingInfo.city}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-gray-400">Región:</span>
                      <span className="font-semibold text-terra-100">
                        {selectedOrder.shippingInfo.region}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-terra-100">
                    Información de Pago
                  </h3>
                  <div className="space-y-2 rounded-lg border-2 border-terra-900/30 bg-moss-900/20 p-4">
                    <div className="flex justify-between border-b border-terra-900/20 pb-2">
                      <span className="text-gray-400">Método:</span>
                      <span className="font-semibold text-terra-100">
                        {getPaymentMethodLabel(selectedOrder.paymentInfo.method)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-terra-900/20 pb-2">
                      <span className="text-gray-400">Estado:</span>
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold ${
                          selectedOrder.paymentInfo.status === "paid"
                            ? "bg-green-900/30 text-green-300"
                            : selectedOrder.paymentInfo.status === "failed"
                            ? "bg-terra-900/30 text-terra-300"
                            : "bg-terra-900/30 text-terra-300"
                        }`}
                      >
                        {selectedOrder.paymentInfo.status === "paid"
                          ? "Pagado"
                          : selectedOrder.paymentInfo.status === "failed"
                          ? "Fallido"
                          : "Pendiente"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-terra-900/20 pb-2">
                      <span className="text-gray-400">ID Transacción:</span>
                      <span className="font-mono text-sm text-terra-100">
                        {selectedOrder.paymentInfo.transactionId || "N/A"}
                      </span>
                    </div>

                    {/* Transfer Proof */}
                    {selectedOrder.paymentInfo.method === "transferencia" && (
                      <div className="border-t border-terra-900/20 pt-3">
                        <span className="mb-2 block text-sm font-semibold text-gray-400">
                          Comprobante de Transferencia:
                        </span>
                        {selectedOrder.paymentInfo.transferProofUrl ? (
                          <div className="space-y-2">
                            <a
                              href={selectedOrder.paymentInfo.transferProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block overflow-hidden rounded-lg border-2 border-azure-500/50 transition hover:border-azure-500"
                            >
                              <div className="relative h-48 w-full">
                                <Image
                                  src={selectedOrder.paymentInfo.transferProofUrl}
                                  alt="Comprobante de transferencia"
                                  fill
                                  className="object-contain bg-black/20"
                                  sizes="400px"
                                />
                              </div>
                            </a>
                            {selectedOrder.paymentInfo.transferProofUploadedAt && (
                              <p className="text-xs text-gray-400">
                                Subido el {formatDate(selectedOrder.paymentInfo.transferProofUploadedAt)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No se ha subido comprobante aún
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-terra-100">
                    Resumen del Pedido
                  </h3>
                  <div className="space-y-2 rounded-lg border-2 border-terra-900/30 bg-moss-900/20 p-4">
                    <div className="flex justify-between border-b border-terra-900/20 pb-2">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="font-semibold text-terra-100">
                        {formatPrice(selectedOrder.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-terra-900/20 pb-2">
                      <span className="text-gray-400">Envío:</span>
                      <span className="font-semibold text-terra-100">
                        {formatPrice(selectedOrder.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-terra-900/30 pt-3">
                      <span className="text-lg font-medium text-gray-300">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-terra-500">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.shippingInfo.notes && (
                  <div className="mb-6">
                    <h3 className="mb-3 font-bold text-terra-100">
                      Notas del Cliente
                    </h3>
                    <div className="rounded-lg border-2 border-terra-900/30 bg-moss-900/20 p-4">
                      <p className="text-gray-300">
                        {selectedOrder.shippingInfo.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Shipping Status Update */}
                <div>
                  <h3 className="mb-3 font-bold text-terra-100">
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
                          disabled={updatingShipping}
                          className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-all ${
                            selectedOrder.shippingStatus === status
                              ? `${getShippingStatusColor(status)} shadow-lg ring-2 ring-white/50`
                              : `${getShippingStatusColor(status)} opacity-50 hover:opacity-100 hover:scale-105`
                          } disabled:cursor-not-allowed disabled:opacity-30`}
                        >
                          {getShippingStatusLabel(status)}
                        </button>
                      )
                    )}
                  </div>
                  {updatingShipping && (
                    <p className="mt-2 text-sm text-terra-300">
                      Actualizando estado de envío...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-terra-900/30 bg-black/60 p-12 text-center backdrop-blur-sm shadow-2xl shadow-terra-900/30">
                <p className="text-xl font-semibold text-gray-400">
                  Selecciona una orden para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
