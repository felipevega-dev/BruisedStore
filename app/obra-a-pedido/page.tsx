"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  CustomOrder,
  CUSTOM_ORDER_SIZES,
  BASE_CUSTOM_ORDER_PRICE,
  Orientation,
} from "@/types";
import Image from "next/image";
import { Upload, Loader2, CheckCircle2, Paintbrush, Crop, X, UserPlus } from "lucide-react";
import ImageCropper from "@/components/ImageCropper";
import { useToast } from "@/hooks/useToast";
import { isValidFileSize, compressImage } from "@/lib/utils";
import { MAX_IMAGE_SIZE_MB } from "@/lib/constants";
import HowItWorksSection from "@/components/HowItWorksSection";
import FAQSection from "@/components/FAQSection";

export default function CustomOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    selectedSizeIndex: 0,
    notes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
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

  // Filtrar tamaños según orientación
  const getFilteredSizes = (targetOrientation: Orientation) => {
    return CUSTOM_ORDER_SIZES.map((size, originalIndex) => {
      const sizeOrientation: Orientation =
        size.width < size.height
          ? "vertical"
          : size.width > size.height
            ? "horizontal"
            : "cuadrado";
      return {
        size,
        originalIndex,
        orientation: sizeOrientation,
      };
    }).filter((item) => item.orientation === targetOrientation);
  };

  const filteredSizes = getFilteredSizes(orientation);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (!isValidFileSize(file, MAX_IMAGE_SIZE_MB)) {
        showToast(
          `La imagen es demasiado grande. Máximo ${MAX_IMAGE_SIZE_MB}MB`,
          "error"
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast("Por favor selecciona un archivo de imagen válido", "error");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

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
      // Compress image before upload
      let fileToUpload = imageFile!;

      // Only compress if file is larger than 1MB
      if (fileToUpload.size > 1024 * 1024) {
        try {
          fileToUpload = await compressImage(fileToUpload, 1920, 0.85);
        } catch (compressionError) {
          // Continue with original file if compression fails
          showToast("No se pudo optimizar la imagen, subiendo original", "warning");
        }
      }

      const imageRef = ref(
        storage,
        `custom-orders/${Date.now()}_${fileToUpload.name}`
      );
      await uploadBytes(imageRef, fileToUpload);
      const imageUrl = await getDownloadURL(imageRef);

      // Construir datos del pedido (omitir campos undefined)
      const orderData: any = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        referenceImageUrl: imageUrl,
        selectedSize: selectedSize,
        orientation: orientation,
        totalPrice: totalPrice,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      // Agregar campos opcionales solo si tienen valor
      if (formData.notes && formData.notes.trim()) {
        orderData.notes = formData.notes;
      }

      if (user?.uid) {
        orderData.userId = user.uid;
      }

      const docRef = await addDoc(collection(db, "customOrders"), orderData);

      setCreatedOrderId(docRef.id);
      showToast("¡Pedido enviado exitosamente!", "success");

      // Si el usuario NO está logueado, mostrar modal de registro
      if (!user) {
        setShowRegisterModal(true);
      } else {
        // Si ya está logueado, mostrar success normal
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error creating custom order:", error);
      showToast("Hubo un error al enviar tu pedido. Por favor intenta nuevamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar usuario con los datos del pedido
  const handleRegisterUser = async () => {
    setRegisterError("");
    
    // Validar contraseña
    if (!registerPassword) {
      setRegisterError("Por favor ingresa una contraseña");
      return;
    }
    
    if (registerPassword.length < 6) {
      setRegisterError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    setRegisterLoading(true);
    
    try {
      // Crear usuario con la contraseña ingresada
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        registerPassword
      );

      // Actualizar perfil con el nombre
      await updateProfile(userCredential.user, {
        displayName: formData.customerName,
      });

      // Actualizar el pedido con el userId
      if (createdOrderId) {
        const { doc, updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "customOrders", createdOrderId), {
          userId: userCredential.user.uid,
        });
      }

      // Enviar email de verificación con redirección a profile
      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/verify-email?redirect=profile`,
        handleCodeInApp: false,
      });

      showToast("¡Cuenta creada! Revisa tu email para verificar", "success");
      
      // Redirigir a verify-email
      router.push("/verify-email");
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setRegisterError("Este email ya tiene una cuenta.");
        showToast("Este email ya tiene una cuenta. Por favor inicia sesión.", "error");
        setTimeout(() => router.push("/login"), 2000);
      } else if (error.code === "auth/weak-password") {
        setRegisterError("La contraseña es muy débil. Usa al menos 6 caracteres.");
      } else {
        setRegisterError("Error al crear la cuenta. Intenta nuevamente.");
        showToast("Error al crear la cuenta. Intenta nuevamente.", "error");
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  // Función para continuar sin registro
  const handleSkipRegister = () => {
    setShowRegisterModal(false);
    setSuccess(true);
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
            className="border-4 border-black bg-moss-500 px-6 py-3 font-black text-white transition-all hover:bg-moss-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
          >
            Crear Otro Pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white py-6 sm:py-8 lg:py-12"
      style={{
        backgroundImage: 'url(/img/fondodibujado.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Modal de Registro */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
            <button
              onClick={handleSkipRegister}
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-6 text-center">
              <UserPlus className="mx-auto mb-4 h-16 w-16 text-moss-600" />
              <h2 className="mb-2 text-2xl font-black text-black">
                ¡Pedido Enviado!
              </h2>
              <div className="mx-auto mt-3 h-1 w-16 bg-moss-500"></div>
            </div>

            <div className="mb-6 space-y-3 text-sm">
              <p className="font-semibold text-gray-900">
                ✅ Tu pedido ha sido recibido exitosamente
              </p>
              <p className="text-gray-700">
                ¿Quieres crear una cuenta para hacer seguimiento de tu pedido?
              </p>
              
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                <p className="mb-2 font-bold text-blue-900">
                  🎁 Beneficios de crear cuenta:
                </p>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li>• Ver el estado de tu pedido en tiempo real</li>
                  <li>• Historial de todos tus pedidos</li>
                  <li>• Guardar tus datos para pedidos futuros</li>
                  <li>• Acceso a ofertas exclusivas</li>
                </ul>
              </div>

              <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-3">
                <p className="mb-2 text-xs font-bold text-gray-900">
                  📧 Usaremos estos datos:
                </p>
                <p className="text-xs text-gray-700">
                  <strong>Nombre:</strong> {formData.customerName}
                </p>
                <p className="text-xs text-gray-700">
                  <strong>Email:</strong> {formData.email}
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  Te enviaremos un correo de verificación para activar tu cuenta.
                </p>
              </div>

              {/* Campo de Contraseña */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">
                  Crea una contraseña para tu cuenta
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => {
                    setRegisterPassword(e.target.value);
                    if (registerError) setRegisterError("");
                  }}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-500 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                />
                {registerError && (
                  <p className="mt-2 text-sm font-bold text-moss-600">
                    {registerError}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-600">
                  Usa esta contraseña para iniciar sesión después
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRegisterUser}
                disabled={registerLoading}
                className="w-full rounded-lg border-2 border-black bg-moss-500 px-6 py-3 font-bold text-white transition-all hover:bg-moss-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {registerLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creando cuenta...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Sí, crear mi cuenta
                  </span>
                )}
              </button>

              <button
                onClick={handleSkipRegister}
                disabled={registerLoading}
                className="w-full rounded-lg border-2 border-black bg-white px-6 py-3 font-bold text-gray-900 transition-all hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar sin cuenta
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-600">
              Al crear cuenta aceptas nuestros términos y condiciones
            </p>
          </div>
        </div>
      )}

      {/* Hero Banner with Gradient */}
      <div className="relative mb-8 overflow-hidden border-y-4 border-black bg-linear-to-br from-primary-500 via-primary-600 to-blue-700 py-8 sm:py-12 lg:py-16">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-blue-300 blur-3xl"></div>
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary-800 blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border-4 border-black bg-yellow-400 px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:mb-4 sm:px-5 sm:py-2">
            <span className="text-lg sm:text-xl">🎨</span>
            <span className="text-xs font-black uppercase tracking-wider text-black sm:text-sm">
              Arte Personalizado
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-black text-white sm:mb-4 sm:text-5xl lg:text-6xl">
            Crea Tu Obra Única
          </h1>

          <p className="mx-auto mb-3 max-w-3xl text-base font-bold text-white/90 sm:mb-4 sm:text-lg lg:text-xl">
            Transforma tus recuerdos, ideas y visiones en arte profesional
          </p>
          
          <p className="mx-auto mb-6 max-w-2xl text-sm font-semibold text-white/80 sm:mb-8 sm:text-base lg:text-lg">
            Cada obra es única, cada trazo cuenta una historia
          </p>

          {/* Price Range Badge - Mobile: stacked, Desktop: horizontal */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <div className="w-full max-w-[200px] rounded-lg border-4 border-black bg-white px-5 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:w-auto sm:max-w-none sm:px-6 sm:py-3 lg:px-8 lg:py-4">
              <div className="text-xs font-black uppercase tracking-wider text-slate-600">
                Desde
              </div>
              <div className="text-2xl font-black text-primary-600 sm:text-3xl">
                $20.000
              </div>
            </div>
            <div className="hidden text-2xl font-black text-white sm:block sm:text-3xl">→</div>
            <div className="w-full max-w-[200px] rounded-lg border-4 border-black bg-white px-5 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:w-auto sm:max-w-none sm:px-6 sm:py-3 lg:px-8 lg:py-4">
              <div className="text-xs font-black uppercase tracking-wider text-slate-600">
                Hasta
              </div>
              <div className="text-2xl font-black text-primary-600 sm:text-3xl">
                $432.000
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* How It Works Section */}
          <div className="mb-8">
            <HowItWorksSection />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Preview Section - Hidden on mobile, shown on desktop */}
            <div className="order-2 lg:order-1 hidden lg:block">
              <div className="lg:sticky lg:top-24 rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="mb-4 text-xl font-black text-slate-900 border-b-4 border-black pb-2 sm:mb-5 sm:text-2xl sm:pb-3">
                  Vista Previa del Lienzo
                </h2>

                {/* Canvas Preview - Proporciones realistas del tamaño seleccionado */}
                <div className="mb-4 flex items-center justify-center bg-slate-100 p-3 rounded-lg border-4 border-black sm:mb-5 sm:p-6">
                  <div
                    className="relative overflow-hidden rounded-lg border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                    style={{
                      width: `${canvasWidth * 6}px`,
                      height: `${canvasHeight * 6}px`,
                      maxWidth: "min(calc(100vw - 80px), 500px)",
                      maxHeight: "min(60vh, 600px)",
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
                      <div className="flex h-full items-center justify-center bg-slate-50">
                        <div className="text-center px-4">
                          <Upload className="mx-auto mb-2 h-12 w-12 text-slate-400 sm:mb-3 sm:h-16 sm:w-16" />
                          <p className="text-sm font-bold text-slate-700 sm:text-lg">
                            Tu imagen aparecerá aquí
                          </p>
                          <p className="text-xs text-slate-500 mt-1 sm:text-sm">
                            Sube una imagen de referencia
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-0 rounded-lg border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between border-b-4 border-black p-3 bg-white sm:p-4">
                    <span className="text-sm font-bold text-slate-700 sm:text-base">
                      Tamaño:
                    </span>
                    <span className="text-base font-black text-primary-600 sm:text-lg">
                      {selectedSize.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b-4 border-black p-3 bg-blue-50 sm:p-4">
                    <span className="text-sm font-bold text-slate-700 sm:text-base">
                      Dimensiones:
                    </span>
                    <span className="text-sm font-black text-slate-900 sm:text-base">
                      {canvasHeight} × {canvasWidth} cm
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b-4 border-black p-3 bg-white sm:p-4">
                    <span className="text-sm font-bold text-slate-700 sm:text-base">
                      Orientación:
                    </span>
                    <span className="text-sm font-black capitalize text-slate-900 sm:text-base">
                      {orientation === "horizontal" ? "Horizontal" : orientation === "cuadrado" ? "Cuadrado" : "Vertical"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-between gap-2 p-4 bg-primary-500 sm:flex-row sm:gap-0 sm:p-5">
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
                  <label className="mb-3 block text-base font-black uppercase tracking-wide text-black sm:text-sm">
                    Imagen de Referencia *
                  </label>

                  {/* Mobile Canvas Preview - Full info card (only shows when image is uploaded) */}
                  {imagePreview && (
                    <div className="mb-4 lg:hidden">
                      {/* Canvas Preview */}
                      <div className="mb-3 rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="mb-2 text-center text-xs font-black uppercase text-slate-700">
                          Vista Previa del Lienzo
                        </p>
                        <div className="flex items-center justify-center bg-slate-100 p-3 rounded-lg">
                          <div
                            className="relative overflow-hidden rounded-lg border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            style={{
                              width: `${canvasWidth * 4}px`,
                              height: `${canvasHeight * 4}px`,
                              maxWidth: "calc(100vw - 120px)",
                              maxHeight: "300px",
                              aspectRatio: `${canvasWidth} / ${canvasHeight}`,
                            }}
                          >
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 90vw, 500px"
                              priority
                            />
                          </div>
                        </div>
                        
                        {/* Info compact */}
                        <div className="mt-3 space-y-2 text-xs">
                          <div className="flex justify-between rounded border-2 border-black bg-white px-2 py-1.5">
                            <span className="font-bold text-slate-700">Tamaño:</span>
                            <span className="font-black text-primary-600">{selectedSize.name}</span>
                          </div>
                          <div className="flex justify-between rounded border-2 border-black bg-blue-50 px-2 py-1.5">
                            <span className="font-bold text-slate-700">Dimensiones:</span>
                            <span className="font-black text-slate-900">{canvasHeight} × {canvasWidth} cm</span>
                          </div>
                          <div className="flex justify-between rounded border-2 border-black bg-primary-500 px-2 py-2">
                            <span className="font-black text-white">Precio:</span>
                            <span className="font-black text-white">{formatPrice(totalPrice)}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCropper(true);
                            }}
                            className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:bg-slate-50"
                          >
                            <Crop className="h-3.5 w-3.5" />
                            Ajustar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-primary-500 bg-white px-3 py-2 text-xs font-bold text-primary-600 transition-all hover:bg-primary-50"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Cambiar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Box (only shows when NO image) */}
                  {!imagePreview && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group cursor-pointer overflow-hidden border-4 border-dashed border-black bg-gray-50 p-6 transition-all hover:border-moss-500 hover:bg-terra-100 sm:p-8"
                    >
                      <Upload className="mx-auto mb-3 h-12 w-12 text-moss-600 transition-transform group-hover:scale-110" />
                      <p className="mb-2 text-center font-bold text-black">
                        drag.jpg
                      </p>
                      <p className="text-center text-xs font-semibold text-gray-600">
                        PNG, JPG hasta 10MB
                      </p>
                    </div>
                  )}

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
                  <label className="mb-3 block text-base font-black uppercase tracking-wide text-slate-900 sm:text-sm">
                    Orientación del Lienzo *
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleOrientationChange("vertical")}
                      className={`flex flex-col items-center gap-2 rounded-lg border-4 p-3 transition-all sm:gap-3 sm:p-4 ${
                        orientation === "vertical"
                          ? "border-primary-500 bg-primary-50 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]"
                          : "border-black bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`h-14 w-10 border-4 rounded sm:h-16 sm:w-12 ${
                          orientation === "vertical"
                            ? "border-primary-500 bg-primary-100"
                            : "border-black bg-slate-100"
                        }`}
                      ></div>
                      <span
                        className={`text-xs font-black sm:text-sm ${
                          orientation === "vertical"
                            ? "text-primary-600"
                            : "text-slate-900"
                        }`}
                      >
                        Vertical
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOrientationChange("cuadrado")}
                      className={`flex flex-col items-center gap-2 rounded-lg border-4 p-3 transition-all sm:gap-3 sm:p-4 ${
                        orientation === "cuadrado"
                          ? "border-primary-500 bg-primary-50 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]"
                          : "border-black bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`h-12 w-12 border-4 rounded sm:h-14 sm:w-14 ${
                          orientation === "cuadrado"
                            ? "border-primary-500 bg-primary-100"
                            : "border-black bg-slate-100"
                        }`}
                      ></div>
                      <span
                        className={`text-xs font-black sm:text-sm ${
                          orientation === "cuadrado"
                            ? "text-primary-600"
                            : "text-slate-900"
                        }`}
                      >
                        Cuadrado
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOrientationChange("horizontal")}
                      className={`flex flex-col items-center gap-2 rounded-lg border-4 p-3 transition-all sm:gap-3 sm:p-4 ${
                        orientation === "horizontal"
                          ? "border-primary-500 bg-primary-50 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]"
                          : "border-black bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`h-10 w-14 border-4 rounded sm:h-12 sm:w-16 ${
                          orientation === "horizontal"
                            ? "border-primary-500 bg-primary-100"
                            : "border-black bg-slate-100"
                        }`}
                      ></div>
                      <span
                        className={`text-xs font-black sm:text-sm ${
                          orientation === "horizontal"
                            ? "text-primary-600"
                            : "text-slate-900"
                        }`}
                      >
                        Horizontal
                      </span>
                    </button>
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <label className="mb-3 block text-base font-black uppercase tracking-wide text-slate-900 sm:text-sm">
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
                    className="w-full rounded-lg border-4 border-black bg-white px-4 py-3 font-bold text-slate-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                    required
                  >
                    {filteredSizes.map((item) => (
                      <option key={item.originalIndex} value={item.originalIndex} className="font-bold">
                        {item.size.name} ({item.size.height}x{item.size.width} cm) - {formatPrice(BASE_CUSTOM_ORDER_PRICE * item.size.priceMultiplier)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-3 block text-base font-black uppercase tracking-wide text-slate-900 sm:text-sm">
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
                    className={`w-full rounded-lg border-4 bg-white px-4 py-3 text-slate-900 font-semibold transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                      errors.customerName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-black focus:border-primary-500 focus:ring-primary-500/20"
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
                  <label className="mb-3 block text-base font-black uppercase tracking-wide text-slate-900 sm:text-sm">
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
                    className={`w-full rounded-lg border-4 bg-white px-4 py-3 text-slate-900 font-semibold transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-black focus:border-primary-500 focus:ring-primary-500/20"
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
                  <label className="mb-3 block text-base font-black uppercase tracking-wide text-slate-900 sm:text-sm">
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
                    className={`w-full rounded-lg border-4 bg-white px-4 py-3 text-slate-900 font-semibold transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                      errors.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-black focus:border-primary-500 focus:ring-primary-500/20"
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
                  <label className="mb-3 block text-base font-black uppercase tracking-wide text-slate-900 sm:text-sm">
                    Detalles Adicionales (Opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-lg border-4 border-black bg-white px-4 py-3 text-slate-900 font-semibold transition-all placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                    placeholder="Cuéntanos tu visión: colores, estilo, emociones que deseas plasmar..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg border-4 border-black bg-primary-500 px-6 py-4 text-lg font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-600 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 disabled:bg-slate-400 disabled:text-slate-700 disabled:cursor-not-allowed"
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

          {/* FAQ Section */}
          <div className="mt-8">
            <FAQSection />
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
