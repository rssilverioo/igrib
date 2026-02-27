'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { createProposal } from '@/lib/api/negotiations';

interface ProposalFormProps {
  roomId: string;
  onClose: () => void;
  onCreated: () => void;
  parentProposal?: {
    id: string;
    pricePerUnit: number;
    quantity: number;
    unit: string;
    deliveryType: string;
    deliveryDate: string | null;
    paymentTerms: string | null;
    notes: string | null;
  } | null;
}

export default function ProposalForm({ roomId, onClose, onCreated, parentProposal }: ProposalFormProps) {
  const [form, setForm] = useState({
    pricePerUnit: parentProposal?.pricePerUnit?.toString() || '',
    quantity: parentProposal?.quantity?.toString() || '',
    unit: parentProposal?.unit || 'sacas',
    deliveryType: parentProposal?.deliveryType || 'DELIVERY',
    deliveryDate: parentProposal?.deliveryDate
      ? new Date(parentProposal.deliveryDate).toISOString().split('T')[0]
      : '',
    paymentTerms: parentProposal?.paymentTerms || '',
    notes: parentProposal?.notes || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await createProposal(roomId, {
        pricePerUnit: parseFloat(form.pricePerUnit.replace(',', '.')),
        quantity: parseInt(form.quantity),
        unit: form.unit,
        deliveryType: form.deliveryType,
        deliveryDate: form.deliveryDate || undefined,
        paymentTerms: form.paymentTerms || undefined,
        notes: form.notes || undefined,
        parentProposalId: parentProposal?.id || undefined,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar proposta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {parentProposal ? 'Contra-proposta' : 'Nova Proposta'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preco por unidade (R$)
              </label>
              <input
                type="text"
                value={form.pricePerUnit}
                onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="180,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="sacas">Sacas</option>
                <option value="toneladas">Toneladas</option>
                <option value="kg">Quilogramas</option>
                <option value="litros">Litros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de entrega
              </label>
              <select
                value={form.deliveryType}
                onChange={(e) => setForm({ ...form, deliveryType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="DELIVERY">Entrega</option>
                <option value="PICKUP">Retirada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de entrega
            </label>
            <input
              type="date"
              value={form.deliveryDate}
              onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condicoes de pagamento
            </label>
            <input
              type="text"
              value={form.paymentTerms}
              onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: 30/60/90 dias, boleto faturado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observacoes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Informacoes adicionais sobre a proposta..."
            />
          </div>

          {form.pricePerUnit && form.quantity && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                <span className="font-medium">Valor total: </span>
                R$ {(parseFloat(form.pricePerUnit.replace(',', '.') || '0') * parseInt(form.quantity || '0')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          <div className="flex space-x-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !form.pricePerUnit || !form.quantity}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Enviar proposta</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
