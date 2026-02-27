'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MessageCircle, Heart, MapPin, Package, AlignCenterVertical as Certificate, Droplet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageGallery from './ImageGallery';
import PageTransition from './PageTransition';
import { addFavorite, removeFavorite as removeFavoriteAPI } from '@/lib/api/favorites';
import { createNegotiation } from '@/lib/api/negotiations';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: { url: string }[];
  organization: { name: string };
  location: string;
  quantity: number;
  unit: string;
  specifications: {
    humidity: string;
    protein: string;
    purity: string;
    certification: string;
  };
}

export default function ProductDetails({ product, isFavorited }: { product: Product; isFavorited?: boolean }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(isFavorited ?? false);
  const [isNegotiating, setIsNegotiating] = useState(false);

  const imageUrls = product.images?.map(img => img.url) || [];

  const handleFavoriteClick = async () => {
    try {
      if (isFavorite) {
        await removeFavoriteAPI(product.id);
      } else {
        await addFavorite(product.id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleStartNegotiation = async () => {
    setIsNegotiating(true);

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
      setIsNegotiating(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.back')}
        </motion.button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 lg:p-8">
              <ImageGallery images={imageUrls} alt={product.name} />
            </div>

            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-lg text-gray-600">{product.organization?.name}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleFavoriteClick}
                    className={`p-2 rounded-full ${
                      isFavorite
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-400 hover:text-red-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center mt-4 text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{product.location}</span>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('common.price')}
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-gray-900">
                    R$ {Number(product.price).toFixed(2)}/{product.unit || 'saca'}
                  </p>
                  <p className="text-gray-600 mt-1">
                    {t('common.available')}: {product.quantity} {product.unit || 'sacas'}
                  </p>
                </div>
              </div>

              {product.specifications && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('common.specifications') || 'Specifications'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-gray-600">
                        <Droplet className="h-5 w-5 mr-2" />
                        <span>{t('common.humidity') || 'Humidity'}</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{product.specifications.humidity}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-gray-600">
                        <Package className="h-5 w-5 mr-2" />
                        <span>{t('common.protein') || 'Protein'}</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{product.specifications.protein}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-gray-600">
                        <Star className="h-5 w-5 mr-2" />
                        <span>{t('common.purity') || 'Purity'}</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{product.specifications.purity}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-gray-600">
                        <Certificate className="h-5 w-5 mr-2" />
                        <span>{t('common.certification') || 'Certification'}</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{product.specifications.certification}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('common.description') || 'Description'}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mt-8">
                <motion.button
                  onClick={handleStartNegotiation}
                  disabled={isNegotiating}
                  className={`w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 ${
                    isNegotiating ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  whileHover={!isNegotiating ? { scale: 1.02 } : {}}
                  whileTap={!isNegotiating ? { scale: 0.98 } : {}}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>
                    {isNegotiating ? t('common.loading') || 'Starting...' : t('common.startNegotiation') || 'Start Negotiation'}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
