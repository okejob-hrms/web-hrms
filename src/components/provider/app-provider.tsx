'use client';

import { Suspense } from 'react';
import AuthGuard from '@/components/auth/auth-guard';
import { useFCM } from '@/hooks/use-fcm';

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useFCM();
  return (
    <Suspense fallback={null}>
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}
