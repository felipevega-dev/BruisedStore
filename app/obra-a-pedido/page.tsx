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
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md border-4 border-black bg-white p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
          <h2 className="mb-2 text-2xl font-black text-black">
            ¡Pedido Recibido!
          </h2>
          <p className="mb-6 text-gray-700 font-semibold">
            Tu solicitud de obra personalizada ha sido recibida. Nos
            contactaremos contigo pronto para comenzar tu obra de arte.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="border-4 border-black bg-red-600 px-6 py-3 font-black text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
          >
            Crear Otro Pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Paintbrush className="h-10 w-10 text-red-600" />
              <h1 className="text-4xl font-black text-black sm:text-5xl">
                🎨 Obra a Pedido
              </h1>
            </div>
            <p className="text-lg text-gray-700 font-semibold">
              Convierte tus visiones en realidad. Cada obra es única, cada
              trazo cuenta una historia.
            </p>
            <div className="mx-auto mt-4 h-2 w-24 bg-red-600"></div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Preview Section */}
            <div className="order-2 lg:order-1">
              <div className="sticky top-24 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="mb-6 text-2xl font-black text-black border-b-4 border-black pb-3">
                  Vista Previa del Lienzo
                </h2>

                {/* Canvas Preview - Dinámico según tamaño seleccionado */}
                <div className="mb-6 flex items-center justify-center bg-gray-50 p-6 border-4 border-black">
                  <div
                    className="relative overflow-hidden border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    style={{
                      width: `${Math.min(canvasWidth * 6, 500)}px`,
                      height: `${Math.min(canvasHeight * 6, 500)}px`,
                      maxWidth: "90vw",
                      maxHeight: "80vh",
                    }}
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 90vw, 500px"
                        priority
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <Upload className="mx-auto mb-3 h-16 w-16 text-gray-400" />
                          <p className="text-lg font-bold text-gray-600">
                            Tu imagen aparecerá aquí
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Sube una imagen de referencia
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-0 border-4 border-black bg-yellow-50">
                  <div className="flex items-center justify-between border-b-4 border-black p-4 bg-white">
                    <span className="font-bold text-black">
                      Tamaño:
                    </span>
                    <span className="font-black text-red-600 text-lg">
                      {selectedSize.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b-4 border-black p-4">
                    <span className="font-bold text-black">
                      Dimensiones:
                    </span>
                    <span className="font-black text-black">
                      {canvasWidth} x {canvasHeight} cm
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b-4 border-black p-4 bg-white">
                    <span className="font-bold text-black">
                      Orientación:
                    </span>
                    <span className="font-black capitalize text-black">
                      {formData.orientation === "horizontal"
                        ? "Horizontal"
                        : "Vertical"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-red-600">
                    <span className="text-xl font-black text-white">
                      Precio Total:
                    </span>
                    <span className="text-4xl font-black text-white">
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
                className="space-y-6 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Image Upload */}
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
                    Imagen de Referencia *
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer overflow-hidden border-4 border-dashed border-black bg-gray-50 p-8 transition-all hover:bg-yellow-50 hover:border-red-600"
                  >
                    <Upload className="mx-auto mb-3 h-12 w-12 text-red-600 transition-transform group-hover:scale-110" />
                    <p className="mb-2 text-center font-bold text-black">
                      {imageFile
                        ? imageFile.name
                        : "drag.jpg"}
                    </p>
                    <p className="text-center text-xs font-semibold text-gray-600">
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
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
                    Orientación del Lienzo *
                    {imagePreview && (
                      <span className="ml-2 text-xs font-semibold normal-case text-gray-600">
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
                      className={`flex flex-col items-center gap-3 border-4 p-6 transition-all ${
                        formData.orientation === "vertical"
                          ? "border-red-600 bg-red-50 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
                          : "border-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`h-20 w-14 border-4 ${
                          formData.orientation === "vertical"
                            ? "border-red-600 bg-red-100"
                            : "border-black bg-gray-100"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-black ${
                          formData.orientation === "vertical"
                            ? "text-red-600"
                            : "text-black"
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
                      className={`flex flex-col items-center gap-3 border-4 p-6 transition-all ${
                        formData.orientation === "horizontal"
                          ? "border-red-600 bg-red-50 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
                          : "border-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`h-14 w-20 border-4 ${
                          formData.orientation === "horizontal"
                            ? "border-red-600 bg-red-100"
                            : "border-black bg-gray-100"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-black ${
                          formData.orientation === "horizontal"
                            ? "text-red-600"
                            : "text-black"
                        }`}
                      >
                        Horizontal
                      </span>
                    </button>
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
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
                    className="w-full border-4 border-black bg-white px-4 py-3 font-bold text-black transition-all focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/20"
                    required
                  >
                    {CUSTOM_ORDER_SIZES.map((size, index) => (
                      <option key={index} value={index} className="font-bold">
                        {size.name} ({size.width}x{size.height} cm) - {formatPrice(BASE_CUSTOM_ORDER_PRICE * size.priceMultiplier)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="w-full border-4 border-black bg-white px-4 py-3 text-black font-semibold transition-all placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/20"
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full border-4 border-black bg-white px-4 py-3 text-black font-semibold transition-all placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/20"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full border-4 border-black bg-white px-4 py-3 text-black font-semibold transition-all placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/20"
                    placeholder="+56 9 1234 5678"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
                    Detalles Adicionales (Opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                    className="w-full border-4 border-black bg-white px-4 py-3 text-black font-semibold transition-all placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/20"
                    placeholder="Cuéntanos tu visión: colores, estilo, emociones que deseas plasmar..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 border-4 border-black bg-red-600 px-6 py-4 text-lg font-black text-white transition-all hover:bg-red-700 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 disabled:bg-gray-400 disabled:text-gray-700"
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
