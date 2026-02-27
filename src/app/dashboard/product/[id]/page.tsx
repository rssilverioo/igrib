'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ProductDetails from '@/components/ProductDetails';
import { getProduct } from '@/lib/api/products';
import { getFavorites } from '@/lib/api/favorites';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [productData, favoritesData] = await Promise.all([
          getProduct(productId),
          getFavorites() as Promise<{ productId: string }[]>,
        ]);
        setProduct(productData);
        setIsFavorited(favoritesData.some(f => f.productId === productId));
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) load();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Product not found.</p>
      </div>
    );
  }

  return <ProductDetails product={product} isFavorited={isFavorited} />;
}
