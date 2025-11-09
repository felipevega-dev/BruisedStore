"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
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
import { auth, db, storage } from "@/lib/firebase";
import { Painting } from "@/types";
import Image from "next/image";
import { Trash2, Plus, Loader2, Edit, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminPaintingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
    available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin");
      } else {
        setUser(user);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchPaintings();
    }
  }, [user]);

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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      width: "",
      height: "",
      category: "",
      available: true,
    });
    setImageFile(null);
    setImagePreview(null);
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
      available: painting.available,
    });
    setImagePreview(painting.imageUrl);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile && !editingPainting) {
      alert("Por favor sube una imagen");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = editingPainting?.imageUrl || "";

      // Upload new image if provided
      if (imageFile) {
        const imageRef = ref(storage, `paintings/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const paintingData = {
        title: formData.title,
        description: formData.description || null,
        imageUrl: imageUrl,
        price: parseFloat(formData.price),
        dimensions: {
          width: parseFloat(formData.width),
          height: parseFloat(formData.height),
        },
        available: formData.available,
        category: formData.category || null,
      };

      if (editingPainting) {
        // Update existing painting
        await updateDoc(doc(db, "paintings", editingPainting.id), paintingData);
      } else {
        // Create new painting
        await addDoc(collection(db, "paintings"), {
          ...paintingData,
          createdAt: serverTimestamp(),
        });
      }

      await fetchPaintings();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving painting:", error);
      alert("Error al guardar la pintura");
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
      await fetchPaintings();
    } catch (error) {
      console.error("Error deleting painting:", error);
      alert("Error al eliminar la pintura");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black">
        <div className="rounded-lg border-2 border-red-900 bg-black/60 p-8 backdrop-blur-sm">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-300 transition-colors hover:text-red-400"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-red-100 sm:text-4xl">Gestionar Pinturas</h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-4 py-2 font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50"
          >
            <Plus className="h-5 w-5" />
            Nueva Pintura
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paintings.map((painting) => (
            <div key={painting.id} className="rounded-lg border-2 border-red-900/30 bg-black/60 p-4 shadow-xl shadow-red-900/20 backdrop-blur-sm transition-all hover:border-red-700 hover:shadow-2xl hover:shadow-red-900/40">
              <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-md border border-red-900/30">
                <Image
                  src={painting.imageUrl}
                  alt={painting.title}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
              <h3 className="mb-1 font-bold text-red-100">{painting.title}</h3>
              <p className="mb-2 text-sm text-gray-400">
                {painting.dimensions.width} x {painting.dimensions.height} cm
              </p>
              <p className="mb-3 font-bold text-red-500">
                {formatPrice(painting.price)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(painting)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border-2 border-red-900 bg-red-900/20 px-3 py-2 text-sm font-semibold text-red-100 transition-all hover:bg-red-900/40"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(painting)}
                  className="flex items-center justify-center rounded-lg border-2 border-red-900 bg-red-950/30 px-3 py-2 text-red-400 transition-all hover:bg-red-900/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {paintings.length === 0 && (
          <div className="rounded-lg border-2 border-red-900 bg-black/60 p-12 text-center backdrop-blur-sm shadow-2xl shadow-red-900/30">
            <p className="text-xl font-semibold text-red-100">
              No hay pinturas. Crea una nueva para comenzar.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 border-red-900 bg-black/90 p-6 shadow-2xl shadow-red-900/50 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-red-100">
                {editingPainting ? "Editar Pintura" : "Nueva Pintura"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 transition-colors hover:text-red-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Imagen *
                </label>
                {imagePreview && (
                  <div className="relative mb-3 aspect-[3/4] w-48 overflow-hidden rounded-md border-2 border-red-900/30">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-2 text-red-100 file:mr-4 file:rounded-lg file:border-2 file:border-red-900 file:bg-red-900/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-100 file:hover:bg-red-900/40"
                  required={!editingPainting}
                />
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  placeholder="Título de la obra"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  rows={3}
                  placeholder="Descripción de la obra"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Precio (CLP) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  placeholder="0"
                  required
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                    Ancho (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                    Alto (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  placeholder="Categoría (opcional)"
                />
              </div>

              {/* Available */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="h-5 w-5 rounded border-2 border-red-900 bg-gray-900 text-red-600 focus:ring-2 focus:ring-red-600/50"
                />
                <label htmlFor="available" className="text-sm font-semibold text-red-100">
                  Disponible
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-3 font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50 disabled:from-gray-800 disabled:to-gray-700 disabled:text-gray-400"
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
                  className="rounded-lg border-2 border-red-900 bg-red-900/20 px-6 py-3 font-semibold text-red-100 transition-all hover:bg-red-900/40"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
