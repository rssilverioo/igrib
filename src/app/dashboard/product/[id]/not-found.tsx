'use client';

import Link from 'next/link';
import { PackageX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <PackageX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h2>
        <p className="text-gray-600 mb-8">
          O produto que você está procurando não existe ou foi removido.
        </p>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          Ver todos os produtos
        </Link>
      </div>
    </div>
  );
}