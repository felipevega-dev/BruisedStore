"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShippingInfo, PaymentInfo, Order, Coupon } from "@/types";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard, Truck, Loader2, CheckCircle, Tag, X, AlertCircle } from "lucide-react";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Redirect if not verified
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (!user.emailVerified) {
        router.push("/verify-email");
      }
    }
  }, [user, authLoading, router]);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Ingresa un código de cupón");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      // Buscar cupón en Firestore
      const couponsQuery = query(
        collection(db, "coupons"),
        where("code", "==", couponCode.toUpperCase().trim())
      );
      const snapshot = await getDocs(couponsQuery);

      if (snapshot.empty) {
        setCouponError("Cupón no válido");
        setValidatingCoupon(false);
        return;
      }

      const couponDoc = snapshot.docs[0];
      const couponData = {
        id: couponDoc.id,
        ...couponDoc.data(),
        validFrom: couponDoc.data().validFrom?.toDate() || new Date(),
        validUntil: couponDoc.data().validUntil?.toDate() || new Date(),
        createdAt: couponDoc.data().createdAt?.toDate() || new Date(),
      } as Coupon;

      // Validaciones
      if (!couponData.isActive) {
        setCouponError("Este cupón no está activo");
        setValidatingCoupon(false);
        return;
      }

      const now = new Date();
      if (now < couponData.validFrom) {
        setCouponError("Este cupón aún no es válido");
        setValidatingCoupon(false);
        return;
      }

      if (now > couponData.validUntil) {
        setCouponError("Este cupón ha expirado");
        setValidatingCoupon(false);
        return;
      }

      if (couponData.usageLimit && couponData.usageCount >= couponData.usageLimit) {
        setCouponError("Este cupón ha alcanzado su límite de usos");
        setValidatingCoupon(false);
        return;
      }

      const subtotal = getTotal();
      if (couponData.minPurchase && subtotal < couponData.minPurchase) {
        setCouponError(
          `Compra mínima de ${formatPrice(couponData.minPurchase)} requerida`
        );
        setValidatingCoupon(false);
        return;
      }

      // Cupón válido
      setAppliedCoupon(couponData);
      setCouponError("");
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponError("Error al validar el cupón");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = getTotal();

    if (appliedCoupon.discountType === "fixed") {
      return appliedCoupon.discountValue;
    } else {
      // Porcentaje
      const discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount) {
        return Math.min(discount, appliedCoupon.maxDiscount);
      }
      return discount;
    }
  };

  const calculateTotal = () => {
    const subtotal = getTotal();
    const shippingCost = 5000;
    const discount = calculateDiscount();
    return subtotal + shippingCost - discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      showToast("El carrito está vacío", "error");
      return;
    }

    setLoading(true);

    try {
      const subtotal = getTotal();
      const shippingCost = 5000;
      const discount = calculateDiscount();
      const total = subtotal + shippingCost - discount;
      const newOrderNumber = generateOrderNumber();

      const paymentInfo: PaymentInfo = {
        method: paymentMethod,
        status: "pending",
        transactionId: `TXN-${Date.now()}`,
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
        discount: discount,
        couponCode: appliedCoupon?.code || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Incrementar contador de uso del cupón
      if (appliedCoupon) {
        await updateDoc(doc(db, "coupons", appliedCoupon.id), {
          usageCount: increment(1),
        });
      }

      // Limpiar carrito
      clearCart();

      // Mostrar confirmación
      setOrderNumber(newOrderNumber);
      setOrderCreated(true);

      // En producción, aquí redirigirías a la pasarela de pago
      // router.push(`/payment/${docRef.id}?method=${paymentMethod}`);
    } catch (error) {
      console.error("Error creating order:", error);
      showToast("Error al crear el pedido. Por favor, intenta de nuevo.", "error");
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
      `¡Hola! Acabo de realizar un pedido de las obras de José Vega 🎨\n\n` +
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
    <>
      <ToastContainer />
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
                    <label className="mb-2 block text-base font-bold text-red-100 sm:text-sm">
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
                    <label className="mb-2 block text-base font-bold text-red-100 sm:text-sm">
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
                    <label className="mb-2 block text-base font-bold text-red-100 sm:text-sm">
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
                    <label className="mb-2 block text-base font-bold text-red-100 sm:text-sm">
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
                    <label className="mb-2 block text-base font-bold text-red-100 sm:text-sm">
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
                    <label className="mb-2 block text-base font-bold text-red-100 sm:text-sm">
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
                    <label className="mb-2 block text-base font-bold text-red-100 sm:text-sm">
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
                    <label className="mb-2 block text-base font-bold text-red-100 sm:text-sm">
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

              {/* Sección de Cupón */}
              <div className="border-b border-red-900/30 py-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-red-100">
                  <Tag className="h-4 w-4" />
                  Cupón de Descuento
                </h3>
                
                {appliedCoupon ? (
                  <div className="rounded-lg border-2 border-green-600 bg-green-950/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm font-bold text-green-400">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-300">
                          {appliedCoupon.description}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="rounded-full border-2 border-red-600 bg-red-950/30 p-1 text-red-400 transition-colors hover:bg-red-950/50"
                        aria-label="Quitar cupón"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-green-400">
                      Descuento: - {formatPrice(calculateDiscount())}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="CÓDIGO"
                        className="flex-1 rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 font-mono text-base font-bold uppercase text-red-100 transition-colors placeholder:text-gray-500 focus:border-red-600 focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                        disabled={validatingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="rounded-lg border-2 border-red-900 bg-red-600 px-6 py-3 text-base font-bold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                      >
                        {validatingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Aplicar"
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs font-semibold text-red-400">
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between text-xl font-bold">
                <span className="text-red-100">Total</span>
                <span className="text-red-500">
                  {formatPrice(calculateTotal())}
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
    </>
  );
}
