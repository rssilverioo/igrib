'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import Dashboard from '@/components/Dashboard';

export default function BuyerDashboardPage() {
  const { isBuyer, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isBuyer) {
      router.push('/dashboard/seller');
    }
  }, [isBuyer, isLoading, router]);

  if (isLoading || !isBuyer) return null;

  return <Dashboard />;
}
