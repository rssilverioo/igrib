'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FileText,
  Loader2,
  Package,
  DollarSign,
  Building2,
  Filter,
} from 'lucide-react';
import { getContracts } from '@/lib/api/contracts';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Contract {
  id: string;
  status: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  deliveryType: string;
  createdAt: string;
  buyerOrg: { id: string; name: string };
  sellerOrg: { id: string; name: string };
  product: {
    id: string;
    name: string;
    type: string;
    images: { url: string }[];
  };
}

const statusColors: Record<string, string> = {
  PENDING_SIGNATURES: 'bg-yellow-100 text-yellow-800',
  BUYER_SIGNED: 'bg-blue-100 text-blue-800',
  SELLER_SIGNED: 'bg-blue-100 text-blue-800',
  SIGNED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function ContractList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isSeller } = useCurrentUser();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getContracts() as Contract[];
        setContracts(data);
      } catch (err) {
        console.error('Failed to load contracts:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = contracts.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t('contracts.title')}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">{t('common.all')}</option>
            <option value="PENDING_SIGNATURES">{t('contracts.status.pending_signatures')}</option>
            <option value="BUYER_SIGNED">{t('contracts.status.buyer_signed')}</option>
            <option value="SELLER_SIGNED">{t('contracts.status.seller_signed')}</option>
            <option value="SIGNED">{t('contracts.status.signed')}</option>
          </select>
        </div>
      </div>

      {contracts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t('contracts.empty.title')}
          </h2>
          <p className="text-gray-600">{t('contracts.empty.description')}</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((contract) => {
            const totalValue = Number(contract.pricePerUnit) * contract.quantity;
            const imageUrl = contract.product?.images?.[0]?.url || '/images/placeholder-product.jpg';
            const counterparty = isSeller ? contract.buyerOrg : contract.sellerOrg;
            const statusKey = contract.status.toLowerCase() as keyof typeof statusColors;

            return (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                className="bg-white rounded-xl shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="flex p-5">
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={contract.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 ml-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contract.product.name}
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-500 mt-0.5">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{counterparty.name}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusColors[contract.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {t(`contracts.status.${statusKey}`)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>
                          {contract.quantity} {contract.unit}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-700 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
