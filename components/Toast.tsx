"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 flex-shrink-0" />;
      case "error":
        return <XCircle className="h-5 w-5 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 flex-shrink-0" />;
      default:
        return <Info className="h-5 w-5 flex-shrink-0" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "border-green-600 bg-green-50 text-green-900";
      case "error":
        return "border-red-600 bg-red-50 text-red-900";
      case "warning":
        return "border-yellow-600 bg-yellow-50 text-yellow-900";
      default:
        return "border-blue-600 bg-blue-50 text-blue-900";
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-4 right-4 z-[9999] flex items-center gap-3 border-4 px-4 py-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-5 ${getStyles()} max-w-md`}
    >
      {getIcon()}
      <p className="flex-1 text-sm font-bold">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-black/10"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
