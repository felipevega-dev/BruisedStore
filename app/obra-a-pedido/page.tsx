"use client";

import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { CustomOrder, CUSTOM_ORDER_SIZES, BASE_CUSTOM_ORDER_PRICE } from "@/types";
import Image from "next/image";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";

export default function CustomOrderPage() {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    selectedSizeIndex: 0,
    notes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSize = CUSTOM_ORDER_SIZES[formData.selectedSizeIndex];
  const totalPrice = BASE_CUSTOM_ORDER_PRICE * selectedSize.priceMultiplier;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `custom-orders/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      // Create order in Firestore
      const orderData: Omit<CustomOrder, "id"> = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        referenceImageUrl: imageUrl,
        selectedSize: selectedSize,
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
      // Reset form
      setFormData({
        customerName: "",
        email: "",
        phone: "",
        selectedSizeIndex: 0,
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            ¡Pedido Enviado!
          </h2>
          <p className="mb-6 text-gray-600">
            Tu solicitud de obra a pedido ha sido recibida. Nos pondremos en
            contacto contigo pronto.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="rounded-md bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800"
          >
            Crear Otro Pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Crear Obra a Pedido
            </h1>
            <p className="text-gray-600">
              Sube una imagen de referencia y selecciona el tamaño deseado para
              tu pintura personalizada.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Preview Section */}
            <div className="order-2 lg:order-1">
              <div className="sticky top-24 rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  Vista Previa
                </h2>

                {imagePreview ? (
                  <div
                    className="relative mx-auto overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50"
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      aspectRatio: `${selectedSize.width}/${selectedSize.height}`,
                    }}
                  >
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                ) : (
                  <div
                    className="relative mx-auto flex items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      aspectRatio: `${selectedSize.width}/${selectedSize.height}`,
                    }}
                  >
                    <p className="text-gray-400">
                      Sube una imagen para ver la vista previa
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-2 text-center">
                  <p className="text-sm text-gray-600">
                    Dimensiones: {selectedSize.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(totalPrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="order-1 lg:order-2">
              <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
                {/* Image Upload */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Imagen de Referencia *
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-gray-400 hover:bg-gray-100"
                  >
                    <Upload className="mb-2 h-10 w-10 text-gray-400" />
                    <p className="mb-1 text-sm font-medium text-gray-700">
                      {imageFile ? imageFile.name : "Click para subir imagen"}
                    </p>
                    <p className="text-xs text-gray-500">
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

                {/* Size Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Tamaño *
                  </label>
                  <select
                    value={formData.selectedSizeIndex}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selectedSizeIndex: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    required
                  >
                    {CUSTOM_ORDER_SIZES.map((size, index) => (
                      <option key={index} value={index}>
                        {size.name} - {formatPrice(BASE_CUSTOM_ORDER_PRICE * size.priceMultiplier)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Notas Adicionales (Opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="Detalles adicionales sobre tu pedido..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Pedido"
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
