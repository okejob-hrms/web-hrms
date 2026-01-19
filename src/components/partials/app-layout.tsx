/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import {
  Header,
  HeaderBreadcumb,
  HeaderMenu,
} from '@/components/partials/header';
import { cn } from '@/lib/utils';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ModuleSidebar } from '@/components/partials/module-sidebar';
import AppSkeleton from './app-skeleton';
import { useState, useEffect } from 'react';
import { Toaster } from '../ui/sonner';
import { getBreadcrumbs, getGenerateTitle, getHideSidebar } from '@/lib/menu';
import { toast } from 'sonner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hideSidebar = getHideSidebar(pathname) || false;
  const noPaddingPages = ['/employee/organization/structure/edit']; // add more if needed
  const removePadding = noPaddingPages.includes(pathname);
  const isAuthPage = pathname.startsWith('/auth');
  const breadcrumbs = getBreadcrumbs(pathname);
  const isDashboard = ['/dashboard', '/ess', '/ess/'];
  const removeBg = isDashboard.includes(pathname);
  const isEmployee = (roles: string[]) =>
    roles.some((role: string) => role.toLowerCase() === 'employee');

  const [isEmployeeState, setIsEmployeeState] = useState(false);

  useEffect(() => {
    const roles: string[] = JSON.parse(
      localStorage.getItem('user_role') || '[]',
    );

    setIsEmployeeState(isEmployee(roles));
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              if (error?.response?.status >= 500) {
                return false;
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: 'always',
          },
        },
      }),
  );

  useEffect(() => {
    if (!isEmployeeState) return;

    if (!isAllowedEmployeePath(pathname)) {
      toast.error('Page is not available');
      router.replace('/ess');
    }
  }, [isEmployeeState, pathname, router]);

  const isAllowedEmployeePath = (pathname: string) => {
    return pathname.startsWith('/ess') || pathname.startsWith('/auth');
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      {isAuthPage ? (
        <main className="w-full">
          {children}
          <Toaster closeButton richColors position="top-center" />
        </main>
      ) : (
        <>
          <Header showBackNavigate={hideSidebar} />
          {!isEmployeeState && <HeaderMenu />}
          <HeaderBreadcumb items={breadcrumbs} />
          {hideSidebar ? (
            <div
              className={cn(
                'flex justify-center min-h-screen',
                !removeBg && 'bg-white',
                !removePadding && 'py-4 md:py-10',
              )}
            >
              <main className="w-full">
                {loading ? (
                  <div className="px-4 md:px-10">
                    <AppSkeleton />
                  </div>
                ) : (
                  children
                )}
              </main>
            </div>
          ) : (
            <SidebarProvider className="mx-auto w-full container md:py-10 flex flex-col md:flex-row md:gap-4">
              <SidebarTrigger className="md:hidden" />
              <ModuleSidebar defaultTitle={getGenerateTitle(pathname)} />
              <main className="w-full px-2 md:px-0 py-3 md:py-0">
                {loading ? <AppSkeleton /> : children}
              </main>
            </SidebarProvider>
          )}
          <Toaster closeButton richColors position="top-center" />
        </>
      )}
    </QueryClientProvider>
  );
}
