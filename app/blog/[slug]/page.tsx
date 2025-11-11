"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BlogPost, BLOG_CATEGORIES } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag, ArrowLeft, Clock, Loader2, User } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(
          collection(db, "blogPosts"),
          where("slug", "==", slug),
          where("published", "==", true)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("Post no encontrado");
          setLoading(false);
          return;
        }

        const postDoc = querySnapshot.docs[0];
        const data = postDoc.data();

        const postData: BlogPost = {
          id: postDoc.id,
          ...data,
          publishedAt: data.publishedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as BlogPost;

        setPost(postData);

        // Increment view count
        await updateDoc(doc(db, "blogPosts", postDoc.id), {
          viewCount: increment(1),
        });
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError("Error al cargar el post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

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

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min de lectura`;
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

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="max-w-md border-4 border-black bg-white p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="mb-4 text-2xl font-black text-gray-900">
            {error || "Post no encontrado"}
          </h1>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-2 font-bold transition-all hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Blog
          </Link>
        </div>
      </div>
    );
  }

  // Generate JSON-LD for SEO
  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage,
        author: {
          '@type': 'Person',
          name: 'José Vega',
        },
        publisher: {
          '@type': 'Organization',
          name: 'José Vega Art',
          logo: {
            '@type': 'ImageObject',
            url: 'https://bruisedart.com/logo.png',
          },
        },
        datePublished: post.publishedAt?.toISOString(),
        dateModified: post.updatedAt?.toISOString(),
        keywords: post.tags.join(', '),
      }
    : null;

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      {/* JSON-LD for SEO */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.title },
          ]}
        />

        {/* Back Button */}
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-2 font-bold transition-all hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Blog
        </Link>

        {/* Post Content */}
        <article className="mx-auto max-w-4xl">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-8 overflow-hidden rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="relative aspect-[21/9] w-full">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Header */}
          <header className="mb-8">
            {/* Category */}
            <div className="mb-4">
              <span
                className={`inline-block rounded-full border-2 px-4 py-2 text-sm font-bold ${getCategoryColor(
                  post.category
                )}`}
              >
                {BLOG_CATEGORIES.find((c) => c.value === post.category)?.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-black text-gray-900 sm:text-5xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="mb-6 text-xl text-gray-600">{post.excerpt}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 border-b-2 border-t-2 border-black py-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-bold">José Vega</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{estimateReadTime(post.content)}</span>
              </div>
              {post.viewCount && (
                <span className="ml-auto font-bold text-gray-500">
                  {post.viewCount} vistas
                </span>
              )}
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-black prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-700 prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-lg prose-img:border-4 prose-img:border-black"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share Buttons */}
          <div className="my-12">
            <ShareButtons
              url={`/blog/${post.slug}`}
              title={post.title}
              imageUrl={post.coverImage}
            />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 border-t-2 border-black pt-8">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-black text-gray-900">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-lg border-2 border-black bg-gray-50 px-4 py-2 font-bold text-gray-700 transition-all hover:bg-gray-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver Más Posts
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
