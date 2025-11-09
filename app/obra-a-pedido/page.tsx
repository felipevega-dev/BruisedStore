"use client";

import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  CustomOrder,
  CUSTOM_ORDER_SIZES,
  BASE_CUSTOM_ORDER_PRICE,
  Orientation,
} from "@/types";
import Image from "next/image";
import { Upload, Loader2, CheckCircle2, Paintbrush } from "lucide-react";

export default function CustomOrderPage() {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    selectedSizeIndex: 0,
    orientation: "vertical" as Orientation,
    notes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSize = CUSTOM_ORDER_SIZES[formData.selectedSizeIndex];
  const totalPrice = BASE_CUSTOM_ORDER_PRICE * selectedSize.priceMultiplier;

  // Calcular dimensiones del canvas según orientación
  const canvasWidth =
    formData.orientation === "horizontal"
      ? selectedSize.height
      : selectedSize.width;
  const canvasHeight =
    formData.orientation === "horizontal"
      ? selectedSize.width
      : selectedSize.height;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setImagePreview(imageDataUrl);

        // Detectar orientación automáticamente
        const img = document.createElement('img');
        img.onload = () => {
          const isHorizontal = img.width > img.height;
          setFormData(prev => ({
            ...prev,
            orientation: isHorizontal ? 'horizontal' : 'vertical'
          }));
        };
        img.src = imageDataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Por favor sube una imagen de referencia");
      return;
    }

    setLoading(true);

    try {
      const imageRef = ref(
        storage,
        `custom-orders/${Date.now()}_${imageFile.name}`
      );
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      const orderData: Omit<CustomOrder, "id"> = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        referenceImageUrl: imageUrl,
        selectedSize: selectedSize,
        orientation: formData.orientation,
        totalPrice: totalPrice,
        status: "pending",
        createdAt: new Date(),
        notes: formData.notes || undefined,
      };

      await addDoc(collection(db, "customOrders"), {
        ...orderData,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setFormData({
        customerName: "",
        email: "",
        phone: "",
        selectedSizeIndex: 0,
        orientation: "vertical",
        notes: "",
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating custom order:", error);
      alert("Hubo un error al enviar tu pedido. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black px-4">
        <div className="w-full max-w-md rounded-lg border-2 border-red-900 bg-black/80 p-8 text-center shadow-2xl shadow-red-900/50 backdrop-blur-sm">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-red-600" />
          <h2 className="mb-2 text-2xl font-bold text-red-100">
            ¡Pedido Recibido!
          </h2>
          <p className="mb-6 text-gray-300">
            Tu solicitud de obra personalizada ha sido recibida. Nos
            contactaremos contigo pronto para comenzar tu obra de arte.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="rounded-md border-2 border-red-900 bg-red-900/20 px-6 py-3 font-medium text-red-100 transition-all hover:bg-red-900 hover:shadow-lg hover:shadow-red-900/50"
          >
            Crear Otro Pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Paintbrush className="h-10 w-10 text-red-600" />
              <h1 className="text-4xl font-bold text-red-100 sm:text-5xl">
                Obra a Pedido
              </h1>
            </div>
            <p className="text-lg text-gray-300">
              Convierte tus visiones en realidad. Cada obra es única, cada
              trazo cuenta una historia.
            </p>
            <div className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-red-900 via-red-600 to-red-900"></div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Preview Section */}
            <div className="order-2 lg:order-1">
              <div className="sticky top-24 rounded-lg border-2 border-red-900 bg-black/60 p-6 shadow-2xl shadow-red-900/30 backdrop-blur-sm">
                <h2 className="mb-6 text-2xl font-semibold text-red-100">
                  Vista Previa del Lienzo
                </h2>

                {/* Canvas Preview */}
                <div className="mb-6 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-8">
                  <div
                    className="relative overflow-hidden border-4 border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl shadow-black/80 transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(canvasWidth * 4, 320)}px`,
                      height: `${Math.min(canvasHeight * 4, 320)}px`,
                      maxWidth: "100%",
                      aspectRatio: `${canvasWidth}/${canvasHeight}`,
                    }}
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain"
                        sizes="400px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                        <div className="text-center">
                          <Upload className="mx-auto mb-2 h-12 w-12 text-gray-500" />
                          <p className="text-sm text-gray-400">
                            Tu imagen aparecerá aquí
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3 rounded-lg border border-red-900/30 bg-red-950/20 p-4">
                  <div className="flex items-center justify-between border-b border-red-900/20 pb-2">
                    <span className="text-sm font-medium text-gray-300">
                      Tamaño:
                    </span>
                    <span className="font-bold text-red-100">
                      {selectedSize.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-red-900/20 pb-2">
                    <span className="text-sm font-medium text-gray-300">
                      Dimensiones:
                    </span>
                    <span className="font-semibold text-red-100">
                      {canvasWidth} x {canvasHeight} cm
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-red-900/20 pb-2">
                    <span className="text-sm font-medium text-gray-300">
                      Orientación:
                    </span>
                    <span className="font-semibold capitalize text-red-100">
                      {formData.orientation === "horizontal"
                        ? "Horizontal"
                        : "Vertical"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-medium text-gray-300">
                      Precio Total:
                    </span>
                    <span className="text-3xl font-bold text-red-500">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="order-1 lg:order-2">
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-lg border-2 border-red-900 bg-black/60 p-6 shadow-2xl shadow-red-900/30 backdrop-blur-sm"
              >
                {/* Image Upload */}
                <div>
                  <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-red-100">
                    Imagen de Referencia *
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-red-900 bg-gradient-to-br from-red-950/30 to-gray-900/30 p-8 transition-all hover:border-red-700 hover:from-red-950/50 hover:to-gray-900/50"
                  >
                    <Upload className="mx-auto mb-3 h-12 w-12 text-red-600 transition-transform group-hover:scale-110" />
                    <p className="mb-2 text-center font-medium text-red-100">
                      {imageFile
                        ? imageFile.name
                        : "Click para subir tu imagen"}
                    </p>
                    <p className="text-center text-xs text-gray-400">
                      PNG, JPG hasta 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                </div>

                {/* Orientation */}
                <div>
                  <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-red-100">
                    Orientación del Lienzo *
                    {imagePreview && (
                      <span className="ml-2 text-xs font-normal normal-case text-gray-400">
                        (Detectada automáticamente)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, orientation: "vertical" })
                      }
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        formData.orientation === "vertical"
                          ? "border-red-600 bg-red-950/50 shadow-lg shadow-red-900/50"
                          : "border-red-900/30 bg-gray-900/30 hover:border-red-800"
                      }`}
                    >
                      <div
                        className={`h-16 w-12 rounded border-2 ${
                          formData.orientation === "vertical"
                            ? "border-red-500 bg-red-900/30"
                            : "border-gray-600 bg-gray-800"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-semibold ${
                          formData.orientation === "vertical"
                            ? "text-red-100"
                            : "text-gray-400"
                        }`}
                      >
                        Vertical
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, orientation: "horizontal" })
                      }
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        formData.orientation === "horizontal"
                          ? "border-red-600 bg-red-950/50 shadow-lg shadow-red-900/50"
                          : "border-red-900/30 bg-gray-900/30 hover:border-red-800"
                      }`}
                    >
                      <div
                        className={`h-12 w-16 rounded border-2 ${
                          formData.orientation === "horizontal"
                            ? "border-red-500 bg-red-900/30"
                            : "border-gray-600 bg-gray-800"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-semibold ${
                          formData.orientation === "horizontal"
                            ? "text-red-100"
                            : "text-gray-400"
                        }`}
                      >
                        Horizontal
                      </span>
                    </button>
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-red-100">
                    Tamaño del Lienzo *
                  </label>
                  <select
                    value={formData.selectedSizeIndex}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selectedSizeIndex: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 font-medium text-red-100 transition-all focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    required
                  >
                    {CUSTOM_ORDER_SIZES.map((size, index) => (
                      <option key={index} value={index}>
                        {size.name} ({size.width}x{size.height} cm) -{" "}
                        {formatPrice(BASE_CUSTOM_ORDER_PRICE * size.priceMultiplier)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-red-100">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-red-100">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-red-100">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    placeholder="+56 9 1234 5678"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-3 block text-sm font-bold uppercase tracking-wide text-red-100">
                    Detalles Adicionales (Opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    placeholder="Cuéntanos tu visión: colores, estilo, emociones que deseas plasmar..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-4 text-lg font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-2xl hover:shadow-red-900/50 disabled:from-gray-800 disabled:to-gray-700 disabled:text-gray-400"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Enviando tu visión...
                    </>
                  ) : (
                    <>
                      <Paintbrush className="h-6 w-6" />
                      Enviar Pedido
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
