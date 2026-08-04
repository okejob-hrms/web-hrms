'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { usePermissionStore } from '@/hooks/use-permission-store';
import { getRequiredViewPermission, isEmployeeOnlyAccess } from '@/lib/permissions';

function isPublicPath(pathname: string) {
  // Email reset links land on /reset-password (web) and /app/reset-password (ESS bridge),
  // outside /auth — must stay reachable without a session.
  return (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/docs') ||
    pathname === '/reset-password' ||
    pathname.startsWith('/reset-password/') ||
    pathname === '/app/reset-password' ||
    pathname.startsWith('/app/reset-password/')
  );
}

function getFallbackPath(
  can: (permission: string) => boolean,
  isEmployeeOnly: boolean,
): string {
  if (isEmployeeOnly) {
    return '/ess';
  }

  const candidates: Array<{ permission: string; path: string }> = [
    {
      permission: 'dashboard.pending_offboarding.view',
      path: '/dashboard?overview=offboarding-active',
    },
    {
      permission: 'dashboard.pending_attendance.view',
      path: '/dashboard?overview=attendance',
    },
    {
      permission: 'dashboard.pending_leave.view',
      path: '/dashboard?overview=leave',
    },
    {
      permission: 'employee_organization.employee_profile.view',
      path: '/employee/employee-management',
    },
    {
      permission: 'time_attendance.attendance_records.view',
      path: '/attendance/attendance-tracker',
    },
    {
      permission: 'rbac.role_management.view',
      path: '/settings/access-control',
    },
    {
      permission: 'ess.ess_portal.view',
      path: '/ess',
    },
  ];

  return candidates.find((item) => can(item.permission))?.path ?? '/ess';
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isReady, setIsReady] = useState(false);
  const roles = usePermissionStore((state) => state.roles);
  const loaded = usePermissionStore((state) => state.loaded);
  const can = usePermissionStore((state) => state.can);
  const hydrateFromStorage = usePermissionStore(
    (state) => state.hydrateFromStorage,
  );
  const load = usePermissionStore((state) => state.load);

  const publicRoute = isPublicPath(pathname);

  useEffect(() => {
    hydrateFromStorage();
    const token = localStorage.getItem('token');
    if (token) {
      void load().finally(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [hydrateFromStorage, load]);

  const isEmployeeOnly = isEmployeeOnlyAccess(roles);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      if (!publicRoute) {
        router.replace('/auth/login');
      }
      return;
    }

    if (
      isEmployeeOnly &&
      !publicRoute &&
      !pathname.startsWith('/ess')
    ) {
      router.replace('/ess');
      return;
    }

    if (!loaded || publicRoute) {
      return;
    }

    const required = getRequiredViewPermission(pathname, searchParams);
    if (required && !can(required)) {
      const fallback = getFallbackPath(can, isEmployeeOnly);
      const fallbackPath = fallback.split('?')[0];
      if (pathname !== fallbackPath) {
        toast.error('You do not have permission to access this page');
        router.replace(fallback);
      }
    }
  }, [
    isReady,
    isEmployeeOnly,
    pathname,
    publicRoute,
    searchParams,
    router,
    loaded,
    can,
  ]);

  // Public docs/auth must render immediately — returning null blocks SSR
  // content and triggers client-side crashes on /docs.
  if (!isReady && !publicRoute) {
    return null;
  }

  return <>{children}</>;
}
