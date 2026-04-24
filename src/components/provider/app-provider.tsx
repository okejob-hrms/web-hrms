'use client';

import AuthGuard from '@/components/auth/auth-guard';
import { useFCM } from '@/hooks/use-fcm';

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useFCM();
  return <AuthGuard>{children}</AuthGuard>;
}
