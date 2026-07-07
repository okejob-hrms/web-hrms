'use client';

import Image from 'next/image';
import * as React from 'react';
import { Status, StatusIndicator, StatusLabel } from '../ui/shadcn-io/status';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import useNetworkStatus from '@/hooks/use-network-status';
import { Profile } from '../ui/profile';
import { usePathname } from 'next/navigation';
import { NotificationList } from './notification-list';
import { LanguageSwitch } from '@/components/shared/language-switch';
import { toTitleCase } from '@/lib/menu';

interface BreadcrumbItemData {
  link: string;
  key?: string | null;
  segment: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItemData[];
}

interface HeaderProps {
  showBackNavigate: boolean;
}

const NAV_ITEMS = [
  {
    name: 'dashboard',
    labelKey: 'dashboard',
    icon: '/icons/dashboard.svg',
    path: '/dashboard?overview=offboarding-active',
    children: [] as Array<{
      labelKey: string;
      descKey: string;
      path: string;
      icon: string;
    }>,
  },
  {
    name: 'employee',
    labelKey: 'employee',
    icon: '/icons/employee.svg',
    path: '/employee',
    children: [
      {
        labelKey: 'employeeManagement',
        descKey: 'employeeManagementDesc',
        path: '/employee/employee-management',
        icon: '/icons/user02.svg',
      },
      {
        labelKey: 'employeeAttendance',
        descKey: 'employeeAttendanceDesc',
        path: '/attendance/attendance-tracker',
        icon: '/icons/clock.svg',
      },
      {
        labelKey: 'payroll',
        descKey: 'payrollDesc',
        path: '/payroll/list',
        icon: '/icons/cash.svg',
      },
    ],
  },
  {
    name: 'performance',
    labelKey: 'performance',
    icon: '/icons/storeReport.svg',
    path: '/performance/self-assessment',
    children: [],
  },
  {
    name: 'settings',
    labelKey: 'settings',
    icon: '/icons/gearSolid.svg',
    path: '/settings/access-control',
    children: [],
  },
  {
    name: 'ess',
    labelKey: 'ess',
    icon: '/icons/dashboard.svg',
    path: '/ess',
    children: [],
  },
];

