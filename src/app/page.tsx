'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  const [roles, setRoles] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

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

    if (!token) {
      if (!pathname.startsWith('/auth')) {
        router.replace('/auth/login');
      }
      return;
    }

    if (
      isEmployeeOnly &&
      !pathname.startsWith('/auth') &&
      !pathname.startsWith('/ess')
    ) {
      router.replace('/ess');
      return;
    }
  }, [isReady, isEmployeeOnly, pathname, router]);

  return null;
}
