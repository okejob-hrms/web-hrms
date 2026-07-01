'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function resolveHomePath(): string {
  const token = localStorage.getItem('token');
  if (!token) return '/auth/login';

  try {
    const savedRoles = localStorage.getItem('user_role');
    const roles = savedRoles ? JSON.parse(savedRoles) : [];
    const roleList = Array.isArray(roles) ? roles : [];
    const isEmployee = roleList.some((role: string) =>
      String(role).toLowerCase().includes('employee'),
    );
    return isEmployee ? '/ess' : '/dashboard?overview=offboarding-active';
  } catch {
    return '/dashboard?overview=offboarding-active';
  }
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(resolveHomePath());
  }, [router]);

  return (
    <div className="flex items-center justify-between h-full">Loading ...</div>
  );
}
