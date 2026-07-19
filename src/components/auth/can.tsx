'use client';

import * as React from 'react';
import { usePermissionStore } from '@/hooks/use-permission-store';

interface CanProps {
  permission?: string;
  permissions?: string[];
  /** When using `permissions`, require any (default) or all */
  mode?: 'any' | 'all';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally render children when the current user has the required permission(s).
 */
export function Can({
  permission,
  permissions,
  mode = 'any',
  children,
  fallback = null,
}: CanProps) {
  const can = usePermissionStore((state) => state.can);
  const canAny = usePermissionStore((state) => state.canAny);
  const canAll = usePermissionStore((state) => state.canAll);
  const loaded = usePermissionStore((state) => state.loaded);

  if (!loaded) {
    return null;
  }

  let allowed = true;

  if (permission) {
    allowed = can(permission);
  } else if (permissions?.length) {
    allowed = mode === 'all' ? canAll(permissions) : canAny(permissions);
  }

  if (!allowed) {
    return fallback;
  }

  return children;
}
