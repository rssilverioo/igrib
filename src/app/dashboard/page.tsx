'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isSeller } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    router.replace(isSeller ? '/dashboard/seller' : '/dashboard/buyer');
  }, [isAuthenticated, isLoading, isSeller, router]);

  return null;
}
