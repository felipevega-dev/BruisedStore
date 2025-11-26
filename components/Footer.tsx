import Link from "next/link";
import { Instagram, Mail, Palette, ShoppingBag, Sparkles } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-black bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Main Content */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border-4 border-white bg-linear-to-br from-primary-500 to-blue-600 px-4 py-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              <Palette className="h-5 w-5 text-white" />
              <h3 className="text-xl font-black text-white">José Vega</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Galería de arte online especializada en pinturas únicas y obras personalizadas. 
              Cada pieza cuenta una historia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-black uppercase tracking-wide text-white sm:mb-4">
              <Sparkles className="h-4 w-4" />
              Explorar
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition-colors hover:text-primary-400"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-500 transition-all group-hover:w-2"></span>
                  Galería
                </Link>
              </li>
              <li>
                <Link
                  href="/obra-a-pedido"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition-colors hover:text-primary-400"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-500 transition-all group-hover:w-2"></span>
                  Obra a Pedido
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition-colors hover:text-primary-400"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-500 transition-all group-hover:w-2"></span>
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition-colors hover:text-primary-400"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-500 transition-all group-hover:w-2"></span>
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-black uppercase tracking-wide text-white sm:mb-4">
              <ShoppingBag className="h-4 w-4" />
              Mi Cuenta
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/profile"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition-colors hover:text-primary-400"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-500 transition-all group-hover:w-2"></span>
                  Perfil
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition-colors hover:text-primary-400"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-500 transition-all group-hover:w-2"></span>
                  Lista de Deseos
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition-colors hover:text-primary-400"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-500 transition-all group-hover:w-2"></span>
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-black uppercase tracking-wide text-white sm:mb-4">
              <Mail className="h-4 w-4" />
              Contacto
            </h3>
            <ul className="mb-4 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary-400" />
                <a href="mailto:info@bruisedart.com" className="font-bold hover:text-primary-400 transition-colors">
                  info@bruisedart.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-3.5 w-3.5 text-primary-400" />
                <a href="https://www.instagram.com/joseriop" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary-400 transition-colors">
                  @joseriop
                </a>
              </li>
            </ul>
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/joseriop"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-lg border-4 border-white bg-linear-to-br from-pink-500 to-purple-600 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://www.tiktok.com/@josevegaart"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-lg border-4 border-white bg-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                aria-label="TikTok"
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t-4 border-slate-700 pt-6 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-xs font-bold text-slate-400 sm:text-left sm:text-sm">
              © {currentYear} <span className="text-white">José Vega</span>. Todos los derechos reservados.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Hecho con</span>
                <span className="text-red-500">♥</span>
                <span className="text-xs font-bold text-slate-400">en Chile</span>
              </div>
              <div className="h-px w-12 bg-slate-700 hidden sm:block"></div>
              <a
                href="https://felipevegadev.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-xs font-bold text-slate-400 transition-colors hover:text-primary-400"
              >
                <span>Desarrollado por</span>
                <span className="text-white group-hover:text-primary-400">Felipe Vega</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
