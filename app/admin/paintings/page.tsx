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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Gestionar Pinturas</h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800"
          >
            <Plus className="h-5 w-5" />
            Nueva Pintura
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paintings.map((painting) => (
            <div key={painting.id} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-md">
                <Image
                  src={painting.imageUrl}
                  alt={painting.title}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
              <h3 className="mb-1 font-semibold text-gray-900">{painting.title}</h3>
              <p className="mb-2 text-sm text-gray-600">
                {painting.dimensions.width} x {painting.dimensions.height} cm
              </p>
              <p className="mb-3 font-bold text-gray-900">
                {formatPrice(painting.price)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(painting)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(painting)}
                  className="flex items-center justify-center rounded-md border border-red-300 px-3 py-2 text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {paintings.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No hay pinturas. Crea una nueva para comenzar.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPainting ? "Editar Pintura" : "Nueva Pintura"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Imagen *
                </label>
                {imagePreview && (
                  <div className="relative mb-3 aspect-[3/4] w-48 overflow-hidden rounded-md">
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
                  className="w-full"
                  required={!editingPainting}
                />
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2"
                  rows={3}
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Precio (CLP) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2"
                  required
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Ancho (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Alto (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2"
                />
              </div>

              {/* Available */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="available" className="text-sm font-medium text-gray-900">
                  Disponible
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
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
                  className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
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
