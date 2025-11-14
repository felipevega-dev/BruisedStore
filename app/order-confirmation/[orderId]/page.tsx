"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Copy,
  MessageCircle,
  Building2,
  CreditCard,
  User,
  Mail,
  Loader2,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

// Datos bancarios para transferencia
const BANK_INFO = {
  banco: "Banco Estado",
  tipoCuenta: "Cuenta Vista",
  numero: "12345678901234567890",
  rut: "12.345.678-9",
  titular: "José Vega Rodríguez",
  email: "contacto@josevega.art",
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const { showToast, ToastContainer } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = searchParams.get("token");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!accessToken) {
          setError("Enlace inválido. Falta token de acceso.");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/orders/${orderId}?token=${accessToken}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Orden no encontrada");
          } else if (response.status === 401) {
            setError("Este enlace de confirmación no es válido o ha expirado");
          } else {
            setError("Error al cargar la orden");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();

        setOrder({
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
          paymentInfo: {
            ...data.paymentInfo,
            paidAt: data.paymentInfo?.paidAt ? new Date(data.paymentInfo.paidAt) : undefined,
          },
        } as Order);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Error al cargar la orden");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, accessToken]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado al portapapeles`, "success");
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const message = encodeURIComponent(
      `Hola! Acabo de realizar un pedido.\n\n` +
      `Orden: ${order?.orderNumber}\n` +
      `Total: ${formatPrice(order?.total || 0)}\n\n` +
      `Ya realicé la transferencia a la cuenta ${BANK_INFO.banco}. ¿Me confirman cuando vean el pago?`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
  <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-moss-50 via-white to-slate-50">
        <div className="rounded-2xl border border-moss-200 bg-white/90 p-8 shadow-xl shadow-moss-900/10 backdrop-blur">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-moss-600" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
  <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-moss-50 via-white to-slate-50 p-4">
        <div className="max-w-md rounded-2xl border border-moss-200 bg-white/95 p-8 text-center shadow-xl shadow-moss-900/10 backdrop-blur">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-moss-600" />
          <h1 className="mb-4 text-2xl font-semibold text-slate-900">
            {error || "Orden no encontrada"}
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-moss-200 bg-moss-50 px-4 py-2 font-medium text-slate-900 transition hover:border-moss-300 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
  <div className="min-h-screen bg-linear-to-br from-moss-50 via-white to-slate-50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full border border-moss-200 bg-moss-50 p-4 shadow-inner shadow-moss-200/80">
                <CheckCircle className="h-16 w-16 text-moss-600" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
              ¡Pedido Recibido!
            </h1>
            <p className="text-lg text-slate-600">
              Orden #{order.orderNumber}
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {/* Left Column: Payment Instructions */}
            <div className="space-y-6 lg:col-span-2">
              {/* Payment Method Info */}
              {order.paymentInfo.method === "transferencia" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 shadow-lg shadow-amber-900/10">
                  <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                    <Building2 className="h-6 w-6 text-amber-600" />
                    Datos para Transferencia
                  </h2>

                  <div className="space-y-4">
                    {/* Bank */}
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/40 bg-white/90 p-4 shadow-sm shadow-amber-900/5">
                      <div>
                        <p className="text-sm font-medium text-amber-800/90">Banco</p>
                        <p className="text-lg font-semibold text-slate-900">{BANK_INFO.banco}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.banco, "Banco")}
                        className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-800 transition hover:border-amber-300 hover:bg-amber-50"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Account Type */}
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/40 bg-white/90 p-4 shadow-sm shadow-amber-900/5">
                      <div>
                        <p className="text-sm font-medium text-amber-800/90">Tipo de Cuenta</p>
                        <p className="text-lg font-semibold text-slate-900">{BANK_INFO.tipoCuenta}</p>
                      </div>
                    </div>

                    {/* Account Number */}
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/40 bg-white/90 p-4 shadow-sm shadow-amber-900/5">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800/90">Número de Cuenta</p>
                        <p className="break-all font-mono text-lg font-semibold text-slate-900">
                          {BANK_INFO.numero}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.numero, "Número de cuenta")}
                        className="ml-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-800 transition hover:border-amber-300 hover:bg-amber-50"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {/* RUT */}
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/40 bg-white/90 p-4 shadow-sm shadow-amber-900/5">
                      <div>
                        <p className="text-sm font-medium text-amber-800/90">RUT</p>
                        <p className="text-lg font-semibold text-slate-900">{BANK_INFO.rut}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.rut, "RUT")}
                        className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-800 transition hover:border-amber-300 hover:bg-amber-50"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Titular */}
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/40 bg-white/90 p-4 shadow-sm shadow-amber-900/5">
                      <div>
                        <p className="text-sm font-medium text-amber-800/90">Titular</p>
                        <p className="text-lg font-semibold text-slate-900">{BANK_INFO.titular}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.titular, "Titular")}
                        className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-800 transition hover:border-amber-300 hover:bg-amber-50"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Amount */}
                    <div className="rounded-xl border border-moss-200 bg-linear-to-br from-moss-50 via-white to-moss-100 p-4 shadow-inner shadow-moss-200/80">
                      <p className="text-sm font-medium text-moss-700">Monto a Transferir</p>
                      <p className="text-3xl font-semibold text-moss-900">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <button
                    onClick={handleWhatsAppContact}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-moss-500 to-moss-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-moss-900/20 transition hover:shadow-xl"
                  >
                    <MessageCircle className="h-6 w-6" />
                    Confirmar Pago por WhatsApp
                  </button>

                  {/* Instructions */}
                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-100/80 p-4">
                    <h3 className="mb-2 font-semibold text-amber-900">📋 Instrucciones:</h3>
                    <ol className="space-y-2 text-sm text-amber-900">
                      <li className="flex gap-2">
                        <span className="font-semibold">1.</span>
                        <span>Realiza la transferencia con los datos de arriba</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">2.</span>
                        <span>Guarda el comprobante de transferencia</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">3.</span>
                        <span>Haz click en el botón de WhatsApp para confirmar</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">4.</span>
                        <span>Te confirmaremos cuando veamos el pago (1-2 días hábiles)</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {order.paymentInfo.method === "efectivo" && (
                <div className="rounded-2xl border border-moss-200 bg-moss-50/70 p-6 shadow-lg shadow-moss-900/10">
                  <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                    Pago en Efectivo
                  </h2>
                  <p className="mb-4 text-slate-600">
                    Tu pedido está registrado para pago en efectivo al momento de la entrega.
                  </p>
                  <div className="rounded-xl border border-moss-300 bg-moss-100/60 p-4">
                    <p className="text-lg font-semibold text-moss-900">
                      Monto a pagar: {formatPrice(order.total)}
                    </p>
                  </div>

                  <button
                    onClick={handleWhatsAppContact}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-moss-500 to-moss-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-moss-900/20 transition hover:shadow-xl"
                  >
                    <MessageCircle className="h-6 w-6" />
                    Coordinar Entrega por WhatsApp
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="space-y-6">
              {/* Order Items */}
              <div className="rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-xl shadow-moss-900/10 backdrop-blur">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">
                  Resumen del Pedido
                </h2>

                <div className="mb-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-3 border-b border-slate-200/70 pb-3 last:border-0">
                      {item.painting.images && item.painting.images[0] && (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-moss-100">
                          <Image
                            src={item.painting.images[0]}
                            alt={item.painting.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.painting.title}</p>
                        <p className="text-sm text-slate-600">
                          Cantidad: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatPrice(item.painting.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-slate-200/70 pt-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Envío</span>
                    <span className="font-medium text-slate-900">{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between border-t border-moss-200 pt-2 text-lg">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-semibold text-moss-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-xl shadow-moss-900/10 backdrop-blur">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">
                  Datos de Envío
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">{order.shippingInfo.fullName}</p>
                      <p className="text-slate-600">{order.shippingInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-slate-500" />
                    <p className="text-slate-600">{order.shippingInfo.email}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <p className="font-medium text-slate-900">{order.shippingInfo.address}</p>
                    <p className="text-slate-600">
                      {order.shippingInfo.city}, {order.shippingInfo.region}
                    </p>
                    <p className="text-slate-600">{order.shippingInfo.postalCode}</p>
                  </div>
                </div>
              </div>

              {/* Back to Home */}
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl border border-moss-200 bg-moss-50 px-4 py-3 font-medium text-slate-900 transition hover:border-moss-300 hover:bg-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
