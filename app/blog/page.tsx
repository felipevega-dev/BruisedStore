"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BlogPost, BLOG_CATEGORIES } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag, BookOpen, Loader2, Filter } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, "blogPosts"),
          where("published", "==", true),
          orderBy("publishedAt", "desc")
        );

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
        setFilteredPosts(postsData);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((post) => post.category === selectedCategory));
    }
  }, [selectedCategory, posts]);

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      proceso: "bg-blue-100 text-blue-800 border-blue-800",
      inspiracion: "bg-purple-100 text-purple-800 border-purple-800",
      tecnica: "bg-green-100 text-green-800 border-green-800",
      personal: "bg-yellow-100 text-yellow-800 border-yellow-800",
      exposiciones: "bg-red-100 text-red-800 border-red-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-800";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Blog" }]} />

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <BookOpen className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="mb-4 text-4xl font-black text-gray-900 sm:text-5xl">
            Blog
          </h1>
          <p className="text-lg text-gray-600">
            Historias, procesos y reflexiones del artista
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-lg border-2 px-4 py-2 font-bold transition-all ${
              selectedCategory === "all"
                ? "border-black bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "border-black bg-white text-gray-900 hover:bg-gray-50"
            }`}
          >
            Todos ({posts.length})
          </button>
          {BLOG_CATEGORIES.map((cat) => {
            const count = posts.filter((p) => p.category === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-lg border-2 px-4 py-2 font-bold transition-all ${
                  selectedCategory === cat.value
                    ? "border-black bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "border-black bg-white text-gray-900 hover:bg-gray-50"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="rounded-lg border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p className="text-lg font-bold text-gray-900">
              No hay posts en esta categoría aún
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-lg border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                {/* Cover Image */}
                {post.coverImage && (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`rounded-full border-2 px-3 py-1 text-xs font-bold ${getCategoryColor(
                        post.category
                      )}`}
                    >
                      {BLOG_CATEGORIES.find((c) => c.value === post.category)?.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mb-2 text-xl font-black text-gray-900 group-hover:text-red-600">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="mb-4 line-clamp-3 text-gray-600">{post.excerpt}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span>{post.tags.length} tags</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs font-medium text-gray-500">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
