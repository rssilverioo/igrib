'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to their role-specific dashboard
    if (user) {
      router.replace(`/dashboard/${user.role}`);
    } else {
      // If not authenticated, redirect to login
      router.replace('/login');
    }
  }, [user, router]);

  // Return null while redirecting
  return null;
}