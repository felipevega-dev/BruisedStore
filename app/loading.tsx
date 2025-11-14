import { Loader2, Palette } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-moss-50 via-white to-slate-100">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-ping">
            <Palette className="mx-auto h-16 w-16 text-moss-600 opacity-20" />
          </div>
          <Palette className="relative mx-auto h-16 w-16 text-moss-600" />
        </div>
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-moss-500" />
        <div className="inline-block rounded-2xl border border-moss-200 bg-white/90 px-6 py-3 shadow-lg shadow-moss-900/10 backdrop-blur">
          <p className="text-xl font-semibold text-slate-900">Cargando...</p>
        </div>
      </div>
    </div>
  );
}
