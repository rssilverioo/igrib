'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Star, Heart, Loader2 } from 'lucide-react';
import { getFavorites, removeFavorite as removeFavoriteAPI } from '@/lib/api/favorites';

interface FavoriteItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    description: string;
    type: string;
    price: number;
    quantity: number;
    unit: string;
    location: string;
    images: { url: string }[];
    organization: { name: string };
  };
}

const Favorites = () => {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getFavorites() as FavoriteItem[];
        setFavorites(data);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await removeFavoriteAPI(productId);
      setFavorites(prev => prev.filter(f => f.productId !== productId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('favorites.empty.title')}
        </h2>
        <p className="text-gray-600">
          {t('favorites.empty.description')}
        </p>
        <Link
          href="/dashboard/buy"
          className="mt-6 inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          {t('common.explore')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('favorites.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((fav) => {
          const product = fav.product;
          const imageUrl = product.images?.[0]?.url || '/images/placeholder-product.jpg';
          return (
            <div key={fav.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src={imageUrl}
                alt={product.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-gray-600">{product.organization?.name}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(product.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </button>
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
                  <Link
                    href={`/dashboard/product/${product.id}`}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>{t('common.chat')}</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Favorites;
