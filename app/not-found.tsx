import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4">
      <h1 className="mb-4 text-6xl font-bold text-surface-900">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-surface-700">
        Página no encontrada
      </h2>
      <p className="mb-8 text-surface-600">
        Lo sentimos, la página que buscas no existe.
      </p>
      <Link
        href="/"
        className="rounded-md bg-surface-900 px-6 py-3 text-white transition-colors hover:bg-surface-800"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
