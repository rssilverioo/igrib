import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Store, ShoppingBag } from 'lucide-react';

const InterfaceSwitcher = () => {
  const { t } = useTranslation();
  const { user, switchRole } = useAuth();
  const router = useRouter();

  const handleRoleSwitch = (newRole: 'buyer' | 'seller') => {
    switchRole(newRole);
    router.push(`/dashboard/${newRole}`);
  };

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-medium text-gray-500 px-4 mb-2">Interface</h3>
      <button
        onClick={() => handleRoleSwitch('buyer')}
        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
          user?.role === 'buyer'
            ? 'bg-green-50 text-green-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="font-medium">Buyer Interface</span>
      </button>
      <button
        onClick={() => handleRoleSwitch('seller')}
        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
          user?.role === 'seller'
            ? 'bg-green-50 text-green-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Store className="h-5 w-5" />
        <span className="font-medium">Seller Interface</span>
      </button>
    </div>
  );
};

export default InterfaceSwitcher;