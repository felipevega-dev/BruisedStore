import { Metadata } from 'next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;

  // Fetch blog post
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('slug', '==', slug),
      where('published', '==', true)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        title: 'Post no encontrado - José Vega Art',
      };
    }

    const postDoc = querySnapshot.docs[0];
    const post = postDoc.data();

    return {
      title: `${post.title} - Blog José Vega Art`,
      description: post.excerpt,
      keywords: [...post.tags, 'José Vega', 'arte', 'blog'],
      authors: [{ name: 'José Vega' }],
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        url: `https://bruisedart.com/blog/${slug}`,
        siteName: 'José Vega Art',
        locale: 'es_CL',
        images: post.coverImage
          ? [
              {
                url: post.coverImage,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ]
          : [],
        publishedTime: post.publishedAt?.toDate().toISOString(),
        modifiedTime: post.updatedAt?.toDate().toISOString(),
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: post.coverImage ? [post.coverImage] : [],
      },
      alternates: {
        canonical: `https://bruisedart.com/blog/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog - José Vega Art',
    };
  }
}
