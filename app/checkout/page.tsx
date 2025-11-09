"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { ShippingInfo, PaymentInfo, Order } from "@/types";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard, Truck, Loader2, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Shipping form state
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentInfo["method"]>("webpay");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD-${year}${month}${day}-${random}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    setLoading(true);

    try {
      const subtotal = getTotal();
      const shippingCost = 5000; // $5.000 envío fijo (puedes calcularlo dinámicamente)
      const total = subtotal + shippingCost;
      const newOrderNumber = generateOrderNumber();

      const paymentInfo: PaymentInfo = {
        method: paymentMethod,
        status: "pending", // En producción, esto se actualizará después del pago
        transactionId: `TXN-${Date.now()}`, // Simulado, en producción viene de la pasarela
      };

      const order: Omit<Order, "id"> = {
        orderNumber: newOrderNumber,
        items: items,
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        shippingInfo: shippingInfo,
        paymentInfo: paymentInfo,
        status: "pending",
        shippingStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Guardar en Firestore
      const docRef = await addDoc(collection(db, "orders"), {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("Order created with ID:", docRef.id);

      // Limpiar carrito
      clearCart();

      // Mostrar confirmación
      setOrderNumber(newOrderNumber);
      setOrderCreated(true);

      // En producción, aquí redirigirías a la pasarela de pago
      // router.push(`/payment/${docRef.id}?method=${paymentMethod}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error al crear el pedido. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Redirigir si el carrito está vacío
  if (items.length === 0 && !orderCreated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black px-4">
        <div className="text-center">
          <div className="rounded-lg border-2 border-red-900 bg-black/60 p-12 backdrop-blur-sm shadow-2xl shadow-red-900/30">
            <Truck className="mx-auto mb-4 h-24 w-24 text-red-600" />
            <h2 className="mb-2 text-3xl font-bold text-red-100">
              El carrito está vacío
            </h2>
            <p className="mb-6 text-gray-400">
              Agrega algunas obras antes de proceder al checkout
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-3 font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50"
            >
              Ver Obras
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Página de confirmación
  if (orderCreated) {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56912345678";
    const whatsappMessage = encodeURIComponent(
      `¡Hola! Acabo de realizar un pedido en Bruised Art 🎨\n\n` +
      `📋 *Número de Orden:* ${orderNumber}\n` +
      `💰 *Total:* ${formatPrice(getTotal() + 5000)}\n` +
      `📦 *Cantidad de items:* ${items.length}\n` +
      `📧 *Email:* ${shippingInfo.email}\n` +
      `📍 *Dirección:* ${shippingInfo.address}, ${shippingInfo.city}\n\n` +
      `Me gustaría coordinar el pago y envío. ¡Gracias!`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          <div className="rounded-lg border-2 border-green-900 bg-black/60 p-12 backdrop-blur-sm shadow-2xl shadow-green-900/30">
            <CheckCircle className="mx-auto mb-6 h-24 w-24 text-green-500" />
            <h1 className="mb-4 text-4xl font-bold text-green-100">
              ¡Pedido Confirmado!
            </h1>
            <p className="mb-6 text-xl text-gray-300">
              Tu número de orden es:{" "}
              <span className="font-bold text-red-400">{orderNumber}</span>
            </p>
            <div className="mx-auto mb-8 max-w-md rounded-lg border-2 border-red-900/30 bg-red-950/20 p-6 text-left">
              <h3 className="mb-3 font-bold text-red-100">Próximos pasos:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">1.</span>
                  <span>
                    Recibirás un email de confirmación en{" "}
                    <span className="font-semibold text-red-300">
                      {shippingInfo.email}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">2.</span>
                  <span>Contáctanos por WhatsApp para coordinar el pago</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">3.</span>
                  <span>
                    Tu pedido será procesado en las próximas 24-48 horas
                  </span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-green-600 bg-green-600 px-6 py-3 font-bold text-white transition-all hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/50"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contactar por WhatsApp
              </a>
              <Link
                href="/"
                className="rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-3 font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50"
              >
                Volver a la Tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de checkout
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/carrito"
            className="text-gray-300 transition-colors hover:text-red-400"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-red-100 sm:text-4xl">
            Finalizar Compra
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información de Envío */}
              <div className="rounded-lg border-2 border-red-900 bg-black/60 p-6 shadow-2xl shadow-red-900/30 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                  <Truck className="h-6 w-6 text-red-500" />
                  <h2 className="text-2xl font-bold text-red-100">
                    Información de Envío
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-red-100">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-red-100">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-red-100">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-red-100">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                      placeholder="Calle Example 123, Depto 456"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-red-100">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                      placeholder="Santiago"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-red-100">
                      Región *
                    </label>
                    <select
                      name="region"
                      value={shippingInfo.region}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    >
                      <option value="">Seleccionar región</option>
                      <option value="metropolitana">Región Metropolitana</option>
                      <option value="valparaiso">Región de Valparaíso</option>
                      <option value="biobio">Región del Biobío</option>
                      <option value="araucania">Región de La Araucanía</option>
                      <option value="los-lagos">Región de Los Lagos</option>
                      <option value="otras">Otra región</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-red-100">
                      Código Postal (Opcional)
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                      placeholder="8320000"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-red-100">
                      Notas del Pedido (Opcional)
                    </label>
                    <textarea
                      name="notes"
                      value={shippingInfo.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                      placeholder="Instrucciones especiales de entrega, preferencias, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="rounded-lg border-2 border-red-900 bg-black/60 p-6 shadow-2xl shadow-red-900/30 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-red-500" />
                  <h2 className="text-2xl font-bold text-red-100">
                    Método de Pago
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-red-900/30 bg-red-950/20 p-4 transition-all hover:border-red-700 hover:bg-red-950/30">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="webpay"
                      checked={paymentMethod === "webpay"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentInfo["method"])
                      }
                      className="h-5 w-5 text-red-600"
                    />
                    <div>
                      <p className="font-bold text-red-100">WebPay Plus</p>
                      <p className="text-sm text-gray-400">
                        Tarjetas de crédito y débito
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-red-900/30 bg-red-950/20 p-4 transition-all hover:border-red-700 hover:bg-red-950/30">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mercadopago"
                      checked={paymentMethod === "mercadopago"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentInfo["method"])
                      }
                      className="h-5 w-5 text-red-600"
                    />
                    <div>
                      <p className="font-bold text-red-100">Mercado Pago</p>
                      <p className="text-sm text-gray-400">
                        Múltiples métodos de pago
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-red-900/30 bg-red-950/20 p-4 transition-all hover:border-red-700 hover:bg-red-950/30">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transferencia"
                      checked={paymentMethod === "transferencia"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentInfo["method"])
                      }
                      className="h-5 w-5 text-red-600"
                    />
                    <div>
                      <p className="font-bold text-red-100">Transferencia Bancaria</p>
                      <p className="text-sm text-gray-400">
                        Te enviaremos los datos por email
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-4 text-lg font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  "Confirmar Pedido"
                )}
              </button>
            </form>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border-2 border-red-900 bg-black/60 p-6 shadow-2xl shadow-red-900/30 backdrop-blur-sm">
              <h2 className="mb-4 text-2xl font-bold text-red-100">
                Resumen del Pedido
              </h2>

              <div className="mb-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.painting.id}
                    className="flex gap-3 border-b border-red-900/30 pb-3"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 border-red-900/30">
                      <Image
                        src={item.painting.imageUrl}
                        alt={item.painting.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-red-100">
                        {item.painting.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-red-400">
                        {formatPrice(item.painting.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-b border-red-900/30 pb-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Envío</span>
                  <span className="font-semibold">{formatPrice(5000)}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between text-xl font-bold">
                <span className="text-red-100">Total</span>
                <span className="text-red-500">
                  {formatPrice(getTotal() + 5000)}
                </span>
              </div>

              <p className="mt-4 text-center text-xs text-gray-400">
                Al confirmar el pedido, recibirás un email con las instrucciones
                de pago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
