'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { getProfile } from '@/services/profile';
import { usePermissionStore } from '@/hooks/use-permission-store';

export default function SilentLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadPermissions = usePermissionStore((state) => state.load);

  useEffect(() => {
    const run = async () => {
      const accessToken =
        searchParams.get('access_token') ??
        searchParams.get('acccess_token') ??
        searchParams.get('token');

      if (!accessToken) {
        toast.error('Access token tidak ditemukan.');
        router.replace('/auth/login');
        return;
      }

      localStorage.setItem('token', accessToken);

      try {
        const res = await getProfile();
        if (res.status !== 'success') {
          throw new Error(res.message || 'Gagal mengambil profile.');
        }

        localStorage.setItem('user', JSON.stringify(res.data.user));
        await loadPermissions();

        let roles: unknown = [];
        try {
          const savedRoles = localStorage.getItem('user_role');
          roles = savedRoles ? JSON.parse(savedRoles) : [];
        } catch {
          roles = [];
        }

        const roleList = Array.isArray(roles) ? roles : [];
        const isEmployee = roleList.some((role) =>
          String(role).toLowerCase().includes('employee'),
        );

        if ((res.data as { user?: { is_first_login?: boolean } })?.user?.is_first_login) {
          toast.success('Login berhasil. Silakan ganti password.');
          router.replace('/auth/change-password');
          return;
        }

        toast.success('Login berhasil.');
        router.replace(
          isEmployee ? '/ess' : '/dashboard?overview=offboarding-active',
        );
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Silent login gagal. Silakan login ulang.');
        router.replace('/auth/login');
      }
    };

    void run();
  }, [router, searchParams, loadPermissions]);

  return null;
}
