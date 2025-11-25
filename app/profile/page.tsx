"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, CustomOrder } from "@/types";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Mail,
  ShoppingBag,
  Package,
  Loader2,
  ArrowLeft,
  Calendar,
  DollarSign,
  Edit,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "custom">("orders");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;

    try {
      // Obtener órdenes normales (por email)
      const ordersQuery = query(
        collection(db, "orders"),
        where("shippingInfo.email", "==", user.email),
        orderBy("createdAt", "desc")
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order;
      });
      setOrders(ordersData);

      // Obtener pedidos personalizados (por userId O por email)
      const customOrdersByUserId = query(
        collection(db, "customOrders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const customOrdersByEmail = query(
        collection(db, "customOrders"),
        where("email", "==", user.email),
        orderBy("createdAt", "desc")
      );

      // Ejecutar ambas queries
      const [userIdSnapshot, emailSnapshot] = await Promise.all([
        getDocs(customOrdersByUserId),
        getDocs(customOrdersByEmail),
      ]);

      // Combinar resultados y eliminar duplicados
      const allCustomOrders = new Map<string, CustomOrder>();
      
      [...userIdSnapshot.docs, ...emailSnapshot.docs].forEach((doc) => {
        if (!allCustomOrders.has(doc.id)) {
          const data = doc.data();
          allCustomOrders.set(doc.id, {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as CustomOrder);
        }
      });

      setCustomOrders(Array.from(allCustomOrders.values()));
    } catch (error) {
      console.error("Error fetching orders:", error);
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-yellow-100 border-2 border-yellow-600", text: "text-yellow-800", label: "Pendiente" },
      confirmed: { bg: "bg-blue-100 border-2 border-blue-600", text: "text-blue-800", label: "Confirmado" },
      processing: { bg: "bg-primary-100 border-2 border-primary-600", text: "text-primary-800", label: "Procesando" },
      shipped: { bg: "bg-indigo-100 border-2 border-indigo-600", text: "text-indigo-800", label: "Enviado" },
      delivered: { bg: "bg-green-100 border-2 border-green-600", text: "text-green-800", label: "Entregado" },
      cancelled: { bg: "bg-slate-100 border-2 border-slate-600", text: "text-slate-800", label: "Cancelado" },
      "in-progress": { bg: "bg-blue-100 border-2 border-blue-600", text: "text-blue-800", label: "En Progreso" },
      completed: { bg: "bg-green-100 border-2 border-green-600", text: "text-green-800", label: "Completado" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wide ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-moss-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalOrders = orders.length + customOrders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-slate-50 to-blue-50 py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <Link
            href="/"
            className="rounded-lg border-2 border-black bg-white p-2 text-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-50 hover:text-primary-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 sm:text-4xl">
            Mi Perfil
          </h1>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Información del Usuario */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Card de perfil */}
              <div className="rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:p-6">
                <div className="mb-4 flex items-center gap-3 sm:mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-black bg-linear-to-br from-primary-500 to-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:h-16 sm:w-16">
                    <User className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="truncate text-lg font-black text-slate-900 sm:text-xl">
                      {user.displayName || "Usuario"}
                    </h2>
                    <p className="truncate text-xs text-slate-600 sm:text-sm">{user.email}</p>
                  </div>
                </div>

                {/* Botón Editar Perfil */}
                <Link
                  href="/profile/edit"
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-4 border-black bg-primary-500 px-4 py-2.5 font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </Link>

                <div className="space-y-3 border-t-4 border-black pt-4">
                  <div className="flex items-center gap-2 rounded border-2 border-black bg-white p-2">
                    <Mail className="h-4 w-4 text-primary-600" />
                    <span className="truncate text-xs font-bold text-slate-700 sm:text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded border-2 border-black bg-blue-50 p-2">
                    <Calendar className="h-4 w-4 text-primary-600" />
                    <span className="text-xs font-bold text-slate-700 sm:text-sm">
                      Miembro desde{" "}
                      {user.metadata.creationTime
                        ? formatDate(new Date(user.metadata.creationTime))
                        : "Fecha desconocida"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="rounded-lg border-4 border-black bg-linear-to-br from-slate-50 to-blue-50 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:p-6">
                <h3 className="mb-3 border-b-4 border-black pb-2 text-base font-black text-slate-900 sm:mb-4 sm:text-lg">
                  Estadísticas
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border-4 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary-600" />
                      <span className="text-xs font-bold text-slate-700 sm:text-sm">
                        Total de pedidos
                      </span>
                    </div>
                    <span className="text-lg font-black text-primary-600 sm:text-xl">
                      {totalOrders}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border-4 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary-600" />
                      <span className="text-xs font-bold text-slate-700 sm:text-sm">
                        Total gastado
                      </span>
                    </div>
                    <span className="text-base font-black text-primary-600 sm:text-lg">
                      {formatPrice(totalSpent)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Pedidos */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {/* Tabs */}
              <div className="grid grid-cols-2 border-b-4 border-black">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`px-3 py-3 text-center font-black transition-all sm:px-6 sm:py-4 ${
                    activeTab === "orders"
                      ? "bg-primary-500 text-white shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-base">Compras ({orders.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("custom")}
                  className={`px-3 py-3 text-center font-black transition-all sm:px-6 sm:py-4 ${
                    activeTab === "custom"
                      ? "bg-primary-500 text-white shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-base">Obras ({customOrders.length})</span>
                  </div>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === "orders" ? (
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="py-12 text-center">
                        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <p className="text-lg font-bold text-gray-900">
                          No tienes compras aún
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                          Explora nuestra galería y encuentra tu obra favorita
                        </p>
                        <Link
                          href="/"
                          className="mt-6 inline-block rounded-lg border-4 border-black bg-primary-500 px-6 py-3 font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                        >
                          Ver Galería
                        </Link>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 sm:p-5"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-500">
                                Orden {order.orderNumber}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>

                          {/* Items */}
                          <div className="mb-4 space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.painting.id}
                                className="flex gap-4"
                              >
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 border-gray-300">
                                  <Image
                                    src={item.painting.imageUrl}
                                    alt={item.painting.title}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900">
                                    {item.painting.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Cantidad: {item.quantity} x{" "}
                                    {formatPrice(item.painting.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total and Actions */}
                          <div className="border-t-2 border-gray-300 pt-4">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="font-bold text-gray-700">
                                Total
                              </span>
                              <span className="text-xl font-bold text-moss-600">
                                {formatPrice(order.total)}
                              </span>
                            </div>
                            {order.publicAccessToken && (
                              <Link
                                href={`/order-confirmation/${order.id}?token=${order.publicAccessToken}`}
                                className="flex items-center justify-center gap-2 rounded-lg border-4 border-black bg-primary-500 px-4 py-2.5 text-sm font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                              >
                                <ShoppingBag className="h-4 w-4" />
                                Ver Detalle
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customOrders.length === 0 ? (
                      <div className="py-12 text-center">
                        <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <p className="text-lg font-bold text-gray-900">
                          No tienes obras a pedido
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                          Solicita una obra personalizada única para ti
                        </p>
                        <Link
                          href="/obra-a-pedido"
                          className="mt-6 inline-block rounded-lg border-4 border-black bg-primary-500 px-6 py-3 font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                        >
                          Solicitar Obra
                        </Link>
                      </div>
                    ) : (
                      customOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 sm:p-5"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-500">
                                Obra a Pedido
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>

                          {/* Image */}
                          <div className="mb-4">
                            <div className="relative mx-auto h-40 w-64 overflow-hidden rounded-lg border-2 border-gray-300">
                              <Image
                                src={order.referenceImageUrl}
                                alt="Referencia"
                                fill
                                className="object-cover"
                                sizes="256px"
                              />
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-700">
                              <span className="font-semibold">Tamaño:</span>{" "}
                              {order.selectedSize.name}
                            </p>
                            {order.notes && (
                              <p className="text-gray-700">
                                <span className="font-semibold">Notas:</span>{" "}
                                {order.notes}
                              </p>
                            )}
                          </div>

                          {/* Total */}
                          <div className="mt-4 flex items-center justify-between rounded-lg border-4 border-black bg-primary-500 px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <span className="font-black text-white">
                              Total
                            </span>
                            <span className="text-xl font-black text-white">
                              {formatPrice(order.totalPrice)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
