'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardInfo from '@/components/ui/dashboard-info';
import { useESS } from './hook';
import { EssQuickActions } from './sections/quick-access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { resolveLocale, toIntlLocale } from '@/lib/i18n/locale';
import type { WaitingApprovalDataMeta } from '@/services/ess/types';

function WaitingApprovalCard({
  title,
  item,
  formatDate,
  notesLabel,
  waitingLabel,
}: {
  title: string;
  item: WaitingApprovalDataMeta;
  formatDate: (date: string) => string;
  notesLabel: string;
  waitingLabel: string;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <p className="font-medium text-sm">{title}</p>
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {item.created_at ? formatDate(item.created_at) : '-'}
        </p>
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-yellow-50 border-yellow-800 text-yellow-800"
        >
          <Clock className="w-3 h-3" /> {waitingLabel}
        </Badge>
      </div>
      {item.comments ? (
        <>
          <Separator />
          <div className="text-sm">
            <div className="space-y-2">
              <div className="text-muted-foreground">{notesLabel}</div>
              <span className="font-medium text-foreground">{item.comments}</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export const EssPage = () => {
  const router = useRouter();
  const t = useTranslations('ess');
  const tDashboard = useTranslations('dashboard');
  const tAtt = useTranslations('attendance');
  const tSidebar = useTranslations('sidebar');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());

  const dashboardAnalytics = useESS();
  const { offboardingData } = dashboardAnalytics;

  const formatDate = React.useCallback(
    (date: string) =>
      new Intl.DateTimeFormat(toIntlLocale(locale), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(date)),
    [locale],
  );

  const todayLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat(toIntlLocale(locale), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    [locale],
  );

  const lineData = dashboardAnalytics.attendanceStat?.data.trend.map(
    (item) => ({
      month: item.date,
      onTime: item.ontime,
      late: item.late,
      absent: item.absent,
      overtime: item.overtime,
      leave: item.leave,
    }),
  );

  const lineTitle = React.useMemo(
    () => [
      tAtt('onTime'),
      tDashboard('late'),
      tAtt('absent'),
      tAtt('overtime'),
      tDashboard('leave'),
    ],
    [tAtt, tDashboard],
  );
  const lineColor = ['#18618B', '#FFB84D', '#C964A2', '#64C9B1', '#367839'];

  const pannel = React.useMemo(
    () => [
      {
        title: tAtt('onTime'),
        value: dashboardAnalytics.attendanceStat?.data.summary.total_ontime ?? 0,
      },
      {
        title: tAtt('lateClockIn'),
        value: dashboardAnalytics.attendanceStat?.data.summary?.total_late ?? 0,
      },
      {
        title: tAtt('overtime'),
        value:
          dashboardAnalytics.attendanceStat?.data.summary?.total_overtime ?? 0,
      },
      {
        title: tAtt('absent'),
        value: dashboardAnalytics.attendanceStat?.data.summary?.total_absent ?? 0,
      },
      {
        title: tDashboard('leave'),
        value: dashboardAnalytics.attendanceStat?.data.summary?.total_leave ?? 0,
      },
    ],
    [dashboardAnalytics.attendanceStat?.data.summary, tAtt, tDashboard],
  );

  const waitingItems = React.useMemo(() => {
    const overtimes =
      dashboardAnalytics.waitingStat?.data.overtimes.map((item) => ({
        key: `overtime-${item.id}`,
        title: tSidebar('overtimeRequest'),
        item,
      })) ?? [];
    const leaves =
      dashboardAnalytics.waitingStat?.data.leaves.map((item) => ({
        key: `leave-${item.id}`,
        title: tSidebar('leaveRequest'),
        item,
      })) ?? [];
    return [...overtimes, ...leaves];
  }, [dashboardAnalytics.waitingStat?.data, tSidebar]);

  const LineChartComponent = () => (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={lineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          stroke="#6b7280"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 13, fill: '#9ca3af' }}
        />
        <YAxis
          stroke="#6b7280"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tick={{ fontSize: 13, fill: '#9ca3af' }}
          width={30}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="onTime"
          stroke="#18618B"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="late"
          stroke="#FFB84D"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="absent"
          stroke="#C964A2"
          strokeWidth={2}
          dot={false}
        />

        <Line
          type="monotone"
          dataKey="overtime"
          stroke="#64C9B1"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="leave"
          stroke="#367839"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6 md:px-11">
      <EssQuickActions />

      <div className="font-sans flex flex-col space-y-6">
        <div className="font-bold text-xl text-primary">{t('forYouToday')}</div>
        {offboardingData && (
          <div className="w-full p-6 bg-yellow-50 border border-yellow-500 rounded-xl">
            <div className="space-y-2">
              <div className="flex gap-3 items-center">
                <Bell className="text-orange-500" />
                <div className="text-primary font-semibold">
                  {t('completeOffboardingJourney')}
                </div>
              </div>
              <div className="text-gray-500">
                {t('completeOffboardingJourneyDesc')}
              </div>
              <Button
                onClick={() => router.push('/ess/offboarding')}
                variant="default"
              >
                {t('startOffboardingProcess')}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 space-y-6 sm:grid-cols-3 md:gap-6">
          <div className="col-span-3 md:col-span-2 space-y-3 bg-white p-4 rounded-xl shadow-sm">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h2 className="font-bold text-xl text-gray-600">
                  {tDashboard('attendanceTrend')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    className="w-full"
                    name="start_date"
                    value={dashboardAnalytics.filter.start_date}
                    onChange={(e) => {
                      dashboardAnalytics.setFilter((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }));
                    }}
                  />
                  <Input
                    type="date"
                    className="w-full"
                    name="end_date"
                    value={dashboardAnalytics.filter.end_date}
                    onChange={(e) => {
                      dashboardAnalytics.setFilter((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
              <LineChartComponent />
              <div className="flex flex-row gap-3 mt-4 justify-center">
                {lineTitle.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded shrink-0"
                        style={{ backgroundColor: lineColor[index] }}
                      />
                      <div>
                        <div className="text-xs text-foreground">{item}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {dashboardAnalytics.attendanceStatLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pannel.map((item, id) => (
                  <DashboardInfo
                    key={id}
                    title={item.title}
                    value={item.value}
                    numeric
                  />
                ))}
              </div>
            )}
          </div>

          <div className="col-span-1 space-y-6">
            <Card className="bg-white py-4 rounded-xl shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="font-bold text-xl text-gray-600">
                  {t('waitingForApproval')}{' '}
                  <span className="text-muted-foreground">
                    ({dashboardAnalytics.waitingStat?.data.total ?? 0})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[300px] overflow-y-scroll">
                {dashboardAnalytics.waitingStatLoading ? (
                  <Skeleton className="h-80" />
                ) : waitingItems.length > 0 ? (
                  waitingItems.map(({ key, title, item }) => (
                    <WaitingApprovalCard
                      key={key}
                      title={title}
                      item={item}
                      formatDate={formatDate}
                      notesLabel={tCommon('notes')}
                      waitingLabel={tStatus('waitingForApproval')}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {tCommon('noData')}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white py-4 rounded-xl shadow-sm border-0">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="font-bold text-xl text-gray-600">
                  {t('onLeaveToday')}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {todayLabel}
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {tCommon('noData')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
