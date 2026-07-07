'use client';

import { usePathname } from 'next/navigation';
import { menus } from '@/lib/menu';
import { AppSidebar } from '@/components/partials/app-sidebar';

interface ModuleSidebarProps {
  defaultTitleKey?: string;
}

export function ModuleSidebar({
  defaultTitleKey = 'module',
}: ModuleSidebarProps) {
  const pathname = usePathname();
  const moduleName = pathname.split('/')[1];
  const menuItems = menus[moduleName] || [];

  return <AppSidebar titleKey={defaultTitleKey} menuItems={menuItems} />;
}
