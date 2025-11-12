import { Loader2, Palette } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-black">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-ping">
            <Palette className="mx-auto h-16 w-16 text-red-600 opacity-20" />
          </div>
          <Palette className="relative mx-auto h-16 w-16 text-red-600" />
        </div>
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-red-500" />
        <div className="inline-block rounded-lg border-4 border-red-900 bg-black/60 px-6 py-3 backdrop-blur-sm">
          <p className="text-xl font-black text-red-100">Cargando...</p>
        </div>
      </div>
    </div>
  );
}
