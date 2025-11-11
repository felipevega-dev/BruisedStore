import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - José Vega Art',
  description: 'Historias, procesos creativos y reflexiones del artista José Vega. Descubre el proceso detrás de cada obra y la inspiración del arte contemporáneo chileno.',
  keywords: [
    'blog arte',
    'proceso creativo',
    'artista chileno',
    'José Vega',
    'arte contemporáneo',
    'pintura',
    'técnicas artísticas',
    'inspiración artística',
  ],
  openGraph: {
    title: 'Blog - José Vega Art',
    description: 'Historias, procesos creativos y reflexiones del artista José Vega',
    type: 'website',
    url: 'https://bruisedart.com/blog',
    siteName: 'José Vega Art',
    locale: 'es_CL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - José Vega Art',
    description: 'Historias, procesos creativos y reflexiones del artista',
  },
  alternates: {
    canonical: 'https://bruisedart.com/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
