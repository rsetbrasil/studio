
'use client';

import { usePathname } from 'next/navigation';
import { AppShell } from './app-shell';
import AuthGuard from './auth-guard';

export function AppShellController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
