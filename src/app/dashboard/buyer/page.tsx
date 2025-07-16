'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'buyer') {
      router.push('/dashboard/seller');
    }
  }, [user, router]);

  if (user?.role !== 'buyer') {
    return null;
  }

  return <Dashboard />;
}