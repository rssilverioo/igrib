'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Package,
  Loader2,
  AlertTriangle,
  Building2,
  DollarSign,
  Handshake,
  FileText,
  Users,
} from 'lucide-react';
import {
  getPendingValidations,
  approveContract,
  rejectContract,
  getAdminStats,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getOrganizations,
  getRecentContracts,
} from '@/lib/api/admin';
import { toast } from 'sonner';
import PageTransition from '../PageTransition';
import AnimatedNumber from '../AnimatedNumber';

interface PendingRoom {
  id: string;
  buyerOrg: { id: string; name: string; cnpj: string };
  sellerOrg: { id: string; name: string; cnpj: string };
  product: {
    id: string;
    name: string;
    type: string;
    price: number;
    unit: string;
    images: { url: string }[];
  };
  proposals: {
    id: string;
    pricePerUnit: number;
    quantity: number;
    unit: string;
    deliveryType: string;
    deliveryDate: string | null;
    paymentTerms: string | null;
  }[];
  updatedAt: string;
}

interface PendingProduct {
  id: string;
  name: string;
  type: string;
  price: number;
  unit: string;
  quantity: number;
  location: string;
  createdAt: string;
  organization: { id: string; name: string; cnpj: string };
  images: { url: string }[];
  createdBy: { id: string; name: string; email: string };
}

interface AdminStats {
  organizations: { total: number; buyers: number; sellers: number };
  products: { total: number; active: number; pendingApproval: number; draft: number };
  negotiations: { total: number; active: number; pendingValidation: number; completed: number };
  contracts: { total: number; pendingSigs: number; signed: number; totalValue: number };
}

interface OrgItem {
  id: string;
  name: string;
  type: string;
  cnpj: string;
  createdAt: string;
  _count: { members: number; products: number };
}

