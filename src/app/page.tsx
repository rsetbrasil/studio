
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated) {
        router.replace('/painel');
      } else {
        router.replace('/login');
      }
    }
  }, [router, isAuthenticated, isAuthLoading]);

  // You can return a loading spinner here while the auth state is being determined
  return null;
}
