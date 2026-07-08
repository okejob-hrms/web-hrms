'use client';

import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import type { MenuItem } from '@/lib/menu';

interface AppSidebarProps {
  title?: string;
  titleKey?: string;
  menuItems: MenuItem[];
}

export function AppSidebar({ title, titleKey, menuItems }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('sidebar');
  const displayTitle = title ?? (titleKey ? t(titleKey) : t('module'));

  return (
    <Sidebar variant="floating">
      <SidebarContent>
        <div className="flex flex-col gap-4 min-h-85 p-4">
          <p className="font-semibold text-lg">{displayTitle}</p>
          <div className="flex flex-col">
            {menuItems.map((item) => (
              <React.Fragment key={item.value ?? item.key}>
                {item.subItem ? (
                  <div
                    className={`py-1.5 px-2 rounded-none flex flex-row justify-between items-center text-left text-sm ${
                      pathname.includes(`${item.value}`)
                        ? 'text-primary border-l-2 border-primary font-bold'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {t(item.key)}
                    <ChevronDown size={16} />
                  </div>
                ) : (
                  <Link
                    href={`/${item.value}`}
                    className={`py-1.5 px-2 rounded-none justify-start text-left text-sm ${
                      pathname.includes(`${item.value}`)
                        ? 'text-primary border-l-2 border-primary font-bold'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                )}

                {item.subItem &&
                  item.subItem.map((sub) => (
                    <Link
                      key={sub.value}
                      href={`/${sub.value}`}
                      className={`py-1.5 px-2 ml-4 rounded-none justify-start text-left text-sm ${
                        pathname === `/${sub.value}`
                          ? 'text-primary'
                          : 'text-gray-600 hover:text-primary'
                      }`}
                    >
                      {t(sub.key)}
                    </Link>
                  ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
