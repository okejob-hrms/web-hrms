'use client';

import {
  ClockPlusIcon,
  GitCompareArrowsIcon,
  Plane,
  Target,
  UserStarIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import * as React from 'react';

export const EssQuickActions = () => {
  const router = useRouter();
  const t = useTranslations('ess');
  const tSidebar = useTranslations('sidebar');

  const pannel = [
    {
      title: tSidebar('leaveRequest'),
      path: '/ess/leave',
      icon: <Target className="text-white" />,
    },
    {
      title: tSidebar('overtimeRequest'),
      path: '/ess/overtime',
      icon: <ClockPlusIcon className="text-white" />,
    },
    {
      title: t('myOkr'),
      path: '/ess/okr',
      icon: <Target className="text-white" />,
    },
    {
      title: tSidebar('businessTrip'),
      path: '/ess/business-trip',
      icon: <Plane className="text-white" />,
    },
    {
      title: tSidebar('selfAssessment'),
      path: '/ess/assessment',
      icon: <UserStarIcon className="text-white" />,
    },
    {
      title: t('organizationStructure'),
      path: '/ess/organization',
      icon: <GitCompareArrowsIcon className="text-white" />,
    },
  ];

  return (
    <div className="font-sans flex flex-col space-y-6">
      <div className="font-bold text-xl text-primary">{t('quickActions')}</div>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
        {pannel.map((item, id) => (
          <div
            className="h-30 w-full rounded-lg flex flex-col bg-primary/10 border border-primary items-center justify-center text-center cursor-pointer"
            key={id}
            onClick={() => router.push(item.path)}
          >
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary mb-3">
              {item.icon}
            </div>
            <div className="text-gray-800 font-semibold px-3">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
