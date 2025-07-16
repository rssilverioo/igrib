'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Star, Package, Calendar, Filter } from 'lucide-react';
import { useNegotiations } from '../store/negotiations';
import { useSavedProducts } from '../store/savedProducts';
import { useAuth } from '@/store/auth';

const Negotiations = () => {
  const { t } = useTranslation();
  const { negotiations, addNegotiation } = useNegotiations();
  const { savedProducts, clearSavedProducts } = useSavedProducts();
  const router = useRouter();
  const { role } = useAuth();
  const [filter, setFilter] = useState('all');

  const startNegotiations = () => {
    const searchCriteria = JSON.parse(localStorage.getItem('searchCriteria') || '{}');
    const { deliveryType, deliveryDate, quantity } = searchCriteria;

    savedProducts.forEach(product => {
      const deliveryInfo = deliveryType === 'delivery' 
        ? t('common.delivery').toLowerCase()
        : t('common.pickup').toLowerCase();

      const initialMessage = t('negotiations.initialMessage', {
        quantity,
        product: product.name,
        deliveryInfo,
        date: new Date(deliveryDate).toLocaleDateString()
      });

      const negotiation = {
        id: Date.now() + product.id,
        productId: product.id,
        sellerId: `seller${product.id}`,
        product: {
          name: product.name,
          producer: product.producer,
          image: product.image,
          price: product.price,
          available: product.available,
          rating: product.rating,
        },
        lastMessage: {
          text: initialMessage,
          timestamp: t('common.now'),
          unread: false
        },
        status: 'new',
        deliveryType,
        deliveryDate,
        quantity
      };
      
      if (!negotiations.some(n => n.productId === product.id)) {
        addNegotiation(negotiation);
      }
    });

    clearSavedProducts();
  };

  const handleChatClick = (negotiation) => {
    router.push(`/dashboard/chat/${negotiation.sellerId}/${negotiation.productId}`);
  };

  const filteredNegotiations = negotiations.filter(negotiation => {
    if (filter === 'all') return true;
    return negotiation.status === filter;
  });

  if (role === 'seller' && negotiations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('negotiations.empty.title')}
        </h2>
        <p className="text-gray-600">
          {t('negotiations.empty.description')}
        </p>
      </div>
    );
  }

  if (role === 'buyer' && savedProducts.length === 0 && negotiations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('negotiations.empty.buyer.title')}
        </h2>
        <p className="text-gray-600">
          {t('negotiations.empty.buyer.description')}
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

  if (savedProducts.length > 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('negotiations.savedProducts.title')}</h1>
          <button
            onClick={startNegotiations}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{t('negotiations.savedProducts.startNegotiations')}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-gray-600">{product.producer}</p>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('negotiations.title')}</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">{t('negotiations.filters.all')}</option>
            <option value="pending">{t('negotiations.filters.pending')}</option>
            <option value="active">{t('negotiations.filters.active')}</option>
            <option value="completed">{t('negotiations.filters.completed')}</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredNegotiations.map((negotiation) => (
          <div
            key={negotiation.id}
            onClick={() => handleChatClick(negotiation)}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex p-4 items-center">
              <div className="w-40 h-40">
                <img
                  src={negotiation.product.image}
                  alt={negotiation.product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="flex-1 ml-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {negotiation.product.name}
                    </h3>
                    <p className="text-gray-600">{negotiation.product.producer}</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-600">{negotiation.product.rating}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center text-gray-600">
                  <Package className="h-5 w-5 mr-2" />
                  <span>{negotiation.quantity} {t('common.quantity')}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{new Date(negotiation.deliveryDate).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{negotiation.deliveryType === 'delivery' ? t('common.delivery') : t('common.pickup')}</span>
                </div>

                <div className="mt-4 flex items-start space-x-2">
                  <MessageCircle className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-gray-600 line-clamp-2">{negotiation.lastMessage.text}</p>
                    <p className="text-sm text-gray-400 mt-1">{negotiation.lastMessage.timestamp}</p>
                  </div>
                  {negotiation.lastMessage.unread && (
                    <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
                  )}
                </div>

                <div className="mt-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    negotiation.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : negotiation.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t(`negotiations.status.${negotiation.status}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Negotiations;