const HeaderMenu = React.memo(function HeaderMenu() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [roles, setRoles] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedRoles = localStorage.getItem('user_role');
      const parsed = savedRoles ? JSON.parse(savedRoles) : [];
      setRoles(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRoles([]);
    }
  }, []);

  const isEmployeeOnly =
    roles.length === 1 && String(roles[0]).toLowerCase() === 'employee';

  const displayedMenuItems = React.useMemo(() => {
    if (!isEmployeeOnly) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => item.name === 'ess');
  }, [isEmployeeOnly]);

  const navigationMenuTriggerStyle = (isActive: boolean) =>
    cn(
      'flex flex-row primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-b-none rounded-t-sm bg-white flex gap-2',
      'data-[state=open]:hover:bg-primary data-[state=open]:text-primary-foreground data-[state=open]:focus:bg-primary data-[state=open]:bg-primary/50',
      isActive && 'bg-primary text-primary-foreground',
    );

  return (
    <div className="w-full bg-white border-b">
      <div className="hidden md:block">
        <NavigationMenu viewport={false} className="w-full px-10 pt-2">
          <NavigationMenuList>
            {displayedMenuItems.map((item) => {
              const isActive = pathname.includes(`/${item.name}`);
              return (
                <NavigationMenuItem key={item.name}>
                  {item.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger
                        className={navigationMenuTriggerStyle(isActive)}
                      >
                        <Image
                          src={item.icon}
                          width={20}
                          height={20}
                          alt={`icon-${item.name}`}
                        />
                        {t(item.labelKey)}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white opacity-100 z-[999]">
                        <ul className="grid gap-2 p-4 md:w-[300px]">
                          {item.children.map((child) => (
                            <li key={child.path}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.path}
                                  className={cn(
                                    'block rounded px-3 py-2 text-sm hover:bg-muted hover:text-foreground',
                                    pathname === child.path &&
                                      'bg-primary/20 opacity-100 text-primary',
                                  )}
                                >
                                  <div className="flex flex-row gap-3 items-start">
                                    <Image
                                      src={child.icon}
                                      width={20}
                                      height={20}
                                      alt={t(child.labelKey)}
                                    />
                                    <div className="space-y-2">
                                      <div className="font-bold text-gray-800 text-base">
                                        {t(child.labelKey)}
                                      </div>
                                      <div className="text-gray-400 text-sm">
                                        {t(child.descKey)}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.path}
                        className={navigationMenuTriggerStyle(isActive)}
                      >
                        <Image
                          src={item.icon}
                          width={20}
                          height={20}
                          alt={`icon-${item.name}`}
                        />
                        {t(item.labelKey)}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex md:hidden justify-between px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white px-4 pb-4 border-t">
          {displayedMenuItems.map((item) => (
            <div key={item.name} className="py-2">
              <Link
                href={item.path}
                className={cn(
                  'flex items-center gap-2 py-2',
                  pathname.includes(`/${item.name}`) &&
                    'text-primary font-bold',
                )}
              >
                <Image
                  src={item.icon}
                  width={20}
                  height={20}
                  alt={`icon-${item.name}`}
                />
                {t(item.labelKey)}
              </Link>
              {item.children.length > 0 && (
                <div className="pl-6 space-y-2 mt-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      href={child.path}
                      className={cn(
                        'block text-sm text-gray-500',
                        pathname === child.path && 'text-primary font-medium',
                      )}
                    >
                      {t(child.labelKey)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const Header = React.memo(function Header({ showBackNavigate }: HeaderProps) {
  const { isOnline } = useNetworkStatus();
  const t = useTranslations('common');
  const [user, setUser] = React.useState({ name: '' });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    }
  }, []);

  return (
    <header className="w-full flex flex-row justify-between px-4 md:px-10 py-2 items-center bg-white border-b">
      <div className="flex flex-row items-center gap-2">
        <div className="relative w-8 h-8 md:w-10 md:h-10">
          <Image src="/logo.png" alt="logo" fill className="object-cover" />
        </div>
        <span className="font-semibold md:text-lg text-base">{t('appName')}</span>
        {showBackNavigate && null}
      </div>
      <div className="items-center justify-end gap-2 md:gap-4 h-10 flex">
        <Status
          status={isOnline ? 'online' : 'offline'}
          className="hidden md:flex"
        >
          <StatusIndicator />
          <StatusLabel className="text-xs text-text-disabled" />
        </Status>
        <LanguageSwitch showOnMobile />
        <NotificationList />
        <Separator orientation="vertical" className="hidden md:block" />
        <Profile user={user} />
      </div>
    </header>
  );
});

const HeaderBreadcumb = React.memo(function BreadcrumbWithCustomSeparator({
  items,
}: BreadcrumbProps) {
  const t = useTranslations('breadcrumb');

  return (
    <Breadcrumb className="w-full md:px-10 px-4 py-2 bg-white border-b">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              <Image src="/icons/home.svg" alt="Logo" width={16} height={16} />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items && items.length > 0 && (
          <BreadcrumbSeparator>
            <span className="text-xs">/</span>
          </BreadcrumbSeparator>
        )}
        {items?.map((item, index) => {
          const label = item.key
            ? t(item.key)
            : toTitleCase(item.segment);
          return (
            <div key={item.link} className="flex gap-2">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={item.link}>{label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index !== items.length - 1 && (
                <BreadcrumbSeparator>
                  <span className="text-xs">/</span>
                </BreadcrumbSeparator>
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
});

export { Header, HeaderMenu, HeaderBreadcumb };
