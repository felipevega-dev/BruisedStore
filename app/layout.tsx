import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { MusicProvider } from "@/contexts/MusicContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import BackgroundMusic from "@/components/BackgroundMusic";
import MusicBarSpacer from "@/components/MusicBarSpacer";
import ErrorBoundary from "@/components/ErrorBoundary";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { generateSiteMetadata, generateOrganizationSchema } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...generateSiteMetadata(),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'José Vega Art',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#5B7F2D', // Moss Base
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <MusicProvider>
                  <div className="flex min-h-screen flex-col" suppressHydrationWarning>
                    <BackgroundMusic />
                    <Header />
                    <MusicBarSpacer />
                    <main className="flex-1">
                      <ErrorBoundary>{children}</ErrorBoundary>
                    </main>
                    <Footer />
                    <WhatsAppWidget />
                    <PWAInstallPrompt />
                  </div>
                </MusicProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
