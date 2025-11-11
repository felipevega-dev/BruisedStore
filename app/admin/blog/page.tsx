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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("La imagen no debe superar 5MB", "error");
        return;
      }
      setCoverImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverImagePreview(previewUrl);
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-red-600" />
            <h1 className="text-4xl font-black text-gray-900">
              Administrar Blog
            </h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg border-4 border-black bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="h-5 w-5" />
              Nuevo Post
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-6 text-2xl font-black text-gray-900">
              {editingPost ? "Editar Post" : "Crear Nuevo Post"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="mb-2 block font-bold text-gray-900">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full rounded-lg border-4 border-black bg-white px-4 py-3 font-bold text-gray-900 focus:border-red-600 focus:outline-none"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block font-bold text-gray-900">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-lg border-4 border-black bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900"
                  readOnly
                />
                <p className="mt-1 text-sm text-gray-600">
                  URL: /blog/{formData.slug || "tu-post"}
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="mb-2 block font-bold text-gray-900">
                  Extracto *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border-4 border-black bg-white px-4 py-3 font-bold text-gray-900 focus:border-red-600 focus:outline-none"
                  required
                />
                <p className="mt-1 text-sm text-gray-600">
                  Descripción corta para las tarjetas del blog
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block font-bold text-gray-900">
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
                  className="w-full rounded-lg border-4 border-black bg-white px-4 py-3 font-bold text-gray-900 focus:border-red-600 focus:outline-none"
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
                <label className="mb-2 block font-bold text-gray-900">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="acuarela, abstracto, naturaleza"
                  className="w-full rounded-lg border-4 border-black bg-white px-4 py-3 font-bold text-gray-900 focus:border-red-600 focus:outline-none"
                />
                <p className="mt-1 text-sm text-gray-600">
                  Separados por comas
                </p>
              </div>

              {/* Cover Image */}
              <div>
                <label className="mb-2 block font-bold text-gray-900">
                  Imagen de Portada
                </label>
                {coverImagePreview && (
                  <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border-4 border-black">
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
                      className="absolute right-2 top-2 rounded-full border-2 border-black bg-red-600 p-2 text-white transition-all hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-4 border-black bg-white px-6 py-3 font-bold text-gray-900 transition-all hover:bg-gray-50">
                  <ImageIcon className="h-5 w-5" />
                  {coverImagePreview ? "Cambiar Imagen" : "Subir Imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  Máximo 5MB. Tamaño recomendado: 1200x630px
                </p>
              </div>

              {/* Content Editor */}
              <div>
                <label className="mb-2 block font-bold text-gray-900">
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
                  className="h-6 w-6 rounded border-4 border-black accent-red-600"
                />
                <label htmlFor="published" className="font-bold text-gray-900">
                  Publicar inmediatamente
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg border-4 border-black bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50"
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
                  className="rounded-lg border-4 border-black bg-white px-6 py-3 font-bold text-gray-900 transition-all hover:bg-gray-50"
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
              <div className="rounded-lg border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">
                  No hay posts aún
                </p>
                <p className="text-gray-600">
                  Crea tu primer post para comenzar
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 rounded-lg border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                  {/* Cover Image */}
                  {post.coverImage && (
                    <div className="aspect-video w-32 overflow-hidden rounded border-2 border-black">
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
                      <h3 className="text-xl font-black text-gray-900">
                        {post.title}
                      </h3>
                      {post.published ? (
                        <span className="rounded-full border-2 border-green-800 bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                          Publicado
                        </span>
                      ) : (
                        <span className="rounded-full border-2 border-gray-800 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-800">
                          Borrador
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-sm text-gray-600">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
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
                      className="rounded border-2 border-black bg-white p-2 transition-all hover:bg-gray-50"
                      title={post.published ? "Despublicar" : "Publicar"}
                    >
                      {post.published ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(post)}
                      className="rounded border-2 border-black bg-white p-2 transition-all hover:bg-blue-50"
                      title="Editar"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="rounded border-2 border-black bg-white p-2 transition-all hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
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
