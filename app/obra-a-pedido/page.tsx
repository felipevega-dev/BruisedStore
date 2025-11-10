"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  CustomOrder,
  CUSTOM_ORDER_SIZES,
  BASE_CUSTOM_ORDER_PRICE,
  Orientation,
} from "@/types";
import Image from "next/image";
import { Upload, Loader2, CheckCircle2, Paintbrush, Crop } from "lucide-react";
import ImageCropper from "@/components/ImageCropper";
import { useToast } from "@/hooks/useToast";

export default function CustomOrderPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    selectedSizeIndex: 0,
    notes: "",
  });

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast, ToastContainer } = useToast();

  const selectedSize = CUSTOM_ORDER_SIZES[formData.selectedSizeIndex];
  const totalPrice = BASE_CUSTOM_ORDER_PRICE * selectedSize.priceMultiplier;

  // Orientación automática según dimensiones del tamaño
  // width < height = VERTICAL, width > height = HORIZONTAL, width = height = CUADRADO
  const orientation: Orientation =
    selectedSize.width < selectedSize.height
      ? "vertical"
      : selectedSize.width > selectedSize.height
        ? "horizontal"
        : "cuadrado"; // medidas iguales = cuadrado

  // Dimensiones del canvas (ancho x alto) directamente del size
  const canvasWidth = selectedSize.width;
  const canvasHeight = selectedSize.height;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Create File from Blob
    const croppedFile = new File([croppedBlob], "cropped-image.jpg", {
      type: "image/jpeg",
    });
    setImageFile(croppedFile);

    // Create preview URL
    const previewUrl = URL.createObjectURL(croppedBlob);
    setImagePreview(previewUrl);
    setShowCropper(false);
    setTempImage(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImage(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSizeChangeInCropper = (newSizeIndex: number) => {
    setFormData({ ...formData, selectedSizeIndex: newSizeIndex });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  // Función para cambiar orientación y reasignar tamaño más cercano
  const handleOrientationChange = (newOrientation: Orientation) => {
    const currentArea = selectedSize.width * selectedSize.height;

    // Si ya es la orientación deseada, no hacer nada
    if (orientation === newOrientation) return;

    // Encontrar el tamaño más cercano en área con la orientación deseada
    let closestIndex = 0;
    let closestDiff = Infinity;

    CUSTOM_ORDER_SIZES.forEach((size, index) => {
      const sizeOrientation: Orientation =
        size.width < size.height ? "vertical"
        : size.width > size.height ? "horizontal"
        : "cuadrado";

      if (sizeOrientation === newOrientation) {
        const area = size.width * size.height;
        const diff = Math.abs(area - currentArea);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = index;
        }
      }
    });

    setFormData({ ...formData, selectedSizeIndex: closestIndex });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.customerName.trim()) {
      newErrors.customerName = "El nombre es requerido";
    } else if (formData.customerName.trim().length < 3) {
      newErrors.customerName = "El nombre debe tener al menos 3 caracteres";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validate phone
    const phoneRegex = /^[+]?[0-9\s-]{8,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Teléfono inválido (mínimo 8 dígitos)";
    }

    // Validate image
    if (!imageFile) {
      newErrors.image = "La imagen de referencia es requerida";
      showToast("Por favor sube una imagen de referencia", "error");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Por favor completa todos los campos correctamente", "error");
      return;
    }

    setLoading(true);

    try {
      const imageRef = ref(
        storage,
        `custom-orders/${Date.now()}_${imageFile!.name}`
      );
      await uploadBytes(imageRef, imageFile!);
      const imageUrl = await getDownloadURL(imageRef);

      const orderData: Omit<CustomOrder, "id"> = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        referenceImageUrl: imageUrl,
        selectedSize: selectedSize,
        orientation: orientation,
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
      showToast("¡Pedido enviado exitosamente!", "success");
      setFormData({
        customerName: "",
        email: "",
        phone: "",
        selectedSizeIndex: 0,
        notes: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
    } catch (error) {
      console.error("Error creating custom order:", error);
      showToast("Hubo un error al enviar tu pedido. Por favor intenta nuevamente.", "error");
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
    <div className="min-h-screen bg-white py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 text-center sm:mb-8">
            <div className="mb-3 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <Paintbrush className="h-8 w-8 text-red-600 sm:h-10 sm:w-10" />
              <h1 className="text-3xl font-black text-black sm:text-4xl lg:text-5xl">
                🎨 Obra a Pedido
              </h1>
            </div>
            <p className="px-4 text-base text-gray-700 font-semibold sm:text-lg">
              Convierte tus visiones en realidad. Cada obra es única, cada
              trazo cuenta una historia.
            </p>
            <div className="mx-auto mt-3 h-1 w-20 bg-red-600 sm:mt-4 sm:h-2 sm:w-24"></div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Preview Section */}
            <div className="order-2 lg:order-1">
              <div className="lg:sticky lg:top-24 border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="mb-4 text-xl font-black text-black border-b-4 border-black pb-2 sm:mb-6 sm:text-2xl sm:pb-3">
                  Vista Previa del Lienzo
                </h2>

                {/* Canvas Preview - Proporciones realistas del tamaño seleccionado */}
                <div className="mb-4 flex items-center justify-center bg-gray-50 p-3 border-4 border-black sm:mb-6 sm:p-6">
                  <div
                    className="relative overflow-hidden border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    style={{
                      width: `${canvasWidth * 3}px`,
                      height: `${canvasHeight * 3}px`,
                      maxWidth: "min(calc(100vw - 120px), 500px)",
                      maxHeight: "min(70vh, 600px)",
                      aspectRatio: `${canvasWidth} / ${canvasHeight}`,
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
                        <div className="text-center px-4">
                          <Upload className="mx-auto mb-2 h-12 w-12 text-gray-400 sm:mb-3 sm:h-16 sm:w-16" />
                          <p className="text-sm font-bold text-gray-600 sm:text-lg">
                            Tu imagen aparecerá aquí
                          </p>
                          <p className="text-xs text-gray-500 mt-1 sm:text-sm">
                            Sube una imagen de referencia
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-0 border-4 border-black bg-yellow-50">
                  <div className="flex items-center justify-between border-b-4 border-black p-3 bg-white sm:p-4">
                    <span className="text-sm font-bold text-black sm:text-base">
                      Tamaño:
                    </span>
                    <span className="text-base font-black text-red-600 sm:text-lg">
                      {selectedSize.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b-4 border-black p-3 sm:p-4">
                    <span className="text-sm font-bold text-black sm:text-base">
                      Dimensiones:
                    </span>
                    <span className="text-sm font-black text-black sm:text-base">
                      {canvasWidth} x {canvasHeight} cm
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b-4 border-black p-3 bg-white sm:p-4">
                    <span className="text-sm font-bold text-black sm:text-base">
                      Orientación:
                    </span>
                    <span className="text-sm font-black capitalize text-black sm:text-base">
                      {orientation === "horizontal" ? "Horizontal" : orientation === "vertical" && canvasWidth === canvasHeight ? "Cuadrado" : "Vertical"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-between gap-2 p-4 bg-red-600 sm:flex-row sm:gap-0 sm:p-5">
                    <span className="text-lg font-black text-white sm:text-xl">
                      Precio Total:
                    </span>
                    <span className="text-3xl font-black text-white sm:text-4xl">
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
                className="space-y-4 border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:space-y-6 sm:p-6 sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Image Upload */}
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
                    Imagen de Referencia *
                  </label>

                  {/* Mobile Preview (only shows when image is uploaded) */}
                  {imagePreview && (
                    <div className="mb-4 lg:hidden">
                      <div className="relative border-4 border-black bg-white p-3">
                        <div className="relative aspect-square w-full overflow-hidden border-2 border-black">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 90vw, 500px"
                            priority
                          />
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCropper(true);
                            }}
                            className="flex flex-1 items-center justify-center gap-2 rounded border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black transition-all hover:bg-gray-50"
                          >
                            <Crop className="h-4 w-4" />
                            Ajustar Imagen
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="flex flex-1 items-center justify-center gap-2 rounded border-2 border-red-600 bg-white px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-50"
                          >
                            <Upload className="h-4 w-4" />
                            Cambiar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Box (minimized on mobile when image exists) */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`group cursor-pointer overflow-hidden border-4 border-dashed border-black bg-gray-50 transition-all hover:bg-yellow-50 hover:border-red-600 ${
                      imagePreview ? 'hidden lg:block lg:p-8' : 'p-6 sm:p-8'
                    }`}
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

                  {/* Mobile: Show compact upload button when image exists */}
                  {!imagePreview && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                  )}

                  {imagePreview && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  )}
                </div>

                {/* Orientation Selection */}
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
                    Orientación del Lienzo *
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleOrientationChange("vertical")}
                      className={`flex flex-col items-center gap-2 border-4 p-3 transition-all sm:gap-3 sm:p-4 ${
                        orientation === "vertical"
                          ? "border-red-600 bg-red-50 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
                          : "border-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`h-14 w-10 border-4 sm:h-16 sm:w-12 ${
                          orientation === "vertical"
                            ? "border-red-600 bg-red-100"
                            : "border-black bg-gray-100"
                        }`}
                      ></div>
                      <span
                        className={`text-xs font-black sm:text-sm ${
                          orientation === "vertical"
                            ? "text-red-600"
                            : "text-black"
                        }`}
                      >
                        Vertical
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOrientationChange("cuadrado")}
                      className={`flex flex-col items-center gap-2 border-4 p-3 transition-all sm:gap-3 sm:p-4 ${
                        orientation === "cuadrado"
                          ? "border-red-600 bg-red-50 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
                          : "border-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`h-12 w-12 border-4 sm:h-14 sm:w-14 ${
                          orientation === "cuadrado"
                            ? "border-red-600 bg-red-100"
                            : "border-black bg-gray-100"
                        }`}
                      ></div>
                      <span
                        className={`text-xs font-black sm:text-sm ${
                          orientation === "cuadrado"
                            ? "text-red-600"
                            : "text-black"
                        }`}
                      >
                        Cuadrado
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOrientationChange("horizontal")}
                      className={`flex flex-col items-center gap-2 border-4 p-3 transition-all sm:gap-3 sm:p-4 ${
                        orientation === "horizontal"
                          ? "border-red-600 bg-red-50 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
                          : "border-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`h-10 w-14 border-4 sm:h-12 sm:w-16 ${
                          orientation === "horizontal"
                            ? "border-red-600 bg-red-100"
                            : "border-black bg-gray-100"
                        }`}
                      ></div>
                      <span
                        className={`text-xs font-black sm:text-sm ${
                          orientation === "horizontal"
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
                    onChange={(e) => {
                      setFormData({ ...formData, customerName: e.target.value });
                      if (errors.customerName) {
                        setErrors({ ...errors, customerName: "" });
                      }
                    }}
                    className={`w-full border-4 bg-white px-4 py-3 text-black font-semibold transition-all placeholder:text-gray-400 focus:outline-none focus:ring-4 ${
                      errors.customerName
                        ? "border-red-600 focus:border-red-600 focus:ring-red-600/20"
                        : "border-black focus:border-red-600 focus:ring-red-600/20"
                    }`}
                    placeholder="Tu nombre"
                    required
                  />
                  {errors.customerName && (
                    <p className="mt-2 text-sm font-bold text-red-600">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) {
                        setErrors({ ...errors, email: "" });
                      }
                    }}
                    className={`w-full border-4 bg-white px-4 py-3 text-black font-semibold transition-all placeholder:text-gray-400 focus:outline-none focus:ring-4 ${
                      errors.email
                        ? "border-red-600 focus:border-red-600 focus:ring-red-600/20"
                        : "border-black focus:border-red-600 focus:ring-red-600/20"
                    }`}
                    placeholder="tu@email.com"
                    required
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm font-bold text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-wide text-black">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) {
                        setErrors({ ...errors, phone: "" });
                      }
                    }}
                    className={`w-full border-4 bg-white px-4 py-3 text-black font-semibold transition-all placeholder:text-gray-400 focus:outline-none focus:ring-4 ${
                      errors.phone
                        ? "border-red-600 focus:border-red-600 focus:ring-red-600/20"
                        : "border-black focus:border-red-600 focus:ring-red-600/20"
                    }`}
                    placeholder="+56 9 1234 5678"
                    required
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm font-bold text-red-600">
                      {errors.phone}
                    </p>
                  )}
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

      {/* Image Cropper Modal */}
      {showCropper && (tempImage || imagePreview) && (
        <ImageCropper
          image={tempImage || imagePreview!}
          aspectRatio={canvasWidth / canvasHeight}
          currentSizeIndex={formData.selectedSizeIndex}
          onCropComplete={handleCropComplete}
          onSizeChange={handleSizeChangeInCropper}
          onCancel={handleCropCancel}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
