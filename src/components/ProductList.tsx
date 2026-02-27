'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts } from '@/lib/api/products';
import { addFavorite, removeFavorite, getFavorites } from '@/lib/api/favorites';
import { createNegotiation } from '@/lib/api/negotiations';

interface Product {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  specifications: Record<string, string>;
  images: { id: string; url: string; order: number }[];
  organization: {
    name: string;
  };
  createdBy: {
    name: string;
  };
}

const ProductList = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [productsRes, favoritesData] = await Promise.all([
          getProducts({ type: typeFilter || undefined }) as Promise<{ products: Product[]; pagination: any }>,
          getFavorites() as Promise<{ id: string; productId: string }[]>,
        ]);
        setProducts(productsRes.products || []);
        setFavoriteIds(new Set(favoritesData.map(f => f.productId)));
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [typeFilter]);

  const handleToggleFavorite = async (productId: string) => {
    try {
      if (favoriteIds.has(productId)) {
        await removeFavorite(productId);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await addFavorite(productId);
        setFavoriteIds(prev => new Set(prev).add(productId));
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleStartNegotiation = async (product: Product) => {
    try {
      const room = await createNegotiation({
        productId: product.id,
        deliveryType: 'DELIVERY',
        requestedQty: 100,
        deliveryDate: new Date().toISOString(),
      }) as { id: string };
      router.push(`/dashboard/chat/${room.id}`);
    } catch (err) {
      console.error('Failed to create negotiation:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('products.title')}</h1>
        <div className="flex space-x-4">
          <select
            className="border rounded-lg px-4 py-2"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">{t('products.filters.allProducts')}</option>
            <option value="soy">{t('products.filters.grains')}</option>
            <option value="coffee">{t('products.filters.coffee')}</option>
            <option value="fruit">{t('products.filters.fruits')}</option>
          </select>
          <select
            className="border rounded-lg px-4 py-2"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">{t('products.filters.allRegions')}</option>
            <option value="north">{t('products.filters.north')}</option>
            <option value="northeast">{t('products.filters.northeast')}</option>
            <option value="midwest">{t('products.filters.midwest')}</option>
            <option value="southeast">{t('products.filters.southeast')}</option>
            <option value="south">{t('products.filters.south')}</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('products.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isFav = favoriteIds.has(product.id);
            const imageUrl = product.images?.[0]?.url || '/images/placeholder-product.jpg';
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden group">
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-48 w-full object-cover"
                  />
                  <button
                    onClick={() => handleToggleFavorite(product.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                      isFav
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-400 group-hover:text-red-500'
                    }`}
                    aria-label={isFav ? t('products.unfavorite') : t('products.favorite')}
                  >
                    <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-gray-600">{product.organization?.name}</p>
                  </div>

                  <p className="mt-2 text-gray-500">{product.location}</p>

                  <div className="mt-4">
                    <p className="text-lg font-semibold text-gray-900">
                      R$ {Number(product.price).toFixed(2)}/{product.unit || 'saca'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('common.available')}: {product.quantity} {product.unit || 'sacas'}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <Link
                      href={`/dashboard/product/${product.id}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      {t('common.details')}
                    </Link>
                    <button
                      onClick={() => handleStartNegotiation(product)}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{t('common.chat')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;
