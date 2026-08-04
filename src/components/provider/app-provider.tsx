'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/auth/auth-guard';
import { useFCM } from '@/hooks/use-fcm';

function AppProviderInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const enableFcm = !pathname.startsWith('/docs');
  useFCM({ enabled: enableFcm });

  return <AuthGuard>{children}</AuthGuard>;
}

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AppProviderInner>{children}</AppProviderInner>
    </Suspense>
  );
}
