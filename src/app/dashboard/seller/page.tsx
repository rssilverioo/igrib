'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import SellerDashboard from '@/components/seller/Dashboard';

export default function SellerDashboardPage() {
  const { isSeller, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isSeller) {
      router.push('/dashboard/buyer');
    }
  }, [isSeller, isLoading, router]);

  if (isLoading || !isSeller) return null;

  return <SellerDashboard />;
}
