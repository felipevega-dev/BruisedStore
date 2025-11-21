"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console (in production, send to error tracking service)
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with nature-inspired design
      return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-surface-100 via-white to-primary-50 px-4 py-8">
          <div className="w-full max-w-2xl rounded-2xl border border-primary-200 bg-white/95 p-6 shadow-xl shadow-primary-900/10 backdrop-blur sm:p-8">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="rounded-full border border-primary-200 bg-primary-50 p-4 shadow-inner shadow-primary-200/70">
                <AlertTriangle className="h-12 w-12 text-primary-500" />
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-center text-3xl font-semibold text-slate-900 sm:text-4xl">
              ¡Algo salió mal!
            </h1>

            {/* Description */}
            <p className="mb-6 text-center text-base text-slate-600 sm:text-lg">
              Lo sentimos, ocurrió un error inesperado. Por favor intenta nuevamente.
            </p>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 overflow-auto rounded-xl border border-orange-200 bg-orange-50/80 p-4">
                <p className="mb-2 font-mono text-sm font-semibold text-orange-600">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-orange-500">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-500 to-primary-400 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-900/10 transition hover:shadow-xl"
              >
                <RefreshCcw className="h-5 w-5" />
                Intentar de nuevo
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-secondary-500 to-secondary-400 px-6 py-3 font-semibold text-white shadow-lg shadow-secondary-900/10 transition hover:shadow-xl"
              >
                <RefreshCcw className="h-5 w-5" />
                Recargar página
              </button>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg shadow-primary-900/10 transition hover:border-primary-300 hover:shadow-none"
              >
                <Home className="h-5 w-5" />
                Ir al inicio
              </Link>
            </div>

            {/* Support link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Si el problema persiste, contáctanos vía{" "}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-600 underline hover:text-primary-700"
              >
                WhatsApp
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
