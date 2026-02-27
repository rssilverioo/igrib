'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FileText,
  Loader2,
  Download,
  PenTool,
  CheckCircle,
  Clock,
  Building2,
  Package,
  Truck,
  Calendar,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { getContract, signContract, getContractPdfUrl } from '@/lib/api/contracts';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';

interface ContractData {
  id: string;
  status: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  deliveryType: string;
  deliveryDate: string | null;
  paymentTerms: string | null;
  notes: string | null;
  pdfUrl: string | null;
  approvedAt: string | null;
  buyerSignedAt: string | null;
  sellerSignedAt: string | null;
  createdAt: string;
  buyerOrg: { id: string; name: string; cnpj: string };
  sellerOrg: { id: string; name: string; cnpj: string };
  product: {
    id: string;
    name: string;
    type: string;
    images: { url: string }[];
  };
  approvedBy: { name: string } | null;
  buyerSignedBy: { name: string } | null;
  sellerSignedBy: { name: string } | null;
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  PENDING_SIGNATURES: { color: 'text-yellow-800', bg: 'bg-yellow-100' },
  BUYER_SIGNED: { color: 'text-blue-800', bg: 'bg-blue-100' },
  SELLER_SIGNED: { color: 'text-blue-800', bg: 'bg-blue-100' },
  SIGNED: { color: 'text-green-800', bg: 'bg-green-100' },
  CANCELLED: { color: 'text-gray-800', bg: 'bg-gray-100' },
};

export default function ContractDetail({ contractId }: { contractId: string }) {
  const { t } = useTranslation();
  const { activeOrg } = useCurrentUser();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  const loadContract = async () => {
    try {
      const data = await getContract(contractId) as ContractData;
      setContract(data);
    } catch (err) {
      console.error('Failed to load contract:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContract();
  }, [contractId]);

  const handleSign = async () => {
    if (!confirm(t('contracts.signConfirm'))) return;
    setSigning(true);
    try {
      await signContract(contractId);
      toast.success('Contrato assinado com sucesso!');
      loadContract();
    } catch (err) {
      console.error('Failed to sign:', err);
      toast.error('Erro ao assinar contrato.');
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const { url } = await getContractPdfUrl(contractId);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Failed to get PDF:', err);
      toast.error('Erro ao baixar PDF.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Contrato nao encontrado.</p>
      </div>
    );
  }

  const totalValue = Number(contract.pricePerUnit) * contract.quantity;
  const userOrgId = activeOrg?.organizationId;
  const isBuyer = userOrgId === contract.buyerOrg.id;
  const isSeller = userOrgId === contract.sellerOrg.id;

  const canSign =
    (isBuyer && !contract.buyerSignedAt) || (isSeller && !contract.sellerSignedAt);
  const isFullySigned = contract.status === 'SIGNED';

  const statusStyle = statusConfig[contract.status] || statusConfig.CANCELLED;
  const statusKey = contract.status.toLowerCase();

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/contracts"
        className="inline-flex items-center space-x-1 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">{t('common.back')}</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {t('contracts.details')}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">ID: {contract.id}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.color}`}>
              {t(`contracts.status.${statusKey}`)}
            </span>
          </div>
        </div>

        {/* Product */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <img
              src={contract.product.images?.[0]?.url || '/images/placeholder-product.jpg'}
              alt={contract.product.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{contract.product.name}</h3>
              <p className="text-sm text-gray-500">{contract.product.type}</p>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="p-6 border-b grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center space-x-1">
              <Building2 className="h-4 w-4" />
              <span>{t('contracts.buyer')}</span>
            </h4>
            <p className="font-medium text-gray-900">{contract.buyerOrg.name}</p>
            <p className="text-sm text-gray-500">CNPJ: {contract.buyerOrg.cnpj}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center space-x-1">
              <Building2 className="h-4 w-4" />
              <span>{t('contracts.seller')}</span>
            </h4>
            <p className="font-medium text-gray-900">{contract.sellerOrg.name}</p>
            <p className="text-sm text-gray-500">CNPJ: {contract.sellerOrg.cnpj}</p>
          </div>
        </div>

        {/* Terms */}
        <div className="p-6 border-b">
          <h4 className="text-sm font-semibold text-gray-500 mb-4">{t('contracts.terms')}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">{t('common.quantity')}</p>
                <p className="font-medium">{contract.quantity} {contract.unit}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">{t('common.price')}/un</p>
                <p className="font-medium">
                  R$ {Number(contract.pricePerUnit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">{t('common.delivery')}</p>
                <p className="font-medium">
                  {contract.deliveryType === 'DELIVERY' ? t('common.delivery') : t('common.pickup')}
                </p>
              </div>
            </div>
            {contract.deliveryDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="font-medium">
                    {new Date(contract.deliveryDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>
          {contract.paymentTerms && (
            <div className="mt-3">
              <p className="text-xs text-gray-500">Pagamento</p>
              <p className="text-sm text-gray-700">{contract.paymentTerms}</p>
            </div>
          )}
          {contract.notes && (
            <div className="mt-3">
              <p className="text-xs text-gray-500">Observacoes</p>
              <p className="text-sm text-gray-700 italic">{contract.notes}</p>
            </div>
          )}
          <div className="mt-4 bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">{t('contracts.totalValue')}</p>
            <p className="text-xl font-bold text-green-700">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="p-6 border-b">
          <h4 className="text-sm font-semibold text-gray-500 mb-4">{t('contracts.signatures')}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${contract.buyerSignedAt ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {contract.buyerSignedAt ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
                <span className="font-medium text-sm">{t('contracts.buyer')}</span>
              </div>
              {contract.buyerSignedAt ? (
                <>
                  <p className="text-sm text-green-700">{contract.buyerSignedBy?.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(contract.buyerSignedAt).toLocaleString('pt-BR')}
                  </p>
                </>
              ) : (
                <p className="text-sm text-yellow-600">{t('contracts.notSigned')}</p>
              )}
            </div>

            <div className={`p-4 rounded-lg border ${contract.sellerSignedAt ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {contract.sellerSignedAt ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
                <span className="font-medium text-sm">{t('contracts.seller')}</span>
              </div>
              {contract.sellerSignedAt ? (
                <>
                  <p className="text-sm text-green-700">{contract.sellerSignedBy?.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(contract.sellerSignedAt).toLocaleString('pt-BR')}
                  </p>
                </>
              ) : (
                <p className="text-sm text-yellow-600">{t('contracts.notSigned')}</p>
              )}
            </div>
          </div>

          {contract.approvedBy && (
            <p className="text-xs text-gray-400 mt-3">
              {t('contracts.approvedBy')}: {contract.approvedBy.name}
              {contract.approvedAt && ` - ${new Date(contract.approvedAt).toLocaleString('pt-BR')}`}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 flex space-x-3">
          {canSign && !isFullySigned && (
            <button
              onClick={handleSign}
              disabled={signing}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
            >
              {signing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <PenTool className="h-5 w-5" />
              )}
              <span>{t('contracts.sign')}</span>
            </button>
          )}
          {contract.pdfUrl && (
            <button
              onClick={handleDownloadPdf}
              className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>{t('contracts.downloadPdf')}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
