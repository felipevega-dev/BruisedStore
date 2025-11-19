"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
  FileImage,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";

export default function UploadProofPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const accessToken = searchParams.get("token");
  const { showToast, ToastContainer } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!accessToken) {
          setError("Enlace inválido. Falta token de acceso.");
          setLoading(false);
          return;
        }

        // Import Firebase client SDK dynamically
        const { db } = await import("@/lib/firebase");
        const { doc, getDoc } = await import("firebase/firestore");

        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          setError("Orden no encontrada");
          setLoading(false);
          return;
        }

        const data = orderSnap.data();

        if (!data?.publicAccessToken || data.publicAccessToken !== accessToken) {
          setError("Este enlace de confirmación no es válido o ha expirado");
          setLoading(false);
          return;
        }

        setOrder({
          id: orderSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          paymentInfo: {
            ...data.paymentInfo,
            paidAt: data.paymentInfo?.paidAt?.toDate(),
            transferProofUploadedAt: data.paymentInfo?.transferProofUploadedAt?.toDate(),
          },
        } as Order);

        // Check if payment method is transferencia
        if (data.paymentInfo?.method !== "transferencia") {
          setError("Esta orden no requiere comprobante de transferencia");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Error al cargar la orden");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, accessToken]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Por favor, selecciona una imagen válida", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("El archivo no debe superar 5MB", "error");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !order) return;

    setUploading(true);

    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `payment-proofs/${orderId}/${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update order in Firestore
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        "paymentInfo.transferProofUrl": downloadURL,
        "paymentInfo.transferProofUploadedAt": serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setUploadSuccess(true);
      showToast("Comprobante subido exitosamente", "success");

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/order-confirmation/${orderId}?token=${accessToken}`);
      }, 2000);
    } catch (err) {
      console.error("Error uploading proof:", err);
      showToast("Error al subir el comprobante. Intenta de nuevo.", "error");
    } finally {
      setUploading(false);
    }
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
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/order-confirmation/${orderId}?token=${accessToken}`}
              className="mb-4 inline-flex items-center gap-2 text-moss-600 transition-colors hover:text-moss-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver a la orden
            </Link>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Subir Comprobante de Pago
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Orden #{order.orderNumber}
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            {/* Success State */}
            {uploadSuccess ? (
              <div className="rounded-2xl border border-moss-200 bg-white/95 p-8 text-center shadow-xl shadow-moss-900/10 backdrop-blur">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full border border-moss-200 bg-moss-50 p-4 shadow-inner shadow-moss-200/80">
                    <CheckCircle className="h-16 w-16 text-moss-600" />
                  </div>
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-slate-900">
                  ¡Comprobante Recibido!
                </h2>
                <p className="text-slate-600">
                  Hemos recibido tu comprobante. Te notificaremos cuando confirmemos el pago.
                </p>
                <p className="mt-4 text-sm text-slate-500">
                  Redirigiendo...
                </p>
              </div>
            ) : (
              <>
                {/* Order Summary */}
                <div className="mb-6 rounded-2xl border border-moss-200 bg-white/95 p-6 shadow-xl shadow-moss-900/10 backdrop-blur">
                  <h2 className="mb-4 text-xl font-semibold text-slate-900">
                    Resumen del Pedido
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium text-slate-900">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Envío</span>
                      <span className="font-medium text-slate-900">{formatPrice(order.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between border-t border-moss-200 pt-2 text-lg">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="font-semibold text-moss-600">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="rounded-2xl border border-azure-200 bg-white/95 p-6 shadow-xl shadow-azure-900/10 backdrop-blur">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
                    <Upload className="h-6 w-6 text-azure-600" />
                    Comprobante de Transferencia
                  </h2>

                  {/* Info Box */}
                  <div className="mb-6 rounded-xl border border-azure-200 bg-azure-50 p-4">
                    <p className="text-sm text-azure-900">
                      <strong>Importante:</strong> Sube una foto o captura de pantalla de tu comprobante de transferencia.
                      Asegúrate de que se vea claramente el monto transferido y la fecha.
                    </p>
                  </div>

                  {/* File Upload */}
                  {!selectedFile ? (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-azure-300 bg-azure-50/50 p-12 transition-all hover:border-azure-400 hover:bg-azure-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                      <FileImage className="mb-4 h-16 w-16 text-azure-400" />
                      <p className="mb-2 text-lg font-semibold text-slate-900">
                        Seleccionar archivo
                      </p>
                      <p className="text-sm text-slate-600">
                        PNG, JPG o PDF (máx. 5MB)
                      </p>
                    </label>
                  ) : (
                    <div className="space-y-4">
                      {/* Preview */}
                      <div className="relative overflow-hidden rounded-xl border border-azure-200 bg-azure-50">
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt="Vista previa del comprobante"
                            className="h-auto w-full object-contain"
                          />
                        )}
                        <button
                          onClick={handleRemoveFile}
                          className="absolute right-2 top-2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-lg transition hover:bg-slate-50"
                          disabled={uploading}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* File Info */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      {/* Upload Button */}
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full rounded-xl border-2 border-azure-500 bg-azure-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-azure-900/20 transition hover:bg-azure-600 hover:border-azure-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Subiendo...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Upload className="h-5 w-5" />
                            Subir Comprobante
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
