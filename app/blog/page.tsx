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
      personal: "bg-terra-100 text-terra-800 border-terra-800",
      exposiciones: "bg-moss-100 text-moss-800 border-terra-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-800";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-slate-50 to-blue-50">
        <div className="rounded-lg border-4 border-black bg-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-slate-50 to-blue-50 py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Blog" }]} />

        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mb-3 flex justify-center sm:mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-black bg-linear-to-br from-primary-500 to-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:h-16 sm:w-16">
              <BookOpen className="h-7 w-7 text-white sm:h-8 sm:w-8" />
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-black text-slate-900 sm:mb-4 sm:text-5xl">
            Blog
          </h1>
          <p className="text-base text-slate-600 sm:text-lg">
            Historias, procesos y reflexiones del artista
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:mb-8">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-lg border-2 px-3 py-1.5 text-xs font-black transition-all sm:px-4 sm:py-2 sm:text-sm ${
              selectedCategory === "all"
                ? "border-black bg-primary-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                : "border-black bg-white text-slate-900 hover:bg-blue-50"
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
                className={`rounded-lg border-2 px-3 py-1.5 text-xs font-black transition-all sm:px-4 sm:py-2 sm:text-sm ${
                  selectedCategory === cat.value
                    ? "border-black bg-primary-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    : "border-black bg-white text-slate-900 hover:bg-blue-50"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-slate-100">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-black text-slate-900 sm:text-lg">
              No hay posts en esta categoría aún
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-lg border-4 border-black bg-linear-to-br from-blue-50 to-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                {/* Cover Image */}
                {post.coverImage && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t border-b-4 border-black">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  {/* Category Badge */}
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-lg border-2 px-2.5 py-1 text-xs font-black ${getCategoryColor(
                        post.category
                      )}`}
                    >
                      {BLOG_CATEGORIES.find((c) => c.value === post.category)?.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mb-2 text-lg font-black text-slate-900 group-hover:text-primary-600 sm:text-xl">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="mb-3 line-clamp-2 flex-1 text-sm text-slate-600 sm:line-clamp-3">{post.excerpt}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 sm:gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        <span>{post.tags.length} tags</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="rounded border-2 border-slate-300 bg-white px-2 py-0.5 text-xs font-bold text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs font-bold text-slate-500">
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
