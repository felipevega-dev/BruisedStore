"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Coupon } from "@/types";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Percent,
  DollarSign,
  Calendar,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function AdminCouponsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    const couponsQuery = query(
      collection(db, "coupons"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(couponsQuery, (snapshot) => {
      const couponsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          validFrom: data.validFrom?.toDate() || new Date(),
          validUntil: data.validUntil?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Coupon;
      });
      setCoupons(couponsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setCode("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinPurchase("");
    setMaxDiscount("");
    setValidFrom("");
    setValidUntil("");
    setUsageLimit("");
    setIsActive(true);
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDescription(coupon.description);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setMinPurchase(coupon.minPurchase?.toString() || "");
    setMaxDiscount(coupon.maxDiscount?.toString() || "");
    setValidFrom(coupon.validFrom.toISOString().split("T")[0]);
    setValidUntil(coupon.validUntil.toISOString().split("T")[0]);
    setUsageLimit(coupon.usageLimit?.toString() || "");
    setIsActive(coupon.isActive);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const couponData = {
        code: code.toUpperCase().trim(),
        description: description.trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        isActive,
        usageCount: editingCoupon?.usageCount || 0,
      };

      if (editingCoupon) {
        await updateDoc(doc(db, "coupons", editingCoupon.id), couponData);
      } else {
        await addDoc(collection(db, "coupons"), {
          ...couponData,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert("Error al guardar el cupón");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cupón?")) return;

    try {
      await deleteDoc(doc(db, "coupons", id));
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("Error al eliminar el cupón");
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await updateDoc(doc(db, "coupons", coupon.id), {
        isActive: !coupon.isActive,
      });
    } catch (error) {
      console.error("Error toggling coupon:", error);
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
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const isExpired = (date: Date) => {
    return date < new Date();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-700 transition-colors hover:text-red-600"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Gestión de Cupones
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg border-2 border-black bg-red-600 px-4 py-2 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nuevo Cupón</span>
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-sm font-semibold text-gray-600">Total Cupones</p>
            <p className="text-3xl font-bold text-gray-900">{coupons.length}</p>
          </div>
          <div className="rounded-lg border-4 border-black bg-green-50 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-sm font-semibold text-green-800">Activos</p>
            <p className="text-3xl font-bold text-green-900">
              {coupons.filter((c) => c.isActive && !isExpired(c.validUntil)).length}
            </p>
          </div>
          <div className="rounded-lg border-4 border-black bg-gray-50 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-sm font-semibold text-gray-600">Usos Totales</p>
            <p className="text-3xl font-bold text-gray-900">
              {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              {editingCoupon ? "Editar Cupón" : "Crear Nuevo Cupón"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Código del Cupón *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border-2 border-gray-300 p-3 font-mono font-bold uppercase transition-colors focus:border-black focus:outline-none"
                    placeholder="VERANO2024"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tipo de Descuento *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                    className="w-full rounded-lg border-2 border-gray-300 p-3 font-medium transition-colors focus:border-black focus:outline-none"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Descripción *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border-2 border-gray-300 p-3 font-medium transition-colors focus:border-black focus:outline-none"
                  placeholder="Descripción del cupón..."
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Valor del Descuento *
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 p-3 font-medium transition-colors focus:border-black focus:outline-none"
                    placeholder={discountType === "percentage" ? "10" : "5000"}
                    min="0"
                    step={discountType === "percentage" ? "1" : "100"}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {discountType === "percentage" ? "Ej: 10 para 10%" : "Ej: 5000 para $5.000"}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Compra Mínima
                  </label>
                  <input
                    type="number"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 p-3 font-medium transition-colors focus:border-black focus:outline-none"
                    placeholder="50000"
                    min="0"
                    step="1000"
                  />
                </div>

                {discountType === "percentage" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Descuento Máximo
                    </label>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-300 p-3 font-medium transition-colors focus:border-black focus:outline-none"
                      placeholder="20000"
                      min="0"
                      step="1000"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Válido Desde *
                  </label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 p-3 font-medium transition-colors focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Válido Hasta *
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 p-3 font-medium transition-colors focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Límite de Usos
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 p-3 font-medium transition-colors focus:border-black focus:outline-none"
                    placeholder="100"
                    min="1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Dejar vacío para ilimitado
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 rounded border-2 border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                  Activar cupón inmediatamente
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg border-2 border-black bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingCoupon ? "Actualizar" : "Crear"} Cupón</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border-2 border-black bg-white px-6 py-3 font-bold text-gray-700 transition-all hover:bg-gray-100"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Coupons List */}
        <div className="space-y-4">
          {coupons.length === 0 ? (
            <div className="rounded-lg border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Tag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="text-lg font-bold text-gray-900">
                No hay cupones creados
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Crea tu primer cupón de descuento
              </p>
            </div>
          ) : (
            coupons.map((coupon) => {
              const expired = isExpired(coupon.validUntil);
              const limitReached = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;

              return (
                <div
                  key={coupon.id}
                  className={`rounded-lg border-4 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
                    !coupon.isActive || expired || limitReached
                      ? "border-gray-300 bg-gray-50"
                      : "border-black bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="rounded-lg border-2 border-red-600 bg-red-50 px-4 py-2 font-mono text-xl font-bold text-red-600">
                          {coupon.code}
                        </span>
                        {coupon.isActive && !expired && !limitReached && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                            ACTIVO
                          </span>
                        )}
                        {expired && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                            EXPIRADO
                          </span>
                        )}
                        {limitReached && (
                          <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-800">
                            LÍMITE ALCANZADO
                          </span>
                        )}
                      </div>
                      <p className="mb-3 text-gray-700">{coupon.description}</p>

                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          {coupon.discountType === "percentage" ? (
                            <>
                              <Percent className="h-4 w-4 text-red-600" />
                              <span className="font-semibold">
                                {coupon.discountValue}% de descuento
                              </span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-red-600" />
                              <span className="font-semibold">
                                {formatPrice(coupon.discountValue)} de descuento
                              </span>
                            </>
                          )}
                        </div>

                        {coupon.minPurchase && (
                          <div className="text-gray-600">
                            Compra mínima: {formatPrice(coupon.minPurchase)}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                          </span>
                        </div>

                        <div className="text-gray-600">
                          Usos: {coupon.usageCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (ilimitado)"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:flex-col">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 font-bold transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                          coupon.isActive
                            ? "border-yellow-600 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                            : "border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                        title={coupon.isActive ? "Desactivar" : "Activar"}
                      >
                        {coupon.isActive ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-blue-50 px-4 py-2 font-bold text-blue-700 transition-all hover:bg-blue-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="flex items-center gap-2 rounded-lg border-2 border-red-600 bg-red-50 px-4 py-2 font-bold text-red-700 transition-all hover:bg-red-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
