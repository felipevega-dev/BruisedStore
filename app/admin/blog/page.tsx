"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { BlogPost, BLOG_CATEGORIES, BlogCategory } from "@/types";
import TipTapEditor from "@/components/TipTapEditor";
import { useToast } from "@/hooks/useToast";
import imageCompression from "browser-image-compression";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  Save,
  Loader2,
} from "lucide-react";

export default function AdminBlogPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "proceso" as BlogCategory,
    tags: "",
    published: false,
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");

  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
    } else {
      fetchPosts();
    }
  }, [isAdmin, router]);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          publishedAt: data.publishedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as BlogPost;
      });
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
      showToast("Error al cargar posts", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("La imagen no debe superar 5MB", "error");
        return;
      }

      try {
        // Compress image for blog covers (1200x630 recommended)
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: "image/jpeg",
        };

        const compressedFile = await imageCompression(file, options);
        setCoverImageFile(compressedFile);
        const previewUrl = URL.createObjectURL(compressedFile);
        setCoverImagePreview(previewUrl);

        showToast(
          `Imagen optimizada: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
          "success"
        );
      } catch (error) {
        console.error("Error compressing image:", error);
        showToast("Error al optimizar imagen", "error");
      }
    }
  };

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverImageFile) return formData.coverImage || null;

    try {
      const imageRef = ref(
        storage,
        `blog-covers/${Date.now()}-${coverImageFile.name}`
      );
      await uploadBytes(imageRef, coverImageFile);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Error al subir imagen", "error");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.excerpt || !formData.content) {
      showToast("Por favor completa todos los campos requeridos", "error");
      return;
    }

    setSubmitting(true);

    try {
      const coverImageUrl = await uploadCoverImage();

      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: coverImageUrl,
        category: formData.category,
        tags: tagsArray,
        published: formData.published,
        authorId: user!.uid,
        updatedAt: Timestamp.now(),
      };

      if (editingPost) {
        // Update existing post
        await updateDoc(doc(db, "blogPosts", editingPost.id), postData);
        showToast("Post actualizado correctamente", "success");
      } else {
        // Create new post
        await addDoc(collection(db, "blogPosts"), {
          ...postData,
          createdAt: Timestamp.now(),
          publishedAt: formData.published ? Timestamp.now() : null,
          viewCount: 0,
        });
        showToast("Post creado correctamente", "success");
      }

      resetForm();
      fetchPosts();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving post:", error);
      showToast("Error al guardar post", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || "",
      category: post.category,
      tags: post.tags.join(", "),
      published: post.published,
    });
    setCoverImagePreview(post.coverImage || "");
    setShowForm(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("¿Estás seguro de eliminar este post?")) return;

    try {
      await deleteDoc(doc(db, "blogPosts", postId));
      showToast("Post eliminado correctamente", "success");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast("Error al eliminar post", "error");
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const newPublished = !post.published;
      await updateDoc(doc(db, "blogPosts", post.id), {
        published: newPublished,
        publishedAt: newPublished ? Timestamp.now() : null,
        updatedAt: Timestamp.now(),
      });
      showToast(
        newPublished ? "Post publicado" : "Post despublicado",
        "success"
      );
      fetchPosts();
    } catch (error) {
      console.error("Error toggling published:", error);
      showToast("Error al cambiar estado", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      category: "proceso",
      tags: "",
      published: false,
    });
    setCoverImageFile(null);
    setCoverImagePreview("");
    setEditingPost(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black">
        <div className="rounded-lg border-2 border-red-900 bg-black/60 p-8 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-red-400" />
            <h1 className="text-4xl font-black text-red-100">
              Administrar Blog
            </h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-3 font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50"
            >
              <Plus className="h-5 w-5" />
              Nuevo Post
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 rounded-lg border-2 border-red-900/30 bg-black/60 p-6 shadow-xl shadow-red-900/20 backdrop-blur-sm">
            <h2 className="mb-6 text-2xl font-black text-red-100">
              {editingPost ? "Editar Post" : "Crear Nuevo Post"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-lg border-2 border-red-900/50 bg-gray-800 px-4 py-3 font-mono text-sm text-gray-400"
                  readOnly
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL: /blog/{formData.slug || "tu-post"}
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Extracto *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  required
                />
                <p className="mt-1 text-sm text-gray-400">
                  Descripción corta para las tarjetas del blog
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as BlogCategory,
                    })
                  }
                  className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="acuarela, abstracto, naturaleza"
                  className="w-full rounded-lg border-2 border-red-900 bg-gray-900 px-4 py-3 text-red-100 transition-all placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                />
                <p className="mt-1 text-sm text-gray-400">
                  Separados por comas
                </p>
              </div>

              {/* Cover Image */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Imagen de Portada
                </label>
                {coverImagePreview && (
                  <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border-2 border-red-900">
                    <img
                      src={coverImagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImagePreview("");
                        setCoverImageFile(null);
                        setFormData({ ...formData, coverImage: "" });
                      }}
                      className="absolute right-2 top-2 rounded-full border-2 border-red-900 bg-red-600 p-2 text-white transition-all hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-red-900 bg-gray-800 px-6 py-3 font-bold text-red-100 transition-all hover:bg-gray-700">
                  <ImageIcon className="h-5 w-5" />
                  {coverImagePreview ? "Cambiar Imagen" : "Subir Imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="mt-1 text-sm text-gray-400">
                  Máximo 5MB. Tamaño recomendado: 1200x630px
                </p>
              </div>

              {/* Content Editor */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-red-100">
                  Contenido *
                </label>
                <TipTapEditor
                  content={formData.content}
                  onChange={(html) =>
                    setFormData({ ...formData, content: html })
                  }
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="h-6 w-6 rounded border-2 border-red-900 bg-gray-800 accent-red-600"
                />
                <label htmlFor="published" className="font-bold text-red-100">
                  Publicar inmediatamente
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg border-2 border-red-900 bg-gradient-to-r from-red-900 to-red-800 px-6 py-3 font-bold text-red-100 transition-all hover:from-red-800 hover:to-red-700 hover:shadow-lg hover:shadow-red-900/50 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {editingPost ? "Actualizar" : "Crear Post"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border-2 border-red-900/50 bg-gray-800 px-6 py-3 font-bold text-red-100 transition-all hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        {!showForm && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="rounded-lg border-2 border-red-900/30 bg-black/60 p-12 text-center shadow-xl shadow-red-900/20 backdrop-blur-sm">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-red-400" />
                <p className="text-lg font-bold text-red-100">
                  No hay posts aún
                </p>
                <p className="text-gray-400">
                  Crea tu primer post para comenzar
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 rounded-lg border-2 border-red-900/30 bg-black/60 p-4 shadow-xl shadow-red-900/20 backdrop-blur-sm transition-all hover:border-red-700 hover:shadow-2xl hover:shadow-red-900/40"
                >
                  {/* Cover Image */}
                  {post.coverImage && (
                    <div className="aspect-video w-32 overflow-hidden rounded border-2 border-red-900">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-xl font-black text-red-100">
                        {post.title}
                      </h3>
                      {post.published ? (
                        <span className="rounded-full border-2 border-green-600 bg-green-900/50 px-3 py-1 text-xs font-bold text-green-400">
                          Publicado
                        </span>
                      ) : (
                        <span className="rounded-full border-2 border-yellow-600 bg-yellow-900/50 px-3 py-1 text-xs font-bold text-yellow-400">
                          Borrador
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-sm text-gray-300">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>
                        {BLOG_CATEGORIES.find((c) => c.value === post.category)
                          ?.label}
                      </span>
                      <span>{post.tags.length} tags</span>
                      {post.viewCount !== undefined && (
                        <span>{post.viewCount} vistas</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePublished(post)}
                      className="rounded border-2 border-red-900 bg-gray-800 p-2 transition-all hover:bg-gray-700 hover:border-red-700"
                      title={post.published ? "Despublicar" : "Publicar"}
                    >
                      {post.published ? (
                        <EyeOff className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-green-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(post)}
                      className="rounded border-2 border-red-900 bg-gray-800 p-2 transition-all hover:bg-gray-700 hover:border-blue-600"
                      title="Editar"
                    >
                      <Edit className="h-5 w-5 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="rounded border-2 border-red-900 bg-gray-800 p-2 transition-all hover:bg-gray-700 hover:border-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
