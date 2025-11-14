"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShippingInfo, PaymentInfo, Order, Coupon } from "@/types";
import { collection, serverTimestamp, query, where, getDocs, doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard, Truck, Loader2, Tag, X, AlertCircle } from "lucide-react";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (user?.email) {
      setShippingInfo((prev) =>
        prev.email ? prev : { ...prev, email: user.email ?? "" }
      );
    }
  }, [user?.email]);

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
      const orderRef = doc(collection(db, "orders"));
      const publicAccessToken = crypto.randomUUID();

      const paymentInfo: PaymentInfo = {
        method: paymentMethod,
        status: "pending",
        transactionId: `TXN-${Date.now()}`,
      };

      await runTransaction(db, async (transaction) => {
        const normalizeDate = (value: unknown) => {
          if (!value) return null;
          if (value instanceof Date) return value;
          if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as any).toDate === "function") {
            return (value as { toDate: () => Date }).toDate();
          }
          return null;
        };

        // Validar stock de cada obra
        for (const item of items) {
          const paintingRef = doc(db, "paintings", item.painting.id);
          const paintingSnap = await transaction.get(paintingRef);

          if (!paintingSnap.exists()) {
            throw new Error("Una de las obras ya no está disponible");
          }

          const paintingData = paintingSnap.data();
          const currentStock = paintingData.stock;

          if (typeof currentStock === "number") {
            const remaining = currentStock - item.quantity;
            if (remaining < 0) {
              throw new Error(`No hay stock suficiente para "${item.painting.title}"`);
            }
            transaction.update(paintingRef, { stock: remaining });
          }
        }

        if (appliedCoupon) {
          const couponRef = doc(db, "coupons", appliedCoupon.id);
          const couponSnap = await transaction.get(couponRef);

          if (!couponSnap.exists()) {
            throw new Error("El cupón aplicado ya no es válido");
          }

          const couponData = couponSnap.data() as Coupon;
          const now = new Date();
          const validFrom = normalizeDate(couponData.validFrom);
          const validUntil = normalizeDate(couponData.validUntil);

          if (!couponData.isActive || (validFrom && now < validFrom) || (validUntil && now > validUntil)) {
            throw new Error("El cupón aplicado ya no es válido");
          }

          if (couponData.usageLimit && couponData.usageCount >= couponData.usageLimit) {
            throw new Error("El cupón aplicado ha alcanzado su límite de usos");
          }

          transaction.update(couponRef, {
            usageCount: (couponData.usageCount || 0) + 1,
          });
        }

        transaction.set(orderRef, {
          orderNumber: newOrderNumber,
          items,
          subtotal,
          shippingCost,
          total,
          discount,
          couponCode: appliedCoupon?.code || null,
          shippingInfo,
          paymentInfo,
          status: "pending",
          shippingStatus: "pending",
          publicAccessToken,
          userId: user?.uid || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      clearCart();
      router.push(`/order-confirmation/${orderRef.id}?token=${publicAccessToken}`);
    } catch (error) {
      console.error("Error creating order:", error);
      const message = error instanceof Error ? error.message : "Error al crear el pedido. Por favor, intenta de nuevo.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Redirigir si el carrito está vacío
  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 px-4">
        <div className="text-center">
          <div className="rounded-2xl border-2 border-moss-600 bg-white/10 p-12 backdrop-blur shadow-xl shadow-moss-950/40">
            <Truck className="mx-auto mb-4 h-24 w-24 text-moss-300" />
            <h2 className="mb-2 text-3xl font-bold text-white">
              El carrito está vacío
            </h2>
            <p className="mb-6 text-slate-200">
              Agrega algunas obras antes de continuar con tu compra.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-moss-200 bg-moss-500/90 px-6 py-3 font-semibold text-moss-950 transition-all hover:bg-moss-300 hover:text-slate-900"
            >
              Ver Obras
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de checkout
  return (
    <>
      <ToastContainer />
  <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-moss-950 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-4">
            <Link
              href="/carrito"
              className="text-moss-200 transition-colors hover:text-moss-400"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Finalizar Compra
            </h1>
          </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información de Envío */}
              <div className="rounded-2xl border border-moss-200/70 bg-white/90 p-6 shadow-xl shadow-moss-900/15 backdrop-blur">
                <div className="mb-4 flex items-center gap-3">
                  <Truck className="h-6 w-6 text-moss-500" />
                  <h2 className="text-2xl font-bold text-slate-900">
                    Información de Envío
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-base font-semibold text-slate-700 sm:text-sm">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-moss-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-moss-400 focus:outline-none focus:ring-2 focus:ring-moss-200/60"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700 sm:text-sm">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-moss-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-moss-400 focus:outline-none focus:ring-2 focus:ring-moss-200/60"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700 sm:text-sm">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-moss-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-moss-400 focus:outline-none focus:ring-2 focus:ring-moss-200/60"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-base font-semibold text-slate-700 sm:text-sm">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-moss-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-moss-400 focus:outline-none focus:ring-2 focus:ring-moss-200/60"
                      placeholder="Calle Example 123, Depto 456"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700 sm:text-sm">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-moss-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-moss-400 focus:outline-none focus:ring-2 focus:ring-moss-200/60"
                      placeholder="Santiago"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700 sm:text-sm">
                      Región *
                    </label>
                    <select
                      name="region"
                      value={shippingInfo.region}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-moss-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all focus:border-moss-400 focus:outline-none focus:ring-2 focus:ring-moss-200/60"
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
                    <label className="mb-2 block text-base font-semibold text-slate-700 sm:text-sm">
                      Código Postal (Opcional)
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-moss-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-moss-400 focus:outline-none focus:ring-2 focus:ring-moss-200/60"
                      placeholder="8320000"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-base font-semibold text-slate-700 sm:text-sm">
                      Notas del Pedido (Opcional)
                    </label>
                    <textarea
                      name="notes"
                      value={shippingInfo.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl border border-moss-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-moss-400 focus:outline-none focus:ring-2 focus:ring-moss-200/60"
                      placeholder="Instrucciones especiales de entrega, preferencias, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="rounded-2xl border border-moss-200/70 bg-white/90 p-6 shadow-xl shadow-moss-900/15 backdrop-blur">
                <div className="mb-4 flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-moss-500" />
                  <h2 className="text-2xl font-bold text-slate-900">
                    Método de Pago
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-moss-200 bg-moss-50/80 p-4 transition-all hover:border-moss-400 hover:bg-moss-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="webpay"
                      checked={paymentMethod === "webpay"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentInfo["method"])
                      }
                      className="h-5 w-5 text-moss-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">WebPay Plus</p>
                      <p className="text-sm text-slate-600">
                        Tarjetas de crédito y débito
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-moss-200 bg-moss-50/80 p-4 transition-all hover:border-moss-400 hover:bg-moss-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mercadopago"
                      checked={paymentMethod === "mercadopago"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentInfo["method"])
                      }
                      className="h-5 w-5 text-moss-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">Mercado Pago</p>
                      <p className="text-sm text-slate-600">
                        Múltiples métodos de pago
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-moss-200 bg-moss-50/80 p-4 transition-all hover:border-moss-400 hover:bg-moss-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transferencia"
                      checked={paymentMethod === "transferencia"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentInfo["method"])
                      }
                      className="h-5 w-5 text-moss-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">Transferencia Bancaria</p>
                      <p className="text-sm text-slate-600">
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
                className="w-full rounded-lg border-2 border-moss-500 bg-moss-500 px-6 py-4 text-lg font-bold text-slate-950 transition-all hover:bg-moss-400 hover:border-moss-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="sticky top-24 rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-xl shadow-moss-900/10 backdrop-blur">
              <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                Resumen del Pedido
              </h2>

              <div className="mb-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.painting.id}
                    className="flex gap-3 border-b border-slate-200/70 pb-3 last:border-0"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 border-moss-200/60">
                      <Image
                        src={item.painting.imageUrl}
                        alt={item.painting.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.painting.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-moss-700">
                        {formatPrice(item.painting.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-b border-slate-200/70 pb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span className="font-semibold text-slate-900">{formatPrice(5000)}</span>
                </div>
              </div>

              {/* Sección de Cupón */}
              <div className="border-b border-slate-200/70 py-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Tag className="h-4 w-4" />
                  Cupón de Descuento
                </h3>
                
                {appliedCoupon ? (
                  <div className="rounded-xl border border-moss-200 bg-moss-50/80 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm font-semibold text-moss-700">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-moss-600">
                          {appliedCoupon.description}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="rounded-full border border-moss-200 bg-moss-100/70 p-1 text-moss-600 transition hover:border-moss-300 hover:bg-white"
                        aria-label="Quitar cupón"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-moss-700">
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
                        className="flex-1 rounded-lg border border-moss-200 bg-white px-4 py-3 font-mono text-base font-semibold uppercase text-slate-900 transition focus:border-moss-300 focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                        disabled={validatingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="rounded-lg bg-linear-to-r from-moss-500 to-moss-500 px-6 py-3 text-base font-semibold text-white shadow-sm shadow-moss-900/10 transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-2 sm:text-sm"
                      >
                        {validatingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Aplicar"
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs font-medium text-terra-500">
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between text-xl font-semibold">
                <span className="text-slate-900">Total</span>
                <span className="text-moss-700">
                  {formatPrice(calculateTotal())}
                </span>
              </div>

              <p className="mt-4 text-center text-xs text-slate-500">
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
