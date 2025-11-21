import Link from "next/link";
import { Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-black bg-white">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-black">
              José Vega
            </h3>
            <p className="text-sm text-gray-600">
              Galería de arte online especializada en pinturas únicas y obras
              personalizadas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-black">
              Enlaces
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 transition-colors hover:text-primary-600"
                >
                  Galería
                </Link>
              </li>
              <li>
                <Link
                  href="/obra-a-pedido"
                  className="text-gray-600 transition-colors hover:text-primary-600"
                >
                  Obra a Pedido
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="text-gray-600 transition-colors hover:text-primary-600"
                >
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-black">
              Contacto & Redes Sociales
            </h3>
            <ul className="mb-4 space-y-2 text-sm text-gray-600">
              <li>Email: info@bruisedart.com</li>
              <li>Instagram: @joseriop</li>
            </ul>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/joseriop"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white transition-all hover:bg-pink-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-black transition-colors group-hover:text-white" />
              </a>
              <a
                href="https://www.tiktok.com/@josevegaart"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white transition-all hover:bg-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                aria-label="TikTok"
              >
                <svg
                  className="h-5 w-5 text-black transition-colors group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t-2 border-black pt-8 text-center text-sm text-gray-600">
          <p>© {currentYear} José Vega. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
