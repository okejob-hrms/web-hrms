'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { CalendarDaysIcon, SettingsIcon, UsersIcon } from 'lucide-react';
import { RosterSettingsTab } from './roster-settings-tab';
import { ScheduleTypesTab } from './schedule-types-tab';
import { TeamsWithoutOwnerTab } from './teams-without-owner-tab';

export default function SettingsRosterSetup() {
  const t = useTranslations('settings.rosterSetup');
  const [tab, setTab] = React.useState('settings');

  const tabs = [
    {
      value: 'settings',
      name: t('tabSettings'),
      icon: <SettingsIcon />,
    },
    {
      value: 'schedule-types',
      name: t('tabScheduleTypes'),
      icon: <CalendarDaysIcon />,
    },
    {
      value: 'without-owner',
      name: t('tabWithoutOwner'),
      icon: <UsersIcon />,
    },
  ];

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div>
        <h2 className="font-semibold text-xl">{t('title')}</h2>
        <p className="text-sm text-text-secondary">{t('subtitle')}</p>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList className="p-1 w-full bg-secondary-background min-h-12">
          {tabs.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={cn(
                'px-2.5 sm:px-3 text-secondary-hover border-l-0',
                'data-[state=active]:border-l-0 data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:font-medium',
              )}
            >
              <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                {item.icon} {item.name}
              </code>
            </TabsTrigger>
          ))}
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
