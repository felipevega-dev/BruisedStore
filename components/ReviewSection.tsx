"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Review } from "@/types";
import { Star, Send, MessageCircle, Loader2, AlertCircle } from "lucide-react";

interface ReviewSectionProps {
  paintingId: string;
}

export default function ReviewSection({ paintingId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [paintingId, user]);

  const fetchReviews = async () => {
    try {
      // Obtener todas las reseñas del painting
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("paintingId", "==", paintingId)
      );
      const snapshot = await getDocs(reviewsQuery);
      const reviewsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Review;
      });
      
      // Filtrar y ordenar en el cliente
      const filteredReviews = reviewsData
        .filter((review) => {
          // Si el usuario es el autor, puede ver su propia reseña
          if (user && review.userId === user.uid) {
            return true;
          }
          // Todos pueden ver las aprobadas
          return review.approved;
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setReviews(filteredReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("Debes iniciar sesión para dejar una reseña");
      return;
    }

    if (rating === 0) {
      setError("Por favor selecciona una calificación");
      return;
    }

    if (comment.trim().length < 10) {
      setError("El comentario debe tener al menos 10 caracteres");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await addDoc(collection(db, "reviews"), {
        paintingId,
        userId: user.uid,
        userName: user.displayName || "Usuario",
        userEmail: user.email,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
        approved: false, // Requiere aprobación del admin
      });

      setSuccess("¡Reseña enviada! Ya puedes verla abajo. Será visible para todos una vez aprobada por el administrador.");
      setRating(0);
      setComment("");
      
      // Recargar reseñas para mostrar la nueva (el usuario verá la suya aunque no esté aprobada)
      await fetchReviews();
      
      // Resetear mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Error al enviar la reseña. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const renderStars = (count: number, interactive = false, size = "h-5 w-5") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={`${interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}`}
          >
            <Star
              className={`${size} ${
                star <= (interactive ? hoveredRating || rating : count)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* Header con promedio */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Reseñas</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-lg font-semibold text-gray-700">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Formulario de nueva reseña */}
      {user ? (
        <div className="rounded-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Deja tu reseña
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating selector */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Calificación
              </label>
              {renderStars(rating, true, "h-8 w-8")}
            </div>

            {/* Comment textarea */}
            <div>
              <label
                htmlFor="comment"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Comentario
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full rounded-lg border-2 border-gray-300 p-3 font-medium transition-colors focus:border-black focus:outline-none"
                placeholder="Cuéntanos tu experiencia con esta obra..."
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 10 caracteres
              </p>
            </div>

            {/* Error/Success messages */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                <MessageCircle className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || rating === 0 || comment.trim().length < 10}
              className="flex items-center gap-2 rounded-lg border-2 border-black bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Enviar Reseña</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-lg border-4 border-black bg-gray-50 p-6 text-center">
          <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="mb-4 font-semibold text-gray-700">
            Inicia sesión para dejar una reseña
          </p>
          <a
            href="/login"
            className="inline-block rounded-lg border-2 border-black bg-red-600 px-6 py-2 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Iniciar Sesión
          </a>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center">
            <MessageCircle className="mx-auto mb-3 h-16 w-16 text-gray-300" />
            <p className="text-lg font-bold text-gray-900">
              Aún no hay reseñas
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Sé el primero en compartir tu opinión
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-lg border-2 p-6 transition-all ${
                !review.approved
                  ? "border-yellow-400 bg-yellow-50 hover:border-yellow-500"
                  : "border-gray-300 bg-white hover:border-black"
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{review.userName}</p>
                    {!review.approved && (
                      <span className="inline-flex items-center gap-1 rounded-full border-2 border-yellow-600 bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                        <span className="animate-pulse">⏳</span>
                        Pendiente de aprobación
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="text-gray-700">{review.comment}</p>
              {!review.approved && user?.uid === review.userId && (
                <div className="mt-3 rounded-md border-2 border-yellow-400 bg-yellow-50 p-3">
                  <p className="text-xs font-semibold text-yellow-800">
                    💡 Tu reseña está siendo revisada. Será visible para todos una vez que el administrador la apruebe.
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
