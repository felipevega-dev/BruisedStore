import { Metadata } from 'next';

const siteConfig = {
  name: 'Bruised Art',
  description: 'Galería de arte online. Descubre pinturas únicas y obras personalizadas. Cada trazo cuenta una historia.',
  url: 'https://bruisedart.com', // Actualizar con tu dominio real
  ogImage: '/og-image.jpg', // Crear esta imagen
  links: {
    instagram: 'https://instagram.com/bruisedart',
    facebook: 'https://facebook.com/bruisedart',
  },
};

export function generateSiteMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
      'arte',
      'pinturas',
      'galería',
      'arte chileno',
      'obras personalizadas',
      'cuadros',
      'arte contemporáneo',
      'abstracto',
      'retrato',
      'paisaje',
    ],
    authors: [{ name: 'Bruised Art' }],
    creator: 'Bruised Art',
    openGraph: {
      type: 'website',
      locale: 'es_CL',
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generatePaintingMetadata(painting: {
  title: string;
  description?: string;
  imageUrl: string;
  price: number;
  dimensions: { width: number; height: number };
  category?: string;
}): Metadata {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  const description = painting.description || `${painting.title} - Pintura original disponible en Bruised Art`;
  const fullTitle = `${painting.title} - ${formatPrice(painting.price)}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'article',
      images: [
        {
          url: painting.imageUrl,
          width: 1200,
          height: 1200,
          alt: painting.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [painting.imageUrl],
    },
  };
}

export function generatePageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}${path}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}

// JSON-LD Schema para productos
export function generateProductSchema(painting: {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  price: number;
  dimensions: { width: number; height: number };
  available: boolean;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: painting.title,
    description: painting.description || `${painting.title} - Pintura original`,
    image: painting.imageUrl,
    brand: {
      '@type': 'Brand',
      name: 'Bruised Art',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteConfig.url}/obra/${painting.id}`,
      priceCurrency: 'CLP',
      price: painting.price,
      availability: painting.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Dimensiones',
        value: `${painting.dimensions.width}x${painting.dimensions.height} cm`,
      },
      ...(painting.category
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Categoría',
              value: painting.category,
            },
          ]
        : []),
    ],
  };
}

// JSON-LD Schema para organización
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ArtGallery',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [siteConfig.links.instagram, siteConfig.links.facebook],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CL',
    },
  };
}

export { siteConfig };
