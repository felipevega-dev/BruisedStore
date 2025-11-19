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
      pending: { bg: "bg-terra-100", text: "text-terra-800", label: "Pendiente" },
      confirmed: { bg: "bg-blue-100", text: "text-blue-800", label: "Confirmado" },
      processing: { bg: "bg-purple-100", text: "text-purple-800", label: "Procesando" },
      shipped: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Enviado" },
      delivered: { bg: "bg-green-100", text: "text-green-800", label: "Entregado" },
      cancelled: { bg: "bg-moss-100", text: "text-moss-800", label: "Cancelado" },
      "in-progress": { bg: "bg-blue-100", text: "text-blue-800", label: "En Progreso" },
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Completado" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${config.bg} ${config.text}`}
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
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-700 transition-colors hover:text-moss-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Mi Perfil
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Información del Usuario */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Card de perfil */}
              <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-moss-500">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {user.displayName || "Usuario"}
                    </h2>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                {/* Botón Editar Perfil */}
                <Link
                  href="/profile/edit"
                  className="mb-4 flex w-full items-center justify-center gap-2 border-4 border-black bg-white px-4 py-3 font-bold text-black transition-all hover:bg-gray-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </Link>

                <div className="space-y-4 border-t-2 border-gray-200 pt-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-5 w-5 text-moss-600" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-moss-600" />
                    <span className="text-sm">
                      Miembro desde{" "}
                      {user.metadata.creationTime
                        ? formatDate(new Date(user.metadata.creationTime))
                        : "Fecha desconocida"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Estadísticas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-moss-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Total de pedidos
                      </span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      {totalOrders}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-moss-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Total gastado
                      </span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(totalSpent)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Pedidos */}
          <div className="lg:col-span-2">
            <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {/* Tabs */}
              <div className="flex border-b-4 border-black">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex-1 px-6 py-4 text-center font-bold transition-colors ${
                    activeTab === "orders"
                      ? "bg-moss-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    <span>Compras ({orders.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("custom")}
                  className={`flex-1 px-6 py-4 text-center font-bold transition-colors ${
                    activeTab === "custom"
                      ? "bg-moss-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Package className="h-5 w-5" />
                    <span>Obras a Pedido ({customOrders.length})</span>
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
                          className="mt-6 inline-block rounded-lg border-2 border-black bg-moss-500 px-6 py-3 font-bold text-white transition-all hover:bg-moss-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          Ver Galería
                        </Link>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border-2 border-gray-300 bg-gray-50 p-6 transition-all hover:border-black"
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
                                className="flex items-center justify-center gap-2 rounded-lg border-2 border-moss-500 bg-moss-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-moss-600"
                              >
                                <ShoppingBag className="h-4 w-4" />
                                Ver Detalle del Pedido
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
                          className="mt-6 inline-block rounded-lg border-2 border-black bg-moss-500 px-6 py-3 font-bold text-white transition-all hover:bg-moss-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          Solicitar Obra
                        </Link>
                      </div>
                    ) : (
                      customOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border-2 border-gray-300 bg-gray-50 p-6 transition-all hover:border-black"
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
                          <div className="mt-4 flex items-center justify-between border-t-2 border-gray-300 pt-4">
                            <span className="font-bold text-gray-700">
                              Total
                            </span>
                            <span className="text-xl font-bold text-moss-600">
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
