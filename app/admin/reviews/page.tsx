"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Review } from "@/types";
import Link from "next/link";
import { ArrowLeft, Star, Check, X, Trash2, Loader2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { AdminLogHelpers, logAdminAction } from "@/lib/adminLogs";

export default function AdminReviewsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    const reviewsQuery = query(
      collection(db, "reviews"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Review;
      });
      setReviews(reviewsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (reviewId: string) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      
      await updateDoc(doc(db, "reviews", reviewId), {
        approved: true,
      });
      
      // Registrar log de actividad
      if (user?.email && user?.uid && review) {
        await AdminLogHelpers.logReviewApproved(
          user.email,
          user.uid,
          reviewId,
          review.userName
        );
      }
      
      showToast("Reseña aprobada exitosamente", "success");
    } catch (error) {
      console.error("Error approving review:", error);
      showToast("Error al aprobar reseña", "error");
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      
      await updateDoc(doc(db, "reviews", reviewId), {
        approved: false,
      });
      
      // Registrar log de actividad
      if (user?.email && user?.uid && review) {
        await AdminLogHelpers.logReviewRejected(
          user.email,
          user.uid,
          reviewId,
          review.userName
        );
      }
      
      showToast("Reseña ocultada", "info");
    } catch (error) {
      console.error("Error rejecting review:", error);
      showToast("Error al ocultar reseña", "error");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta reseña?")) {
      return;
    }

    try {
      const review = reviews.find(r => r.id === reviewId);
      
      await deleteDoc(doc(db, "reviews", reviewId));
      
      // Registrar log de actividad
      if (user?.email && user?.uid && review) {
        await AdminLogHelpers.logReviewDeleted(
          user.email,
          user.uid,
          reviewId,
          review.userName
        );
      }
      
      showToast("Reseña eliminada exitosamente", "success");
    } catch (error) {
      console.error("Error deleting review:", error);
      showToast("Error al eliminar reseña", "error");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "pending") return !review.approved;
    if (filter === "approved") return review.approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;
  const approvedCount = reviews.filter((r) => r.approved).length;

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= count
                ? "fill-terra-400 text-terra-400"
                : "fill-gray-200 text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-moss-600" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/admin"
            className="text-gray-700 transition-colors hover:text-moss-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Moderación de Reseñas
          </h1>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Total Reseñas
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {reviews.length}
                </p>
              </div>
              <MessageCircle className="h-12 w-12 text-gray-400" />
            </div>
          </div>

          <div className="rounded-lg border-4 border-black bg-terra-100 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-terra-800">
                  Pendientes
                </p>
                <p className="text-3xl font-bold text-terra-900">
                  {pendingCount}
                </p>
              </div>
              <MessageCircle className="h-12 w-12 text-terra-400" />
            </div>
          </div>

          <div className="rounded-lg border-4 border-black bg-green-50 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-800">
                  Aprobadas
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {approvedCount}
                </p>
              </div>
              <Check className="h-12 w-12 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg border-2 border-black px-4 py-2 font-bold transition-all ${
              filter === "all"
                ? "bg-moss-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Todas ({reviews.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`rounded-lg border-2 border-black px-4 py-2 font-bold transition-all ${
              filter === "pending"
                ? "bg-terra-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`rounded-lg border-2 border-black px-4 py-2 font-bold transition-all ${
              filter === "approved"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Aprobadas ({approvedCount})
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="rounded-lg border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="text-lg font-bold text-gray-900">
                No hay reseñas para mostrar
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`rounded-lg border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
                  review.approved ? "bg-white" : "bg-terra-100"
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {review.userName}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          review.approved
                            ? "bg-green-100 text-green-800"
                            : "bg-terra-100 text-terra-800"
                        }`}
                      >
                        {review.approved ? "Aprobada" : "Pendiente"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{review.userEmail}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">ID Obra:</p>
                  <Link
                    href={`/obra/${review.paintingId}`}
                    className="text-sm text-moss-600 hover:underline"
                  >
                    {review.paintingId}
                  </Link>
                </div>

                <p className="mb-4 text-gray-700">{review.comment}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="flex items-center gap-2 rounded-lg border-2 border-black bg-green-600 px-4 py-2 font-bold text-white transition-all hover:bg-green-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Check className="h-4 w-4" />
                      <span>Aprobar</span>
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => handleReject(review.id)}
                      className="flex items-center gap-2 rounded-lg border-2 border-black bg-terra-500 px-4 py-2 font-bold text-white transition-all hover:bg-terra-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <X className="h-4 w-4" />
                      <span>Ocultar</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex items-center gap-2 rounded-lg border-2 border-black bg-moss-500 px-4 py-2 font-bold text-white transition-all hover:bg-moss-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
}
