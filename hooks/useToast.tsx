"use client";

import { useState, useCallback } from "react";
import Toast, { ToastType } from "@/components/Toast";

interface ToastState {
  id: string;
  message: string;
  type: ToastType;
}

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${toastCounter++}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const ToastContainer = useCallback(() => {
    return (
      <>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </>
    );
  }, [toasts, removeToast]);

  return {
    showToast,
    ToastContainer,
  };
}
