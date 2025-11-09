'use client';

import Image from 'next/image';
import * as React from 'react';
import { Status, StatusIndicator, StatusLabel } from '../ui/shadcn-io/status';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { Cloud, Menu, X } from 'lucide-react';

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

interface BreadcrumbProps {
  items?: {
    label: string;
    link: string;
  }[];
}

interface HeaderProps {
  showBackNavigate: boolean;
}

const menuItems = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: '/icons/dashboard.svg',
    path: '/dashboard',
    children: [],
  },
  {
    name: 'employee',
    label: 'Employee',
    icon: '/icons/employee.svg',
    path: '/employee',
    children: [
      {
        label: 'Employee Management',
        desc: 'Manage employee data, organization structure, and onboarding/offboarding processes',
        path: '/employee/employee-management',
        icon: '/icons/user02.svg',
      },
      {
        label: 'Employee Attendance',
        desc: 'Track employee attendance, timesheets, leave requests, and balances.',
        path: '/attendance/attendance-tracker',
        icon: '/icons/clock.svg',
      },
      {
        label: 'Payroll',
        desc: 'Streamline salary calculations, benefits, and monthly payroll processing.',
        path: '/payroll',
        icon: '/icons/cash.svg',
      },
    ],
  },
  {
    name: 'performance',
    label: 'Performance',
    icon: '/icons/storeReport.svg',
    path: '/performance/self-assessment',
    children: [],
  },
  {
    name: 'recruitment',
    label: 'Recruitment',
    icon: '/icons/recruitment.svg',
    path: '/recruitment',
    children: [],
  },
  {
    name: 'training',
    label: 'Training',
    icon: '/icons/book.svg',
    path: '/training',
    children: [],
  },
  {
    name: 'expenses',
    label: 'Expenses',
    icon: '/icons/cash.svg',
    path: '/expenses',
    children: [],
  },
  {
    name: 'document',
    label: 'Document',
    icon: '/icons/documentSolid.svg',
    path: '/document',
    children: [],
  },
  {
    name: 'settings',
    label: 'Settings',
    icon: '/icons/gearSolid.svg',
    path: '/settings/access-control',
    children: [],
  },
];

const HeaderMenu = React.memo(function HeaderMenu() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigationMenuTriggerStyle = (isActive: boolean) =>
    cn(
      'flex flex-row primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-b-none rounded-t-sm bg-white flex gap-2',
      'data-[state=open]:hover:bg-primary data-[state=open]:text-primary-foreground data-[state=open]:focus:bg-primary data-[state=open]:bg-primary/50',
      isActive && 'bg-primary text-primary-foreground',
    );

  return (
    <div className="w-full bg-white border-b">
      {/* Desktop Menu */}
      <div className="hidden md:block">
        <NavigationMenu viewport={false} className="w-full px-10 pt-2">
          <NavigationMenuList>
            {menuItems.map((item) => {
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
                        {item.label}
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
                                      alt={`icon-${child.label}`}
                                    />
                                    <div className="space-y-2">
                                      <div className="font-bold text-gray-800 text-base">
                                        {child.label}
                                      </div>
                                      <div className="text-gray-400 text-sm">
                                        {child.desc}
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
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex md:hidden justify-between px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white px-4 pb-4 border-t">
          {menuItems.map((item) => (
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
                {item.label}
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
                      {child.label}
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
  const { isOnline, setOnline } = useNetworkStatus();
  const [user, setUser] = React.useState({ name: '' });

  // Only access localStorage on the client side
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
        <span className="font-semibold md:text-lg text-base">HRMS</span>

        {showBackNavigate && (
          <>
            {/* <Button
              variant="link"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-dark"
            >
              <ChevronLeft
                style={{ height: '28px', width: '28px' }}
                className="text-blue-600"
              />
              <div className="text-xl">Back</div>
            </Button> */}
          </>
        )}
      </div>
      <div className="items-center justify-end gap-2 md:gap-4 h-10 flex">
        <Status
          status={isOnline ? 'online' : 'offline'}
          className="hidden md:flex"
        >
          <StatusIndicator />
          <StatusLabel className="text-xs text-text-disabled" />
        </Status>
        {/* <Button
          variant="ghost"
          onClick={() => setOnline((prev) => !prev)}
          className="text-xs text-text-disabled md:flex hidden"
        >
          {isOnline ? (
            <Image
              src="/icons/offline.svg"
              alt="icon-notification"
              width={20}
              height={20}
            />
          ) : (
            <Cloud size={20} />
          )}
          {isOnline ? 'Offline' : 'Online'} Mode
        </Button> */}
        <Button className="bg-background rounded-full size-8 p-0">
          <Image
            src="/icons/notification.svg"
            alt="icon-notification"
            width={20}
            height={20}
          />
        </Button>
        <Separator orientation="vertical" className="hidden md:block" />
        <Profile user={user} />
      </div>
    </header>
  );
});

const HeaderBreadcumb = React.memo(function BreadcrumbWithCustomSeparator({
  items,
}: BreadcrumbProps) {
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
        {items?.map((item, index) => (
          <div key={item.link} className="flex gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={item.link}>{item.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index != items.length - 1 && (
              <BreadcrumbSeparator>
                <span className="text-xs">/</span>
              </BreadcrumbSeparator>
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
});

export { Header, HeaderMenu, HeaderBreadcumb };
