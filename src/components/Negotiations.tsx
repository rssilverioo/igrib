'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Star, Package, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getNegotiations } from '@/lib/api/negotiations';

interface NegotiationRoom {
  id: string;
  status: string;
  deliveryType: string;
  deliveryDate: string;
  requestedQty: number;
  product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    location: string;
    images: { url: string }[];
    organization: { name: string };
  };
  buyerOrg: { name: string };
  sellerOrg: { name: string };
  messages: {
    id: string;
    content: string;
    createdAt: string;
    sender: { name: string };
  }[];
  updatedAt: string;
}

const Negotiations = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isSeller } = useCurrentUser();
  const [negotiations, setNegotiations] = useState<NegotiationRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getNegotiations() as NegotiationRoom[];
        setNegotiations(data);
      } catch (err) {
        console.error('Failed to load negotiations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChatClick = (negotiation: NegotiationRoom) => {
    router.push(`/dashboard/chat/${negotiation.id}`);
  };

  const filteredNegotiations = negotiations.filter(negotiation => {
    if (filter === 'all') return true;
    return negotiation.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (negotiations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {isSeller ? t('negotiations.empty.title') : t('negotiations.empty.buyer.title')}
        </h2>
        <p className="text-gray-600">
          {isSeller ? t('negotiations.empty.description') : t('negotiations.empty.buyer.description')}
        </p>
        {!isSeller && (
          <Link
            href="/dashboard/buy"
            className="mt-6 inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            {t('common.explore')}
          </Link>
        )}
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
            <option value="open">{t('negotiations.filters.pending')}</option>
            <option value="in_progress">{t('negotiations.filters.active')}</option>
            <option value="pending_validation">Aguardando Validacao</option>
            <option value="completed">{t('negotiations.filters.completed')}</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNegotiations.map((negotiation) => {
          const imageUrl = negotiation.product?.images?.[0]?.url || '/images/placeholder-product.jpg';
          const lastMessage = negotiation.messages?.[0];
          const counterpartyName = isSeller ? negotiation.buyerOrg?.name : negotiation.sellerOrg?.name;

          return (
            <div
              key={negotiation.id}
              onClick={() => handleChatClick(negotiation)}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex p-4 items-center">
                <div className="w-40 h-40">
                  <img
                    src={imageUrl}
                    alt={negotiation.product?.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 ml-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {negotiation.product?.name}
                      </h3>
                      <p className="text-gray-600">{counterpartyName}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center text-gray-600">
                    <Package className="h-5 w-5 mr-2" />
                    <span>{negotiation.requestedQty} {negotiation.product?.unit || 'sacas'}</span>
                    {negotiation.deliveryDate && (
                      <>
                        <span className="mx-2">-</span>
                        <Calendar className="h-5 w-5 mr-2" />
                        <span>{new Date(negotiation.deliveryDate).toLocaleDateString()}</span>
                      </>
                    )}
                    <span className="mx-2">-</span>
                    <span>{negotiation.deliveryType === 'DELIVERY' ? t('common.delivery') : t('common.pickup')}</span>
                  </div>

                  {lastMessage && (
                    <div className="mt-4 flex items-start space-x-2">
                      <MessageCircle className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-gray-600 line-clamp-2">{lastMessage.content}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(lastMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      negotiation.status === 'COMPLETED' || negotiation.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800'
                        : negotiation.status === 'PENDING_VALIDATION'
                          ? 'bg-orange-100 text-orange-800'
                          : negotiation.status === 'OPEN'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                    }`}>
                      {negotiation.status === 'PENDING_VALIDATION'
                        ? 'Aguardando Validacao'
                        : negotiation.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Negotiations;