interface ContractItem {
  id: string;
  status: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  createdAt: string;
  buyerOrg: { id: string; name: string; cnpj: string };
  sellerOrg: { id: string; name: string; cnpj: string };
  product: { id: string; name: string; type: string };
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<PendingRoom[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = async () => {
    try {
      const [roomsData, statsData, productsData, orgsData, contractsData] = await Promise.all([
        getPendingValidations() as Promise<PendingRoom[]>,
        getAdminStats() as Promise<AdminStats>,
        getPendingProducts() as Promise<PendingProduct[]>,
        getOrganizations() as Promise<OrgItem[]>,
        getRecentContracts() as Promise<ContractItem[]>,
      ]);
      setRooms(roomsData);
      setStats(statsData);
      setPendingProducts(productsData);
      setOrgs(orgsData);
      setContracts(contractsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (roomId: string) => {
    if (!confirm(t('admin.confirmApprove'))) return;
    setActionLoading(roomId);
    try {
      await approveContract(roomId);
      toast.success('Contrato aprovado e gerado com sucesso!');
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch {
      toast.error('Erro ao aprovar contrato.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (roomId: string) => {
    setActionLoading(roomId);
    try {
      await rejectContract(roomId, rejectReason || undefined);
      toast.success('Negociacao rejeitada.');
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      setRejectModal(null);
      setRejectReason('');
    } catch {
      toast.error('Erro ao rejeitar.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveProduct = async (productId: string) => {
    if (!confirm(t('admin.confirmApproveProduct'))) return;
    setActionLoading(productId);
    try {
      await approveProduct(productId);
      toast.success('Produto aprovado!');
      setPendingProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      toast.error('Erro ao aprovar produto.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProduct = async (productId: string) => {
    setActionLoading(productId);
    try {
      await rejectProduct(productId);
      toast.success('Produto devolvido ao vendedor.');
      setPendingProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      toast.error('Erro ao rejeitar produto.');
    } finally {
      setActionLoading(null);
    }
  };

  const contractStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING_SIGNATURES: 'bg-yellow-100 text-yellow-800',
      BUYER_SIGNED: 'bg-blue-100 text-blue-800',
      SELLER_SIGNED: 'bg-blue-100 text-blue-800',
      SIGNED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const contractStatusLabel = (status: string) => {
    return t(`contracts.status.${status.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const statCards = [
    {
      title: t('admin.stats.organizations'),
      value: stats?.organizations.total ?? 0,
      icon: Building2,
      detail: `${stats?.organizations.buyers ?? 0} ${t('admin.buyer').toLowerCase()}s / ${stats?.organizations.sellers ?? 0} ${t('admin.seller').toLowerCase()}s`,
    },
    {
      title: t('admin.stats.activeProducts'),
      value: stats?.products.active ?? 0,
      icon: Package,
      detail: `${stats?.products.pendingApproval ?? 0} ${t('common.pending').toLowerCase()}`,
    },
    {
      title: t('admin.stats.activeNegotiations'),
      value: stats?.negotiations.active ?? 0,
      icon: Handshake,
      detail: `${stats?.negotiations.pendingValidation ?? 0} ${t('admin.pendingValidations').toLowerCase()}`,
    },
    {
      title: t('admin.stats.signedContracts'),
      value: stats?.contracts.signed ?? 0,
      icon: FileText,
      detail: `R$ ${(stats?.contracts.totalValue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <ShieldCheck className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
        </div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {statCards.map((stat) => (
            <motion.div
              key={stat.title}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              variants={item}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-semibold text-gray-900">
                <AnimatedNumber value={stat.value} />
              </p>
              <p className="text-gray-600">{stat.title}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.detail}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Pending Validations (contracts) */}
            <motion.div
              className="bg-white rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('admin.sections.pendingValidations')}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {rooms.length} {rooms.length === 1 ? 'negociacao pendente' : 'negociacoes pendentes'}
                </p>
              </div>
              {rooms.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{t('admin.empty.description')}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {rooms.map((room) => {
                    const proposal = room.proposals[0];
                    const totalValue = proposal
                      ? Number(proposal.pricePerUnit) * proposal.quantity
                      : 0;
                    const imageUrl = room.product?.images?.[0]?.url || '/images/placeholder-product.jpg';
                    const isProcessing = actionLoading === room.id;

                    return (
                      <div key={room.id} className="p-4">
                        <div className="flex items-start space-x-3">
                          <img
                            src={imageUrl}
                            alt={room.product.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {room.product.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {room.buyerOrg.name} &rarr; {room.sellerOrg.name}
                            </p>
                            {proposal && (
                              <div className="flex items-center space-x-3 mt-1 text-sm">
                                <span className="text-gray-600">
                                  {proposal.quantity} {proposal.unit}
                                </span>
                                <span className="text-green-700 font-semibold">
                                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex mt-3 space-x-2">
                          <button
                            onClick={() => handleApprove(room.id)}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center space-x-1.5 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            <span>{t('admin.approve')}</span>
                          </button>
                          <button
                            onClick={() => setRejectModal(room.id)}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center space-x-1.5 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>{t('admin.reject')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Pending Products */}
            <motion.div
              className="bg-white rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('admin.sections.pendingProducts')}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {pendingProducts.length} {pendingProducts.length === 1 ? 'produto' : 'produtos'}
                </p>
              </div>
              {pendingProducts.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{t('admin.noProducts')}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pendingProducts.map((product) => {
                    const imageUrl = product.images?.[0]?.url || '/images/placeholder-product.jpg';
                    const isProcessing = actionLoading === product.id;

                    return (
                      <div key={product.id} className="p-4">
                        <div className="flex items-start space-x-3">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {product.organization.name}
                            </p>
                            <div className="flex items-center space-x-3 mt-1 text-sm">
                              <span className="text-gray-600">
                                {product.quantity} {product.unit}
                              </span>
                              <span className="text-green-700 font-semibold">
                                R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/{product.unit}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {product.createdBy.name} &middot; {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex mt-3 space-x-2">
                          <button
                            onClick={() => handleApproveProduct(product.id)}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center space-x-1.5 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            <span>{t('admin.approveProduct')}</span>
                          </button>
                          <button
                            onClick={() => handleRejectProduct(product.id)}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center space-x-1.5 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium transition-colors"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span>{t('admin.rejectProduct')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Organizations */}
            <motion.div
              className="bg-white rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('admin.sections.recentOrgs')}
                </h2>
              </div>
              {orgs.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{t('admin.noOrgs')}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {orgs.slice(0, 8).map((org) => (
                    <motion.div
                      key={org.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                      whileHover={{ x: 3 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`p-1.5 rounded-lg ${org.type === 'SELLER' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                            {org.type === 'SELLER' ? (
                              <Package className={`h-4 w-4 text-blue-600`} />
                            ) : (
                              <Users className={`h-4 w-4 text-orange-600`} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{org.name}</p>
                            <p className="text-xs text-gray-400">{org.cnpj}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            org.type === 'SELLER' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {org.type === 'SELLER' ? t('admin.seller') : t('admin.buyer')}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            {org._count.members} {t('admin.members')} &middot; {org._count.products} {t('admin.products')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Contracts */}
            <motion.div
              className="bg-white rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('admin.sections.recentContracts')}
                </h2>
              </div>
              {contracts.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{t('admin.noContracts')}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {contracts.map((contract) => {
                    const totalValue = Number(contract.pricePerUnit) * contract.quantity;

                    return (
                      <motion.div
                        key={contract.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                        whileHover={{ x: 3 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {contract.product.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {contract.buyerOrg.name} &rarr; {contract.sellerOrg.name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm font-semibold text-green-700">
                                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs text-gray-400">
                                {contract.quantity} {contract.unit}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${contractStatusBadge(contract.status)}`}>
                              {contractStatusLabel(contract.status)}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Reject Modal */}
        <AnimatePresence>
          {rejectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setRejectModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('admin.reject')}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {t('admin.confirmReject')}
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('admin.rejectReasonPlaceholder')}
                  className="w-full border rounded-lg p-3 text-sm mb-4 resize-none h-24 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setRejectModal(null);
                      setRejectReason('');
                    }}
                    className="flex-1 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => handleReject(rejectModal)}
                    disabled={actionLoading === rejectModal}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {actionLoading === rejectModal ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      t('admin.reject')
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
