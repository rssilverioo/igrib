'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import {
  Store, ShoppingBag, Mail, Lock, Eye, EyeOff,
  AlertCircle, User, Building2, Phone, Hash, ChevronRight, ArrowLeft,
} from 'lucide-react';

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [step, setStep] = useState(1); // 1: pessoal, 2: empresa
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // User fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Organization fields
  const [orgName, setOrgName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (password !== confirmPassword) {
        setError('As senhas nao coincidem');
        return;
      }
      if (password.length < 8) {
        setError('A senha deve ter no minimo 8 caracteres');
        return;
      }
      setStep(2);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          cpf: cpf.replace(/\D/g, ''),
          phone: phone || undefined,
          role: activeTab,
          organization: {
            name: orgName,
            cnpj: cnpj.replace(/\D/g, ''),
            phone: orgPhone || undefined,
            email: orgEmail || undefined,
            city: city || undefined,
            state: state || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta');
        return;
      }

      // Auto-login after registration
      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Erro ao criar conta. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabVariants = {
    inactive: { backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(107, 114, 128)' },
    active: { backgroundColor: 'rgb(22, 163, 74)', color: 'rgb(255, 255, 255)' },
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <img src="/images/logo-green.svg" width={100} height={20} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Criar nova conta</h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 1 ? 'Dados pessoais e acesso' : 'Dados da empresa'}
            </p>
          </motion.div>

          {/* Account Type Tabs */}
          {step === 1 && (
            <div className="flex rounded-lg overflow-hidden mb-6 p-1 bg-gray-100">
              <motion.button
                className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
                variants={tabVariants}
                animate={activeTab === 'buyer' ? 'active' : 'inactive'}
                onClick={() => setActiveTab('buyer')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Comprador</span>
              </motion.button>
              <motion.button
                className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
                variants={tabVariants}
                animate={activeTab === 'seller' ? 'active' : 'inactive'}
                onClick={() => setActiveTab('seller')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Store className="h-5 w-5" />
                <span>Vendedor</span>
              </motion.button>
            </div>
          )}

          {/* Steps indicator */}
          <div className="flex items-center justify-center mb-6 space-x-2">
            <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
            <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={`${activeTab}-${step}`}
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, x: step === 2 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step === 2 ? -20 : 20 }}
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-600">{error}</span>
                </motion.div>
              )}

              {step === 1 ? (
                <>
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

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail corporativo</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="nome@empresa.com.br"
                      />
                    </div>
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
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
                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
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
                </>
              ) : (
                <>
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span className="text-sm">Voltar</span>
                  </button>

                  {/* Organization Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome da empresa</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Razao social"
                      />
                    </div>
                  </div>

                  {/* CNPJ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={cnpj}
                        onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                      />
                    </div>
                  </div>

                  {/* Org Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone da empresa (opcional)</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={orgPhone}
                        onChange={(e) => setOrgPhone(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="(00) 0000-0000"
                      />
                    </div>
                  </div>

                  {/* Org Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail da empresa (opcional)</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={orgEmail}
                        onChange={(e) => setOrgEmail(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="contato@empresa.com.br"
                      />
                    </div>
                  </div>

                  {/* City / State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cidade</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Cidade"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  'Criando conta...'
                ) : step === 1 ? (
                  <>
                    <span>Proximo: Dados da empresa</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  'Criar conta'
                )}
              </motion.button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Ja possui uma conta?{' '}
                  <a href="/login" className="font-medium text-green-600 hover:text-green-500">
                    Faca login
                  </a>
                </span>
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
          alt="Graos"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="space-y-40 p-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white">
              <div className="p-3 bg-green-500 rounded-lg inline-block mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {activeTab === 'buyer' ? 'Compre com Seguranca' : 'Venda seus Produtos'}
              </h3>
              <p className="text-gray-200">
                {activeTab === 'buyer'
                  ? 'Negocie diretamente com produtores certificados'
                  : 'Alcance compradores em todo o pais'}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white">
              <div className="p-3 bg-green-500 rounded-lg inline-block mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Intermediacao Segura</h3>
              <p className="text-gray-200">
                A iGrib garante seguranca nas negociacoes e pagamentos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
