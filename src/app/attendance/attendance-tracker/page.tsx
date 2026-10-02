'use client';

import React from 'react';
import { AttendanceTrackerList } from '@/components/pages/attendance-tracker-list';
import { PendingAdjustmentsTab } from '@/components/pages/attendance-tracker-list/sections/pending-adjustments-tab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';

export default function AttendanceTracker() {
  const t = useTranslations('attendance');

  return (
    <div className="font-sans min-h-screen px-6 md:px-11 py-6">
      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tracker">{t('attendanceTracker')}</TabsTrigger>
          <TabsTrigger value="adjustments">{t('pendingAdjustments')}</TabsTrigger>
        </TabsList>
        <TabsContent value="tracker">
          <AttendanceTrackerList />
        </TabsContent>
        <TabsContent value="adjustments">
          <PendingAdjustmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
