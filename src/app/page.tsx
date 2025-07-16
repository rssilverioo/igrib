'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push(`/dashboard/${user.role}`);
    } else {
      router.push('/login');
    }
  }, [user, router]);

  return null;
}