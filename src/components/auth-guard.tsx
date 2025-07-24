
'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

const protectedRoutes: Record<string, string[]> = {
  '/dashboard': ['Administrador', 'Gerente'],
  '/pos': ['Administrador', 'Gerente', 'Vendedor'],
  '/cash-register': ['Administrador', 'Gerente'],
  '/sales': ['Administrador', 'Gerente'],
  '/reports': ['Administrador', 'Gerente'],
  '/orders': ['Administrador', 'Gerente', 'Vendedor'],
  '/products': ['Administrador', 'Gerente'],
  '/suppliers': ['Administrador', 'Gerente'],
  '/financial': ['Administrador', 'Gerente'],
  '/users': ['Administrador'],
  '/account': ['Administrador'],
};

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const allowedRoles = Object.keys(protectedRoutes).find(route => pathname.startsWith(route));
    if (allowedRoles && user && !protectedRoutes[allowedRoles].includes(user.role)) {
       router.push('/dashboard'); // Or a dedicated "access-denied" page
    }

  }, [isAuthenticated, user, router, pathname]);

  if (!isAuthenticated || !user) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
