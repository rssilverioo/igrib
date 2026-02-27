'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isSeller } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.push(isSeller ? '/dashboard/seller' : '/dashboard/buyer');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isSeller, router]);

  return null;
}
