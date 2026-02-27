'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signIn, useSession } from 'next-auth/react';
import {
  Building2, Mail, Lock, Eye, EyeOff, User, Hash, Phone,
  AlertCircle, Loader2, CheckCircle2, XCircle, LogIn,
} from 'lucide-react';

interface InviteInfo {
  email: string;
  organizationName: string;
  organizationType: string;
  roleType: string;
  expiresAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  SELLER_SELLER: 'Vendedor',
  SELLER_COMPLIANCE: 'Compliance',
  BUYER_PURCHASER: 'Comprador',
  BUYER_FINANCIAL: 'Financeiro',
  BUYER_COMPLIANCE: 'Compliance',
  SELLER_SUPERADMIN: 'Administrador',
  BUYER_SUPERADMIN: 'Administrador',
};

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Registration form state
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invites/${token}`);
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Convite invalido');
        } else {
          setInvite(data);
        }
      } catch {
        setErrorMsg('Erro ao carregar convite');
      } finally {
        setLoading(false);
      }
    }
    fetchInvite();
  }, [token]);

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleAccept = async () => {
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`/api/invites/${token}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Erro ao aceitar convite');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 2000);
      }
    } catch {
      setFormError('Erro ao aceitar convite');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('As senhas nao coincidem');
      return;
    }
    if (password.length < 8) {
      setFormError('A senha deve ter no minimo 8 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/invites/${token}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: invite!.email,
          cpf: cpf.replace(/\D/g, '') || undefined,
          phone: phone || undefined,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Erro ao criar conta');
        return;
      }

      // Auto-login
      const loginResult = await signIn('credentials', {
        email: invite!.email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 2000);
      }
    } catch {
      setFormError('Erro ao criar conta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Convite invalido</h1>
          <p className="text-gray-600 mb-6">{errorMsg}</p>
          <a
            href="/login"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Ir para login
          </a>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Convite aceito!</h1>
          <p className="text-gray-600">
            Voce agora faz parte de <strong>{invite!.organizationName}</strong>.
            Redirecionando...
          </p>
        </motion.div>
      </div>
    );
  }

  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-xl shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <img src="/images/logo-green.svg" width={80} height={16} alt="iGrib" />
          </div>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mb-4">
            <Building2 className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Voce foi convidado!</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Para se juntar a <strong>{invite!.organizationName}</strong> como{' '}
            <strong>{ROLE_LABELS[invite!.roleType] || invite!.roleType}</strong>
          </p>
        </div>

        {formError && (
          <motion.div
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-600">{formError}</span>
          </motion.div>
        )}

        {isLoggedIn ? (
          /* Logged-in user: just accept */
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
              <p>
                Logado como <strong>{session.user.email}</strong>
              </p>
            </div>

            <motion.button
              onClick={handleAccept}
              disabled={submitting}
              className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
                submitting
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              whileHover={!submitting ? { scale: 1.02 } : {}}
              whileTap={!submitting ? { scale: 0.98 } : {}}
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Aceitar convite</span>
                </>
              )}
            </motion.button>
          </div>
        ) : (
          /* Not logged in: registration form */
          <div className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={invite!.email}
                    readOnly
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome completo</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-gray-700">CPF (opcional)</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone (opcional)</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Minimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar senha</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Confirme sua senha"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
                  submitting
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                whileHover={!submitting ? { scale: 1.02 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span>Criar conta e aceitar convite</span>
                )}
              </motion.button>
            </form>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Ja tem uma conta?{' '}
                <a
                  href={`/login?callbackUrl=/invite/${token}`}
                  className="font-medium text-green-600 hover:text-green-500 inline-flex items-center"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Faca login
                </a>
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
