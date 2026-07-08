'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Payroll } from './sections/payroll';
import { Assessment } from './sections/assessment';
import { Offboarding } from './sections/offboarding';
import { PendingAction } from './sections/pending-action';
import { Analytics } from './sections/analytics';
import AppSkeleton from '@/components/partials/app-skeleton';

export default function DashboardLive() {
  const t = useTranslations('dashboard');
  const [user, setUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedUser = JSON.stringify(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  console.log(user);

  const tabs = React.useMemo(
    () => [
      {
        name: t('pendingOverview'),
        value: 'pending-actions',
        content: (
          <React.Suspense fallback={<AppSkeleton />}>
            <PendingAction />
          </React.Suspense>
        ),
      },
      {
        name: t('analytics'),
        value: 'analytics',
        content: <Analytics />,
      },
      {
        name: t('offboarding'),
        value: 'offboarding',
        content: <Offboarding />,
      },
      {
        name: t('payroll'),
        value: 'payroll',
        content: <Payroll />,
      },
      {
        name: t('assessment'),
        value: 'assessment-dashboard',
        content: <Assessment />,
      },
    ],
    [t],
  );

  return (
    <div className="mx-auto font-sans min-h-screen">
      <div className="flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-4 px-6">
          <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
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
