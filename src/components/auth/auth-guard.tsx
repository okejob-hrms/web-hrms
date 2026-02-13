'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isReady, setIsReady] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedRoles = localStorage.getItem('user_role');
      const parsed = savedRoles ? JSON.parse(savedRoles) : [];
      setRoles(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRoles([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  const isEmployeeOnly =
    roles.length === 1 && String(roles[0]).toLowerCase() === 'employee';

  useEffect(() => {
    if (!isReady) return;

    const token = localStorage.getItem('token');

    // Belum login
    if (!token) {
      const isPublicRoute =
        pathname.startsWith('/auth') || pathname.startsWith('/docs');
      if (!isPublicRoute) {
        router.replace('/auth/login');
      }
      return;
    }

    // Employee only restriction
    if (
      isEmployeeOnly &&
      !pathname.startsWith('/auth') &&
      !pathname.startsWith('/docs') &&
      !pathname.startsWith('/ess')
    ) {
      router.replace('/ess');
      return;
    }
  }, [isReady, isEmployeeOnly, pathname, router]);

  if (!isReady) return null;

  return <>{children}</>;
}
