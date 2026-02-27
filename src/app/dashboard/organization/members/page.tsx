'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, UserPlus, Shield, Loader2, Trash2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getMembers, updateMember, removeMember } from '@/lib/api/organizations';
import { toast } from 'sonner';

interface Member {
  id: string;
  organizationId: string;
  userId: string;
  roleType: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    cpf: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
}

const ROLE_LABELS: Record<string, string> = {
  SELLER_SUPERADMIN: 'Super Admin',
  SELLER_SELLER: 'Vendedor',
  SELLER_COMPLIANCE: 'Compliance',
  BUYER_SUPERADMIN: 'Super Admin',
  BUYER_PURCHASER: 'Comprador',
  BUYER_FINANCIAL: 'Financeiro',
  BUYER_COMPLIANCE: 'Compliance',
  IGRIB_ADMIN: 'Admin',
  IGRIB_ACCOUNT_MANAGER: 'Gerente de Conta',
  IGRIB_HELPER: 'Assistente',
};

export default function MembersPage() {
  const { t } = useTranslation();
  const { activeOrg, role, isSeller } = useCurrentUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isSuperAdmin = role?.endsWith('_SUPERADMIN') || role === 'IGRIB_ADMIN';

  const availableRoles = isSeller
    ? ['SELLER_SUPERADMIN', 'SELLER_SELLER', 'SELLER_COMPLIANCE']
    : ['BUYER_SUPERADMIN', 'BUYER_PURCHASER', 'BUYER_FINANCIAL', 'BUYER_COMPLIANCE'];

  useEffect(() => {
    if (!activeOrg?.organizationId) return;
    async function load() {
      try {
        const data = await getMembers(activeOrg!.organizationId) as Member[];
        setMembers(data);
      } catch (err) {
        console.error('Failed to load members:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeOrg]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!activeOrg) return;
    try {
      await updateMember(activeOrg.organizationId, memberId, { roleType: newRole });
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, roleType: newRole } : m));
      setEditingId(null);
      toast.success('Cargo atualizado!');
    } catch (err) {
      console.error('Failed to update member:', err);
      toast.error('Erro ao atualizar cargo');
    }
  };

  const handleStatusToggle = async (memberId: string, currentStatus: string) => {
    if (!activeOrg) return;
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateMember(activeOrg.organizationId, memberId, { status: newStatus });
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: newStatus } : m));
      toast.success(`Membro ${newStatus === 'ACTIVE' ? 'ativado' : 'suspenso'}!`);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      toast.error('Erro ao alterar status');
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!activeOrg) return;
    if (!confirm(`Tem certeza que deseja remover ${memberName}?`)) return;
    try {
      await removeMember(activeOrg.organizationId, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Membro removido!');
    } catch (err) {
      console.error('Failed to remove member:', err);
      toast.error('Erro ao remover membro');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          className="text-3xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t('organization.members') || 'Membros'}
        </motion.h1>
        {isSuperAdmin && (
          <Link
            href="/dashboard/organization/members/invite"
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4" />
            <span>Convidar membro</span>
          </Link>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum membro encontrado.</p>
        </div>
      ) : (
        <motion.div
          className="bg-white rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Membro</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">CPF</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cargo</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  {isSuperAdmin && (
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Acoes</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 font-medium">
                            {member.user.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.user.name}</p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.user.cpf || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === member.id ? (
                        <select
                          value={member.roleType}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          onBlur={() => setEditingId(null)}
                          className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500"
                          autoFocus
                        >
                          {availableRoles.map(r => (
                            <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => isSuperAdmin && setEditingId(member.id)}
                          className={`flex items-center space-x-1 text-sm ${
                            isSuperAdmin ? 'cursor-pointer hover:text-green-600' : 'cursor-default'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          <span>{ROLE_LABELS[member.roleType] || member.roleType}</span>
                          {isSuperAdmin && <ChevronDown className="h-3 w-3" />}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isSuperAdmin && !member.roleType.endsWith('_SUPERADMIN') ? (
                        <button
                          onClick={() => handleStatusToggle(member.id, member.status)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : member.status === 'SUSPENDED'
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {member.status === 'ACTIVE' ? 'Ativo' : member.status === 'SUSPENDED' ? 'Suspenso' : 'Pendente'}
                        </button>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.status === 'ACTIVE' ? 'Ativo' : 'Pendente'}
                        </span>
                      )}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-right">
                        {!member.roleType.endsWith('_SUPERADMIN') && (
                          <button
                            onClick={() => handleRemove(member.id, member.user.name)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Remover membro"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
