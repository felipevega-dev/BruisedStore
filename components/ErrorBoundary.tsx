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

      // Default error UI with brutalist design
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black px-4 py-8">
          <div className="w-full max-w-2xl rounded-lg border-4 border-red-600 bg-black p-6 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] sm:p-8">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="rounded-full border-4 border-red-600 bg-red-950 p-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-center text-3xl font-black text-red-100 sm:text-4xl">
              ¡Algo salió mal!
            </h1>

            {/* Description */}
            <p className="mb-6 text-center text-base text-red-300 sm:text-lg">
              Lo sentimos, ocurrió un error inesperado. Por favor intenta nuevamente.
            </p>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 overflow-auto rounded-lg border-2 border-red-900 bg-red-950/50 p-4">
                <p className="mb-2 font-mono text-sm font-bold text-red-400">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-red-300">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 rounded-lg border-4 border-red-600 bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
              >
                <RefreshCcw className="h-5 w-5" />
                Intentar de nuevo
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 rounded-lg border-4 border-red-900 bg-red-950 px-6 py-3 font-bold text-red-100 transition-all hover:bg-red-900 hover:shadow-[4px_4px_0px_0px_rgba(127,29,29,1)]"
              >
                <RefreshCcw className="h-5 w-5" />
                Recargar página
              </button>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-lg border-4 border-white bg-white px-6 py-3 font-bold text-black transition-all hover:bg-gray-100 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                <Home className="h-5 w-5" />
                Ir al inicio
              </Link>
            </div>

            {/* Support link */}
            <p className="mt-6 text-center text-sm text-red-400">
              Si el problema persiste, contáctanos vía{" "}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:text-red-300"
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
