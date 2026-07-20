'use client';

import { usePermissionStore } from '@/hooks/use-permission-store';

export function usePermission() {
  const can = usePermissionStore((state) => state.can);
  const canAny = usePermissionStore((state) => state.canAny);
  const canAll = usePermissionStore((state) => state.canAll);
  const loaded = usePermissionStore((state) => state.loaded);
  const loading = usePermissionStore((state) => state.loading);
  const permissions = usePermissionStore((state) => state.permissions);

  return {
    can,
    canAny,
    canAll,
    loaded,
    loading,
    permissions,
  };
}
