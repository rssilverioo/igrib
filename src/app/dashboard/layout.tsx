'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import Sidebar from '@/components/Sidebar';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="transition-all duration-200 lg:ml-64 p-4 sm:p-6 lg:p-8">
          <div className="pt-16 lg:pt-0">{children}</div>
        </main>
      </div>
    </I18nextProvider>
  );
}
