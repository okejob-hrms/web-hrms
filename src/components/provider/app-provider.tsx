'use client';

import AuthGuard from '@/components/auth/auth-guard';

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
