import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './useAuth';

export const useProtectedRoute = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const publicRoutes = ['/login', '/signup'];
    
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
    } else if (isAuthenticated && publicRoutes.includes(pathname)) {
      router.push('/');
    }
  }, [isAuthenticated, pathname, router]);

  return { isAuthenticated };
};