"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { Loader2, Mail, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    
    if (user?.emailVerified) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleResendEmail = async () => {
    if (!user) return;
    
    setSending(true);
    setError("");
    setMessage("");

    try {
      await sendEmailVerification(user);
      setMessage("✅ Email de verificación enviado. Revisa tu bandeja de entrada y spam.");
    } catch (error: any) {
      if (error.code === "auth/too-many-requests") {
        setError("Demasiados intentos. Espera unos minutos antes de intentar nuevamente.");
      } else {
        setError("Error al enviar el email. Intenta de nuevo.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;
    
    setChecking(true);
    setError("");
    setMessage("");

    try {
      await user.reload();
      
      if (user.emailVerified) {
        setMessage("¡Email verificado! Redirigiendo...");
        setTimeout(() => router.push("/"), 1500);
      } else {
        setError("El email aún no ha sido verificado. Revisa tu correo y haz clic en el enlace.");
      }
    } catch (error) {
      setError("Error al verificar. Intenta de nuevo.");
    } finally {
      setChecking(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-yellow-100">
              <Mail className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Verifica tu Email
            </h1>
            <div className="mx-auto mt-3 h-1 w-16 bg-red-600"></div>
          </div>

          {/* Instructions */}
          <div className="mb-6 space-y-3 rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">
              Hemos enviado un correo de verificación a:
            </p>
            <p className="text-sm font-bold text-red-600">
              {user?.email}
            </p>
            <div className="mt-4 space-y-2 text-xs text-gray-700">
              <p className="flex items-start gap-2">
                <span className="mt-0.5">1.</span>
                <span>Revisa tu bandeja de entrada</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-0.5">2.</span>
                <span>Busca un email de José Vega / Firebase</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-0.5">3.</span>
                <span>Haz clic en el enlace de verificación</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-0.5">4.</span>
                <span>Vuelve aquí y haz clic en "Ya verifiqué mi email"</span>
              </p>
            </div>
          </div>

          {/* Spam Warning */}
          <div className="mb-6 rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-yellow-600" />
              <div className="text-xs">
                <p className="font-bold text-yellow-900">
                  ⚠️ No encuentras el email?
                </p>
                <p className="mt-1 text-yellow-800">
                  Revisa tu carpeta de <strong>SPAM</strong> o <strong>Correo no deseado</strong>. 
                  A veces los correos automáticos terminan ahí.
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-4 rounded-lg border-2 border-green-600 bg-green-50 p-3 text-sm font-semibold text-green-600">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 rounded-lg border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleCheckVerification}
              disabled={checking}
              className="w-full rounded-lg border-2 border-black bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checking ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Ya verifiqué mi email
                </span>
              )}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={sending}
              className="w-full rounded-lg border-2 border-black bg-white px-6 py-3 font-bold text-gray-900 transition-all hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Reenviar email de verificación
                </span>
              )}
            </button>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-gray-600 hover:text-red-600"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
