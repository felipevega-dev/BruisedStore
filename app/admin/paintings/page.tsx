"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Painting, Orientation, PAINTING_CATEGORIES, PaintingCategory } from "@/types";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { Trash2, Plus, Loader2, Edit, X, ArrowLeft, Palette } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { AdminLogHelpers } from "@/lib/adminLogs";

export default function AdminPaintingsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPainting, setEditingPainting] = useState<Painting | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    width: "",
    height: "",
    category: "",
    orientation: "vertical" as Orientation,
    available: true,
    stock: "",
    lowStockThreshold: "1",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push("/admin");
      } else {
        setLoading(false);
      }
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchPaintings();
    }
  }, [user, isAdmin]);

  const fetchPaintings = async () => {
    try {
      const q = query(collection(db, "paintings"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const paintingsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Painting;
      });
      setPaintings(paintingsData);
    } catch (error) {
      console.error("Error fetching paintings:", error);
    }
  };

  const optimizeImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1, // Máximo 1MB
      maxWidthOrHeight: 1920, // Máximo ancho/alto de 1920px
      useWebWorker: true,
      fileType: "image/jpeg", // Convertir a JPEG para mejor compresión
      initialQuality: 0.85, // Calidad del 85%
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(
        `Imagen optimizada: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
      );
      return compressedFile;
    } catch (error) {
      console.error("Error al optimizar imagen:", error);
      return file; // Retornar archivo original si falla la compresión
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setCompressing(true);
    try {
      const optimizedFiles: File[] = [];
      const previews: string[] = [];

      // Procesar todas las imágenes
      const processPromises = files.map(async (file) => {
        const optimizedFile = await optimizeImage(file);
        optimizedFiles.push(optimizedFile);
        
        // Crear preview
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(optimizedFile);
        });
      });

      const newPreviews = await Promise.all(processPromises);
      previews.push(...newPreviews);

      // Actualizar estado
      setImageFiles((prev) => [...prev, ...optimizedFiles]);
      setImagePreviews((prev) => [...prev, ...previews]);
      
      // Limpiar el input para permitir subir las mismas imágenes de nuevo si es necesario
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error al procesar imágenes:", error);
      showToast("Error al procesar las imágenes", "error");
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    const preview = imagePreviews[index];
    const isNewImage = preview.startsWith("data:");
    
    // Remover el preview
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    
    // Si es una imagen nueva (base64), también remover el archivo correspondiente
    if (isNewImage && imageFiles.length > 0) {
      // Contar cuántas imágenes nuevas (base64) hay antes de este índice
      let newImageCount = 0;
      for (let i = 0; i < index; i++) {
        if (imagePreviews[i].startsWith("data:")) {
          newImageCount++;
        }
      }
      // Remover el archivo en la posición correspondiente
      const newFiles = imageFiles.filter((_, i) => i !== newImageCount);
      setImageFiles(newFiles);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      width: "",
      height: "",
      category: "",
      orientation: "vertical" as Orientation,
      available: true,
      stock: "",
      lowStockThreshold: "1",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingPainting(null);
  };

  const handleEdit = (painting: Painting) => {
    setEditingPainting(painting);
    setFormData({
      title: painting.title,
      description: painting.description || "",
      price: painting.price.toString(),
      width: painting.dimensions.width.toString(),
      height: painting.dimensions.height.toString(),
      category: painting.category || "",
      orientation: painting.orientation || "vertical",
      available: painting.available,
      stock: painting.stock !== undefined ? painting.stock.toString() : "",
      lowStockThreshold: painting.lowStockThreshold?.toString() || "1",
    });
    // Cargar imágenes existentes (solo URLs, no previews base64)
    const existingImages = painting.images && painting.images.length > 0 
      ? painting.images 
      : [painting.imageUrl];
    setImagePreviews(existingImages.filter(img => img && img.startsWith("http")));
    setImageFiles([]); // No hay nuevos archivos al editar inicialmente
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageFiles.length === 0 && imagePreviews.length === 0 && !editingPainting) {
      showToast("Por favor sube al menos una imagen", "error");
      return;
    }

    setUploading(true);

    try {
      let imageUrls: string[] = [];

      // Procesar imágenes: mantener orden y separar existentes de nuevas
      const finalImageUrls: string[] = [];
      const uploadPromises: Promise<string>[] = [];
      let newFileIndex = 0;

      // Procesar cada preview en orden
      for (const preview of imagePreviews) {
        if (preview.startsWith("http")) {
          // Es una URL existente de Firebase, mantenerla
          finalImageUrls.push(preview);
        } else if (preview.startsWith("data:") && newFileIndex < imageFiles.length) {
          // Es un preview nuevo (base64), subirlo
          const file = imageFiles[newFileIndex];
          const uploadPromise = (async () => {
            const imageRef = ref(storage, `paintings/${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`);
            await uploadBytes(imageRef, file);
            return await getDownloadURL(imageRef);
          })();
          uploadPromises.push(uploadPromise);
          newFileIndex++;
        }
      }

      // Esperar a que todas las nuevas imágenes se suban
      if (uploadPromises.length > 0) {
        const newImageUrls = await Promise.all(uploadPromises);
        // Insertar las nuevas URLs en las posiciones correspondientes
        let newUrlIndex = 0;
        const allImageUrls: string[] = [];
        for (const preview of imagePreviews) {
          if (preview.startsWith("http")) {
            allImageUrls.push(preview);
          } else if (preview.startsWith("data:")) {
            if (newUrlIndex < newImageUrls.length) {
              allImageUrls.push(newImageUrls[newUrlIndex]);
              newUrlIndex++;
            }
          }
        }
        imageUrls = allImageUrls;
      } else {
        // Solo imágenes existentes
        imageUrls = finalImageUrls;
      }

      // Si no hay imágenes pero estamos editando, usar las existentes de la pintura
      if (imageUrls.length === 0 && editingPainting) {
        imageUrls = editingPainting.images || [editingPainting.imageUrl];
      }

      // Si no hay imágenes en absoluto, error
      if (imageUrls.length === 0) {
        showToast("Error: No se pudieron cargar las imágenes", "error");
        setUploading(false);
        return;
      }

      const paintingData = {
        title: formData.title,
        description: formData.description || null,
        imageUrl: imageUrls[0], // Mantener para compatibilidad
        images: imageUrls, // Array de imágenes
        price: parseFloat(formData.price),
        dimensions: {
          width: parseFloat(formData.width),
          height: parseFloat(formData.height),
        },
        orientation: formData.orientation,
        available: formData.available,
        category: formData.category || null,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold) : 1,
      };

      if (editingPainting) {
        // Update existing painting
        await updateDoc(doc(db, "paintings", editingPainting.id), paintingData);
        
        // Registrar log de actividad
        if (user?.email && user?.uid) {
          await AdminLogHelpers.logPaintingUpdated(
            user.email,
            user.uid,
            editingPainting.id,
            formData.title
          );
        }
        
        showToast(`"${formData.title}" actualizada exitosamente`, "success");
      } else {
        // Create new painting
        const docRef = await addDoc(collection(db, "paintings"), {
          ...paintingData,
          createdAt: serverTimestamp(),
        });
        
        // Registrar log de actividad
        if (user?.email && user?.uid) {
          await AdminLogHelpers.logPaintingCreated(
            user.email,
            user.uid,
            docRef.id,
            formData.title
          );
        }
        
        showToast(`"${formData.title}" creada exitosamente`, "success");
      }

      await fetchPaintings();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving painting:", error);
      showToast("Error al guardar la pintura", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (painting: Painting) => {
    if (!confirm(`¿Estás seguro de eliminar "${painting.title}"?`)) {
      return;
    }

    try {
      // Delete image from storage
      if (painting.imageUrl) {
        try {
          const imageRef = ref(storage, painting.imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.log("Image already deleted or not found");
        }
      }

      // Delete document from Firestore
      await deleteDoc(doc(db, "paintings", painting.id));
      
      // Registrar log de actividad
      if (user?.email && user?.uid) {
        await AdminLogHelpers.logPaintingDeleted(
          user.email,
          user.uid,
          painting.id,
          painting.title
        );
      }
      
      await fetchPaintings();
      showToast(`"${painting.title}" eliminada exitosamente`, "success");
    } catch (error) {
      console.error("Error deleting painting:", error);
      showToast("Error al eliminar la pintura", "error");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 via-gray-50 to-slate-50">
        <div className="rounded-2xl border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-moss-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-linear-to-br from-slate-100 via-gray-50 to-slate-50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 rounded-2xl border-4 border-black bg-linear-to-r from-blue-500 to-blue-600 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-white transition-colors hover:text-blue-100"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white">
                <Palette className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] sm:text-4xl">Gestionar Pinturas</h1>
            </div>
          </div>

          <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl border-4 border-black bg-blue-500 px-6 py-3 font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="h-5 w-5" />
            Nueva Pintura
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paintings.map((painting) => (
            <div key={painting.id} className="group rounded-xl border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="relative mb-3 aspect-3/4 overflow-hidden rounded-lg border-4 border-black">
                <Image
                  src={painting.imageUrl}
                  alt={painting.title}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
              <h3 className="mb-1 font-black text-gray-900">{painting.title}</h3>
              <p className="mb-2 text-sm font-semibold text-gray-600">
                {painting.dimensions.width} x {painting.dimensions.height} cm
              </p>
              <p className="mb-3 text-lg font-black text-blue-600">
                {formatPrice(painting.price)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(painting)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border-4 border-black bg-yellow-400 px-3 py-2 text-sm font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(painting)}
                  className="flex items-center justify-center rounded-lg border-4 border-black bg-red-400 px-3 py-2 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {paintings.length === 0 && (
          <div className="rounded-2xl border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Palette className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p className="text-xl font-black text-gray-900">
              No hay pinturas. Crea una nueva para comenzar.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 border-terra-900 bg-black/90 p-4 sm:p-6 shadow-2xl shadow-terra-900/50 backdrop-blur-md my-4 scrollbar-thin scrollbar-thumb-terra-900 scrollbar-track-moss-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-terra-100">
                {editingPainting ? "Editar Pintura" : "Nueva Pintura"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 transition-colors hover:text-terra-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Multiple Images Upload */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-terra-100">
                  Imágenes * (Puedes subir múltiples)
                </label>
                {compressing && (
                  <div className="mb-3 rounded-lg border-2 border-terra-900 bg-moss-950/20 p-3 text-terra-300">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Optimizando imágenes...
                  </div>
                )}
                {imagePreviews.length > 0 && (
                  <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border-2 border-terra-900/30">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="150px"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-terra-900 p-1 text-terra-100 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full rounded-lg border-2 border-terra-900 bg-gray-900 px-4 py-2 text-terra-100 file:mr-4 file:rounded-lg file:border-2 file:border-terra-900 file:bg-terra-900/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-terra-100 file:hover:bg-terra-900/40"
                  required={imagePreviews.length === 0 && !editingPainting}
                  disabled={compressing}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Las imágenes se optimizarán automáticamente antes de subirse (máx. 1MB cada una)
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-terra-100">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border-2 border-terra-900 bg-gray-900 px-4 py-3 text-terra-100 transition-all placeholder:text-gray-500 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/50"
                  placeholder="Título de la obra"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-terra-100">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border-2 border-terra-900 bg-gray-900 px-4 py-3 text-terra-100 transition-all placeholder:text-gray-500 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/50"
                  rows={3}
                  placeholder="Descripción de la obra"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-terra-100">
                  Precio (CLP) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-lg border-2 border-terra-900 bg-gray-900 px-4 py-3 text-terra-100 transition-all placeholder:text-gray-500 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/50"
                  placeholder="0"
                  required
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-terra-100">
                    Ancho (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    className="w-full rounded-lg border-2 border-terra-900 bg-gray-900 px-4 py-3 text-terra-100 transition-all placeholder:text-gray-500 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/50"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-terra-100">
                    Alto (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full rounded-lg border-2 border-terra-900 bg-gray-900 px-4 py-3 text-terra-100 transition-all placeholder:text-gray-500 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/50"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Orientation */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-terra-100">
                  Orientación *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, orientation: "vertical" })}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      formData.orientation === "vertical"
                        ? "border-moss-500 bg-moss-900/50 shadow-lg shadow-terra-900/50"
                        : "border-terra-900/30 bg-gray-900/30 hover:border-terra-800"
                    }`}
                  >
                    <div
                      className={`h-16 w-12 rounded border-2 ${
                        formData.orientation === "vertical"
                          ? "border-terra-500 bg-terra-900/30"
                          : "border-gray-600 bg-gray-800"
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-semibold ${
                        formData.orientation === "vertical"
                          ? "text-terra-100"
                          : "text-gray-400"
                      }`}
                    >
                      Vertical
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, orientation: "horizontal" })}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      formData.orientation === "horizontal"
                        ? "border-moss-500 bg-moss-900/50 shadow-lg shadow-terra-900/50"
                        : "border-terra-900/30 bg-gray-900/30 hover:border-terra-800"
                    }`}
                  >
                    <div
                      className={`h-12 w-16 rounded border-2 ${
                        formData.orientation === "horizontal"
                          ? "border-terra-500 bg-terra-900/30"
                          : "border-gray-600 bg-gray-800"
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-semibold ${
                        formData.orientation === "horizontal"
                          ? "text-terra-100"
                          : "text-gray-400"
                      }`}
                    >
                      Horizontal
                    </span>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-terra-100">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border-2 border-terra-900 bg-gray-900 px-4 py-3 text-terra-100 transition-all focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/50"
                >
                  <option value="">Sin categoría</option>
                  {PAINTING_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="h-5 w-5 rounded border-2 border-terra-900 bg-gray-900 text-moss-600 focus:ring-2 focus:ring-moss-500/50"
                />
                <label htmlFor="available" className="text-sm font-semibold text-terra-100">
                  Disponible
                </label>
              </div>

              {/* Stock Management */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stock" className="mb-2 block text-sm font-semibold text-terra-100">
                    Stock <span className="text-xs text-terra-400">(vacío = ilimitado)</span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Ej: 5"
                    min="0"
                    className="w-full rounded-lg border-2 border-terra-900 bg-gray-900 px-4 py-3 text-terra-100 placeholder-terra-700 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/50"
                  />
                </div>
                <div>
                  <label htmlFor="lowStockThreshold" className="mb-2 block text-sm font-semibold text-terra-100">
                    Alerta de Stock Bajo
                  </label>
                  <input
                    type="number"
                    id="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    min="0"
                    className="w-full rounded-lg border-2 border-terra-900 bg-gray-900 px-4 py-3 text-terra-100 placeholder-terra-700 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/50"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-terra-900 bg-linear-to-r from-terra-900 to-terra-800 px-6 py-3 font-bold text-terra-100 transition-all hover:from-terra-800 hover:to-moss-600 hover:shadow-lg hover:shadow-terra-900/50 disabled:from-gray-800 disabled:to-gray-700 disabled:text-gray-400"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="rounded-lg border-2 border-terra-900 bg-terra-900/20 px-6 py-3 font-semibold text-terra-100 transition-all hover:bg-terra-900/40"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
