import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-red-900/30 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-red-100">
              Bruised Art
            </h3>
            <p className="text-sm text-gray-400">
              Galería de arte online especializada en pinturas únicas y obras
              personalizadas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-red-100">
              Enlaces
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 transition-colors hover:text-red-400"
                >
                  Galería
                </Link>
              </li>
              <li>
                <Link
                  href="/obra-a-pedido"
                  className="text-gray-400 transition-colors hover:text-red-400"
                >
                  Obra a Pedido
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="text-gray-400 transition-colors hover:text-red-400"
                >
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-red-100">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@bruisedart.com</li>
              <li>Instagram: @bruisedart</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-red-900/30 pt-8 text-center text-sm text-gray-400">
          <p>© {currentYear} Bruised Art. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
