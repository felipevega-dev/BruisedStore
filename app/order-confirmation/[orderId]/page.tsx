"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  const router = useRouter();
  const orderId = params.orderId as string;
  const { showToast, ToastContainer } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, "orders", orderId));

        if (orderDoc.exists()) {
          const data = orderDoc.data();
          setOrder({
            id: orderDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            paymentInfo: {
              ...data.paymentInfo,
              paidAt: data.paymentInfo?.paidAt?.toDate(),
            },
          } as Order);
        } else {
          setError("Orden no encontrada");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Error al cargar la orden");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="max-w-md border-4 border-black bg-white p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-600" />
          <h1 className="mb-4 text-2xl font-black text-gray-900">
            {error || "Orden no encontrada"}
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-2 font-bold transition-all hover:bg-gray-50"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full border-4 border-green-600 bg-green-50 p-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-black text-gray-900 sm:text-4xl">
              ¡Pedido Recibido!
            </h1>
            <p className="text-lg text-gray-600">
              Orden #{order.orderNumber}
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {/* Left Column: Payment Instructions */}
            <div className="space-y-6 lg:col-span-2">
              {/* Payment Method Info */}
              {order.paymentInfo.method === "transferencia" && (
                <div className="rounded-lg border-4 border-black bg-yellow-50 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-gray-900">
                    <Building2 className="h-6 w-6 text-yellow-600" />
                    Datos para Transferencia
                  </h2>

                  <div className="space-y-4">
                    {/* Bank */}
                    <div className="flex items-start justify-between rounded-lg border-2 border-black bg-white p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Banco</p>
                        <p className="text-lg font-black text-gray-900">{BANK_INFO.banco}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.banco, "Banco")}
                        className="rounded-lg border-2 border-black bg-white p-2 transition-all hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Account Type */}
                    <div className="flex items-start justify-between rounded-lg border-2 border-black bg-white p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Tipo de Cuenta</p>
                        <p className="text-lg font-black text-gray-900">{BANK_INFO.tipoCuenta}</p>
                      </div>
                    </div>

                    {/* Account Number */}
                    <div className="flex items-start justify-between rounded-lg border-2 border-black bg-white p-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-600">Número de Cuenta</p>
                        <p className="break-all font-mono text-lg font-black text-gray-900">
                          {BANK_INFO.numero}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.numero, "Número de cuenta")}
                        className="ml-2 rounded-lg border-2 border-black bg-white p-2 transition-all hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {/* RUT */}
                    <div className="flex items-start justify-between rounded-lg border-2 border-black bg-white p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">RUT</p>
                        <p className="text-lg font-black text-gray-900">{BANK_INFO.rut}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.rut, "RUT")}
                        className="rounded-lg border-2 border-black bg-white p-2 transition-all hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Titular */}
                    <div className="flex items-start justify-between rounded-lg border-2 border-black bg-white p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Titular</p>
                        <p className="text-lg font-black text-gray-900">{BANK_INFO.titular}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.titular, "Titular")}
                        className="rounded-lg border-2 border-black bg-white p-2 transition-all hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Amount */}
                    <div className="rounded-lg border-4 border-red-600 bg-red-50 p-4">
                      <p className="text-sm font-semibold text-red-800">Monto a Transferir</p>
                      <p className="text-3xl font-black text-red-900">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <button
                    onClick={handleWhatsAppContact}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-4 border-green-600 bg-green-600 px-6 py-4 text-lg font-black text-white transition-all hover:bg-green-700 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <MessageCircle className="h-6 w-6" />
                    Confirmar Pago por WhatsApp
                  </button>

                  {/* Instructions */}
                  <div className="mt-6 rounded-lg border-2 border-yellow-600 bg-yellow-100 p-4">
                    <h3 className="mb-2 font-black text-yellow-900">📋 Instrucciones:</h3>
                    <ol className="space-y-2 text-sm text-yellow-900">
                      <li className="flex gap-2">
                        <span className="font-black">1.</span>
                        <span>Realiza la transferencia con los datos de arriba</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-black">2.</span>
                        <span>Guarda el comprobante de transferencia</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-black">3.</span>
                        <span>Haz click en el botón de WhatsApp para confirmar</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-black">4.</span>
                        <span>Te confirmaremos cuando veamos el pago (1-2 días hábiles)</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {order.paymentInfo.method === "efectivo" && (
                <div className="rounded-lg border-4 border-black bg-blue-50 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="mb-4 text-2xl font-black text-gray-900">
                    Pago en Efectivo
                  </h2>
                  <p className="mb-4 text-gray-700">
                    Tu pedido está registrado para pago en efectivo al momento de la entrega.
                  </p>
                  <div className="rounded-lg border-2 border-blue-600 bg-blue-100 p-4">
                    <p className="text-lg font-black text-blue-900">
                      Monto a pagar: {formatPrice(order.total)}
                    </p>
                  </div>

                  <button
                    onClick={handleWhatsAppContact}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-4 border-green-600 bg-green-600 px-6 py-4 text-lg font-black text-white transition-all hover:bg-green-700"
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
              <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="mb-4 text-xl font-black text-gray-900">
                  Resumen del Pedido
                </h2>

                <div className="mb-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-3 border-b-2 border-gray-200 pb-3 last:border-0">
                      {item.painting.images && item.painting.images[0] && (
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 border-black">
                          <Image
                            src={item.painting.images[0]}
                            alt={item.painting.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.painting.title}</p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(item.painting.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Envío</span>
                    <span className="font-bold">{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-lg">
                    <span className="font-black">Total</span>
                    <span className="font-black text-red-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="mb-4 text-xl font-black text-gray-900">
                  Datos de Envío
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-bold text-gray-900">{order.shippingInfo.fullName}</p>
                      <p className="text-gray-600">{order.shippingInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-gray-600" />
                    <p className="text-gray-700">{order.shippingInfo.email}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="font-bold text-gray-900">{order.shippingInfo.address}</p>
                    <p className="text-gray-600">
                      {order.shippingInfo.city}, {order.shippingInfo.region}
                    </p>
                    <p className="text-gray-600">{order.shippingInfo.postalCode}</p>
                  </div>
                </div>
              </div>

              {/* Back to Home */}
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-3 font-bold transition-all hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
