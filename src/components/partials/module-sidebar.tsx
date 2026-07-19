'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { menus } from '@/lib/menu';
import { AppSidebar } from '@/components/partials/app-sidebar';
import { usePermission } from '@/hooks/use-permission';
import { filterMenuItemsByPermission } from '@/lib/permissions';

interface ModuleSidebarProps {
  defaultTitleKey?: string;
}

export function ModuleSidebar({
  defaultTitleKey = 'module',
}: ModuleSidebarProps) {
  const pathname = usePathname();
  const moduleName = pathname.split('/')[1];
  const { can, loaded } = usePermission();

  const menuItems = React.useMemo(() => {
    const items = menus[moduleName] || [];
    if (!loaded) {
      return [];
    }
    return filterMenuItemsByPermission(items, can);
  }, [moduleName, can, loaded]);

  return <AppSidebar titleKey={defaultTitleKey} menuItems={menuItems} />;
}
