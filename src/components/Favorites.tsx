'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Star, Heart } from 'lucide-react';
import { useFavorites } from '../store/favorites';

const Favorites = () => {
  const { t } = useTranslation();
  const { favorites, removeFavorite } = useFavorites();

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
          href="/"
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
        {favorites.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="h-48 w-full object-cover"
            />
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-gray-600">{product.producer}</p>
                </div>
                <button
                  onClick={() => removeFavorite(product.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </div>
              
              <div className="mt-2 flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-gray-600">{product.rating}</span>
                <span className="ml-1 text-gray-500">({product.reviews} {t('common.rating')})</span>
              </div>
              
              <p className="mt-2 text-gray-500">{product.location}</p>
              
              <div className="mt-4">
                <p className="text-lg font-semibold text-gray-900">{product.price}</p>
                <p className="text-sm text-gray-600">{t('common.available')}: {product.available}</p>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <Link 
                  href={`/product/${product.id}`}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {t('common.details')}
                </Link>
                <Link
                  href={`/chat/${product.id}/seller`}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{t('common.chat')}</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;