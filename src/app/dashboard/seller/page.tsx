'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SellerDashboard from '@/components/seller/Dashboard';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'seller') {
      router.push('/dashboard/buyer');
    }
  }, [user, router]);

  if (user?.role !== 'seller') {
    return null;
  }

  return <SellerDashboard />;
}