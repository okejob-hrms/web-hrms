'use client';

import {
  ClockPlusIcon,
  ClipboardCheck,
  GitCompareArrowsIcon,
  Plane,
  Target,
  UserStarIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWaitingDashboardEmployee } from '@/services/ess';

export const EssQuickActions = () => {
  const router = useRouter();
  const t = useTranslations('ess');
  const tSidebar = useTranslations('sidebar');

  const { data: waitingStat } = useQuery({
    queryKey: ['waitingStat'],
    queryFn: () => getWaitingDashboardEmployee(),
  });

  const approvalsCount = waitingStat?.data.total ?? 0;

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
      title: t('approvals'),
      path: '/ess/approvals',
      icon: <ClipboardCheck className="text-white" />,
      badge: approvalsCount,
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
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-8">
        {pannel.map((item, id) => (
          <div
            className="relative h-30 w-full rounded-lg flex flex-col bg-primary/10 border border-primary items-center justify-center text-center cursor-pointer"
            key={id}
            onClick={() => router.push(item.path)}
          >
            {'badge' in item && item.badge && item.badge > 0 ? (
              <span className="absolute top-2 right-2 min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            ) : null}
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
