import Link from "next/link";

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
                  className="text-gray-600 transition-colors hover:text-red-600"
                >
                  Galería
                </Link>
              </li>
              <li>
                <Link
                  href="/obra-a-pedido"
                  className="text-gray-600 transition-colors hover:text-red-600"
                >
                  Obra a Pedido
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="text-gray-600 transition-colors hover:text-red-600"
                >
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-black">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: info@bruisedart.com</li>
              <li>Instagram: @bruisedart</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t-2 border-black pt-8 text-center text-sm text-gray-600">
          <p>© {currentYear} José Vega. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
