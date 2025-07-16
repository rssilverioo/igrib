'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProductRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/product/2');
  }, [router]);
  
  return null;
}