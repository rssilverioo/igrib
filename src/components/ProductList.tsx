'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Heart, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../store/favorites';
import { useNegotiations } from '../store/negotiations';

type Product = {
  id: number;
  name: string;
  producer: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  price: string;
  available: string;
};

const products: Product[] = [
  {
    id: 1,
    name: 'Organic Soybeans',
    producer: 'Fazenda São João',
    location: 'Sorriso, MT',
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1728931340168-3869028e99e7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    price: 'R$ 180,00/saca',
    available: '500 sacas',
  },
  {
    id: 2,
    name: 'Premium Coffee Beans',
    producer: 'Café das Montanhas',
    location: 'Poços de Caldas, MG',
    rating: 4.9,
    reviews: 203,
    image: 'https://plus.unsplash.com/premium_photo-1675237625845-ed58c887f3cf?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    price: 'R$ 1.200,00/saca',
    available: '100 sacas',
  },
];

const ProductList = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { addNegotiation } = useNegotiations();

  const handleStartNegotiation = (product: Product) => {
    const negotiation = {
      id: Date.now(),
      productId: product.id,
      sellerId: product.producer,
      product: {
        name: product.name,
        producer: product.producer,
        image: product.image,
        price: product.price,
        available: product.available,
        rating: product.rating
      },
      lastMessage: {
        text: t('negotiations.initialMessage', {
          product: product.name,
          quantity: '100',
          deliveryInfo: t('common.delivery').toLowerCase(),
          date: new Date().toLocaleDateString()
        }),
        timestamp: t('common.now'),
        unread: false
      },
      status: 'new' as const,
      deliveryType: 'delivery' as const,
      deliveryDate: new Date().toISOString(),
      quantity: 100
    };

    addNegotiation(negotiation); // ✅ corrigido aqui
    router.push(`/dashboard/chat/${product.producer}/${product.id}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('seller.products.title')}</h1>
        <div className="flex space-x-4">
          <select className="border rounded-lg px-4 py-2">
            <option>{t('products.filters.allProducts')}</option>
            <option>{t('products.filters.grains')}</option>
            <option>{t('products.filters.coffee')}</option>
            <option>{t('products.filters.fruits')}</option>
          </select>
          <select className="border rounded-lg px-4 py-2">
            <option>{t('products.filters.allRegions')}</option>
            <option>{t('products.filters.north')}</option>
            <option>{t('products.filters.northeast')}</option>
            <option>{t('products.filters.midwest')}</option>
            <option>{t('products.filters.southeast')}</option>
            <option>{t('products.filters.south')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden group">
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="h-48 w-full object-cover"
              />
              <button
                onClick={() =>
                  isFavorite(product.id)
                    ? removeFavorite(product.id)
                    : addFavorite(product)
                }
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  isFavorite(product.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-400 group-hover:text-red-500'
                }`}
                aria-label={
                  isFavorite(product.id)
                    ? t('products.unfavorite')
                    : t('products.favorite')
                }
              >
                <Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
            <div className="p-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                <p className="text-gray-600">{product.producer}</p>
              </div>

              <div className="mt-2 flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-gray-600">{product.rating}</span>
                <span className="ml-1 text-gray-500">
                  ({product.reviews} {t('common.ratings')})
                </span>
              </div>

              <p className="mt-2 text-gray-500">{product.location}</p>

              <div className="mt-4">
                <p className="text-lg font-semibold text-gray-900">{product.price}</p>
                <p className="text-sm text-gray-600">
                  {t('common.available')}: {product.available}
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
        ))}
      </div>
    </div>
  );
};

export default ProductList;
