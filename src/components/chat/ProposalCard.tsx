'use client';

import { motion } from 'framer-motion';
import { FileText, Check, X, ArrowRight, Calendar, Truck, CreditCard } from 'lucide-react';
import { respondToProposal } from '@/lib/api/negotiations';
import { useState } from 'react';

interface Proposal {
  id: string;
  negotiationRoomId: string;
  createdByOrgId: string;
  status: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  deliveryType: string;
  deliveryDate: string | null;
  paymentTerms: string | null;
  notes: string | null;
  parentProposalId: string | null;
  createdAt: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  isOwn: boolean;
  roomStatus?: string;
  onCounterPropose: (proposal: Proposal) => void;
  onUpdate: () => void;
}

export default function ProposalCard({ proposal, isOwn, roomStatus, onCounterPropose, onUpdate }: ProposalCardProps) {
  const [isResponding, setIsResponding] = useState(false);

  const totalValue = Number(proposal.pricePerUnit) * proposal.quantity;

  const handleRespond = async (status: 'ACCEPTED' | 'REJECTED') => {
    setIsResponding(true);
    try {
      await respondToProposal(proposal.negotiationRoomId, proposal.id, status);
      onUpdate();
    } catch (err) {
      console.error('Failed to respond to proposal:', err);
    } finally {
      setIsResponding(false);
    }
  };

  const statusColors: Record<string, string> = {
    SENT: 'bg-blue-100 text-blue-800 border-blue-200',
    ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    COUNTER_PROPOSAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusLabels: Record<string, string> = {
    SENT: 'Enviada',
    ACCEPTED: 'Aceita',
    REJECTED: 'Rejeitada',
    COUNTER_PROPOSAL: 'Contra-proposta',
    EXPIRED: 'Expirada',
    DRAFT: 'Rascunho',
  };

  const borderColor = isOwn ? 'border-green-300' : 'border-blue-300';

  return (
    <motion.div
      className={`mx-auto max-w-[90%] rounded-xl border-2 ${borderColor} bg-white shadow-sm overflow-hidden my-3`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Header */}
      <div className={`px-4 py-2 flex items-center justify-between ${isOwn ? 'bg-green-50' : 'bg-blue-50'}`}>
        <div className="flex items-center space-x-2">
          <FileText className={`h-4 w-4 ${isOwn ? 'text-green-600' : 'text-blue-600'}`} />
          <span className="text-sm font-medium text-gray-700">
            {proposal.parentProposalId ? 'Contra-proposta' : 'Proposta'}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[proposal.status] || 'bg-gray-100 text-gray-800'}`}>
          {statusLabels[proposal.status] || proposal.status}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500">Preco/unidade</p>
            <p className="font-semibold text-gray-900">
              R$ {Number(proposal.pricePerUnit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Quantidade</p>
            <p className="font-semibold text-gray-900">
              {proposal.quantity} {proposal.unit}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-500">Valor total</p>
          <p className="text-lg font-bold text-green-700">
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <Truck className="h-3 w-3" />
            <span>{proposal.deliveryType === 'DELIVERY' ? 'Entrega' : 'Retirada'}</span>
          </div>
          {proposal.deliveryDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(proposal.deliveryDate).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          {proposal.paymentTerms && (
            <div className="flex items-center space-x-1">
              <CreditCard className="h-3 w-3" />
              <span>{proposal.paymentTerms}</span>
            </div>
          )}
        </div>

        {proposal.notes && (
          <p className="text-sm text-gray-600 italic">"{proposal.notes}"</p>
        )}

        <p className="text-xs text-gray-400">
          {new Date(proposal.createdAt).toLocaleString('pt-BR')}
        </p>

        {proposal.status === 'ACCEPTED' && roomStatus === 'PENDING_VALIDATION' && (
          <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            <p className="text-xs text-orange-700 font-medium">
              Aguardando validacao da iGrib
            </p>
          </div>
        )}
      </div>

      {/* Actions - Only show for received proposals that are SENT */}
      {!isOwn && proposal.status === 'SENT' && (
        <div className="px-4 py-3 border-t bg-gray-50 flex space-x-2">
          <button
            onClick={() => handleRespond('ACCEPTED')}
            disabled={isResponding}
            className="flex-1 flex items-center justify-center space-x-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            <Check className="h-4 w-4" />
            <span>Aceitar</span>
          </button>
          <button
            onClick={() => onCounterPropose(proposal)}
            disabled={isResponding}
            className="flex-1 flex items-center justify-center space-x-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 text-sm"
          >
            <ArrowRight className="h-4 w-4" />
            <span>Contra-propor</span>
          </button>
          <button
            onClick={() => handleRespond('REJECTED')}
            disabled={isResponding}
            className="flex-1 flex items-center justify-center space-x-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            <X className="h-4 w-4" />
            <span>Rejeitar</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
