'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sprout, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ConfirmSignupPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmSignUp, resendConfirmationCode } = useAuth();
  
  const email = searchParams.get('email');
  const role = searchParams.get('role') as 'buyer' | 'seller';

  if (!email || !role) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await confirmSignUp(email, code);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('Código inválido. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsResending(true);

    try {
      await resendConfirmationCode(email);
      setError('Novo código enviado com sucesso!');
    } catch (err) {
      setError('Erro ao reenviar código. Por favor, tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <Sprout className="h-10 w-10 text-green-600" />
            <span className="text-3xl font-bold text-green-600 ml-2">Igrib</span>
          </div>
          
          {success ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                E-mail confirmado com sucesso!
              </h2>
              <p className="text-gray-600">
                Redirecionando para a página de login...
              </p>
            </motion.div>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Confirme seu e-mail
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enviamos um código de confirmação para {email}
              </p>
            </>
          )}
        </motion.div>

        {!success && (
          <motion.form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg flex items-start space-x-2 ${
                  error.includes('sucesso')
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <AlertCircle className={`h-5 w-5 ${
                  error.includes('sucesso') ? 'text-green-500' : 'text-red-500'
                } flex-shrink-0 mt-0.5`} />
                <span className={`text-sm ${
                  error.includes('sucesso') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {error}
                </span>
              </motion.div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Código de confirmação
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Digite o código recebido"
                />
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Confirmando...' : 'Confirmar e-mail'}
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <motion.button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-sm font-medium text-green-600 hover:text-green-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isResending ? 'Reenviando...' : 'Reenviar código'}
              </motion.button>

              <motion.a
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Voltar para login
              </motion.a>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
}