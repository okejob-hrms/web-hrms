'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Payroll } from './sections/payroll';
import { Assessment } from './sections/assessment';
import { Offboarding } from './sections/offboarding';
import { PendingAction } from './sections/pending-action';
import { Analytics } from './sections/analytics';
import AppSkeleton from '@/components/partials/app-skeleton';

const TAB_VALUES = [
  'pending-actions',
  'analytics',
  'offboarding',
  'payroll',
  'assessment-dashboard',
] as const;

type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return !!value && (TAB_VALUES as readonly string[]).includes(value);
}

export default function DashboardLive() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = React.useMemo((): TabValue => {
    const fromQuery = searchParams.get('tab');
    if (isTabValue(fromQuery)) return fromQuery;
    // Deep links like ?overview=leave should open Pending Action
    if (searchParams.get('overview')) return 'pending-actions';
    return 'pending-actions';
  }, [searchParams]);

  const onTabChange = React.useCallback(
    (value: string) => {
      if (!isTabValue(value)) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', value);

      // overview only applies to Pending Action
      if (value !== 'pending-actions') {
        params.delete('overview');
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const tabs = React.useMemo(
    () => [
      {
        name: t('pendingOverview'),
        value: 'pending-actions' as const,
        content: (
          <React.Suspense fallback={<AppSkeleton />}>
            <PendingAction />
          </React.Suspense>
        ),
      },
      {
        name: t('analytics'),
        value: 'analytics' as const,
        content: <Analytics />,
      },
      {
        name: t('offboarding'),
        value: 'offboarding' as const,
        content: <Offboarding />,
      },
      {
        name: t('payroll'),
        value: 'payroll' as const,
        content: <Payroll />,
      },
      {
        name: t('assessment'),
        value: 'assessment-dashboard' as const,
        content: <Assessment />,
      },
    ],
    [t],
  );

  return (
    <div className="mx-auto font-sans min-h-screen">
      <div className="flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-4 px-6">
          <Tabs
            value={activeTab}
            onValueChange={onTabChange}
            className="w-full mx-auto"
          >
            <TabsList className="p-1 w-full bg-secondary-background h-50 md:h-12 flex flex-col md:flex-row">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    'px-2.5 sm:px-3 text-secondary-hover',
                    'data-[state=active]:bg-secondary data-[state=active]:text-white',
                  )}
                >
                  <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                    {tab.name}
                  </code>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
