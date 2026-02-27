'use client';

import { useSession } from 'next-auth/react';

export function useCurrentUser() {
  const { data: session, status } = useSession();

  const memberships = session?.user?.memberships ?? [];
  const activeOrg = memberships[0] ?? null;

  return {
    user: session?.user ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    memberships,
    activeOrg,
    isBuyer: activeOrg?.organizationType === 'BUYER',
    isSeller: activeOrg?.organizationType === 'SELLER',
    isAdmin: activeOrg?.organizationType === 'IGRIB',
    role: activeOrg?.roleType ?? null,
    organizationType: activeOrg?.organizationType ?? null,
  };
}
