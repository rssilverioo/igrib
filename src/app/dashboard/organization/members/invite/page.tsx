'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Shield, UserPlus, ArrowLeft, Loader2, CheckCircle2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { inviteMember } from '@/lib/api/organizations';

const SELLER_ROLES = [
  { value: 'SELLER_SELLER', label: 'Vendedor' },
  { value: 'SELLER_COMPLIANCE', label: 'Compliance' },
];

const BUYER_ROLES = [
  { value: 'BUYER_PURCHASER', label: 'Comprador' },
  { value: 'BUYER_FINANCIAL', label: 'Financeiro' },
  { value: 'BUYER_COMPLIANCE', label: 'Compliance' },
];

export default function InviteMemberPage() {
  const { t } = useTranslation();
  const { activeOrg, isSeller } = useCurrentUser();
  const [email, setEmail] = useState('');
  const [roleType, setRoleType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [copied, setCopied] = useState(false);

  const roles = isSeller ? SELLER_ROLES : BUYER_ROLES;

  const inviteLink = inviteToken && typeof window !== 'undefined'
    ? `${window.location.origin}/invite/${inviteToken}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg?.organizationId || !email || !roleType) return;

    setIsLoading(true);
    setError('');

    try {
      const result: any = await inviteMember(activeOrg.organizationId, email, roleType);
      // If the result has a token, it's an invite for a new user
      if (result?.token) {
        setInviteToken(result.token);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao convidar membro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/dashboard/organization/members"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para membros
      </Link>

      <motion.div
        className="bg-white rounded-xl shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Convidar membro</h1>
          <p className="text-gray-600 mt-1">
            Convide um novo membro para sua organizacao
          </p>
        </div>

        {success ? (
          <motion.div
            className="text-center py-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Convite enviado!</h2>
            <p className="text-gray-600 mb-4">
              {inviteToken
                ? 'Compartilhe o link abaixo com o convidado:'
                : 'O membro foi adicionado com sucesso.'}
            </p>

            {inviteToken && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  O convite expira em 7 dias.
                </p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setSuccess(false);
                  setInviteToken('');
                  setCopied(false);
                  setEmail('');
                  setRoleType('');
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Convidar outro
              </button>
              <Link
                href="/dashboard/organization/members"
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
              >
                Ver membros
              </Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail do membro
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="email@empresa.com.br"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Se o usuario ja possui conta, sera adicionado diretamente. Caso contrario, recebera um convite.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                >
                  <option value="">Selecione um cargo</option>
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !email || !roleType}
              className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
                isLoading || !email || !roleType
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Enviar convite</span>
                </>
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
