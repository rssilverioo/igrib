'use client';

import { usePathname } from 'next/navigation';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="transition-all duration-200 lg:ml-64 p-4 sm:p-6 lg:p-8">
          <div className="pt-16 lg:pt-0">
            {children}
          </div>
        </main>
      </div>
    </I18nextProvider>
  );
}