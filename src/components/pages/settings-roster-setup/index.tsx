'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RosterSettingsTab } from './roster-settings-tab';
import { ScheduleTypesTab } from './schedule-types-tab';
import { TeamsWithoutOwnerTab } from './teams-without-owner-tab';

export default function SettingsRosterSetup() {
  const t = useTranslations('settings.rosterSetup');
  const [tab, setTab] = React.useState('settings');

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div>
        <h2 className="font-semibold text-xl">{t('title')}</h2>
        <p className="text-sm text-text-secondary">{t('subtitle')}</p>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList>
          <TabsTrigger value="settings">{t('tabSettings')}</TabsTrigger>
          <TabsTrigger value="schedule-types">{t('tabScheduleTypes')}</TabsTrigger>
          <TabsTrigger value="without-owner">{t('tabWithoutOwner')}</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <RosterSettingsTab />
        </TabsContent>
        <TabsContent value="schedule-types">
          <ScheduleTypesTab enabled={tab === 'schedule-types'} />
        </TabsContent>
        <TabsContent value="without-owner">
          <TeamsWithoutOwnerTab enabled={tab === 'without-owner'} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
