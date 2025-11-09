import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generatePaintingMetadata } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const docRef = doc(db, 'paintings', params.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const painting = {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        price: data.price,
        dimensions: data.dimensions,
        category: data.category,
      };

      return generatePaintingMetadata(painting);
    }
  } catch (error) {
    console.error('Error fetching painting for metadata:', error);
  }

  // Fallback metadata
  return {
    title: 'Obra de Arte',
    description: 'Descubre esta obra única de José Vega',
  };
}
