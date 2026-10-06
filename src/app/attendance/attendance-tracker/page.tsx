'use client';

import React from 'react';
import { AttendanceTrackerList } from '@/components/pages/attendance-tracker-list';
import { PendingAdjustmentsTab } from '@/components/pages/attendance-tracker-list/sections/pending-adjustments-tab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Clock4Icon, ClipboardListIcon } from 'lucide-react';

export default function AttendanceTracker() {
  const t = useTranslations('attendance');

  const tabs = [
    {
      value: 'tracker',
      name: t('attendanceTracker'),
      icon: <Clock4Icon />,
    },
    {
      value: 'adjustments',
      name: t('pendingAdjustments'),
      icon: <ClipboardListIcon />,
    },
  ];

  return (
    <div className="font-sans min-h-screen px-6 md:px-11 py-6">
      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="mb-6 p-1 w-full bg-secondary-background min-h-12">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'px-2.5 sm:px-3 text-secondary-hover border-l-0',
                'data-[state=active]:border-l-0 data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:font-medium',
              )}
            >
              <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                {tab.icon} {tab.name}
              </code>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="tracker">
          <div className="-mx-6 md:-mx-11">
            <AttendanceTrackerList />
          </div>
        </TabsContent>
        <TabsContent value="adjustments">
          <PendingAdjustmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
