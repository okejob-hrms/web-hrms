'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getAttendanceDetail } from '@/services/attendance';
import type { AttendanceDetail } from '@/services/attendance/types';
import { getStatusAttendance } from '@/lib/helpers';

const RECENT_DAY_COUNT = 14;

type DayRow = {
  date: string;
  attendance: AttendanceDetail | null;
};

function buildDayRows(count: number): string[] {
  const today = dayjs().startOf('day');
  return Array.from({ length: count }, (_, index) =>
    today.subtract(index, 'day').format('YYYY-MM-DD'),
  );
}

function periodsForDates(dates: string[]): Array<{ month: number; year: number }> {
  const keys = new Set(
    dates.map((date) => dayjs(date).format('YYYY-M')),
  );
  return Array.from(keys).map((key) => {
    const [year, month] = key.split('-').map(Number);
    return { year, month };
  });
}

function normalizeDate(value?: string | null): string | null {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
}

interface RecentAttendanceTableProps {
  userId: number;
}

export function RecentAttendanceTable({ userId }: RecentAttendanceTableProps) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');

  const dates = React.useMemo(() => buildDayRows(RECENT_DAY_COUNT), []);
  const periods = React.useMemo(() => periodsForDates(dates), [dates]);
  const rangeFrom = dates[dates.length - 1];
  const rangeTo = dates[0];

  const historyQuery = useQuery({
    queryKey: ['employee-recent-attendance', userId, rangeFrom, rangeTo],
    queryFn: async () => {
      const pages = await Promise.all(
        periods.map(({ month, year }) =>
          getAttendanceDetail(String(userId), month, year, { per_page: 50 }),
        ),
      );
      const byDate = new Map<string, AttendanceDetail>();
      for (const page of pages) {
        for (const row of page.data?.data ?? []) {
          const key = normalizeDate(row.attendance_date);
          if (key) byDate.set(key, row);
        }
      }
      return byDate;
    },
    enabled: Number.isFinite(userId) && userId > 0,
  });

  const rows: DayRow[] = React.useMemo(
    () =>
      dates.map((date) => ({
        date,
        attendance: historyQuery.data?.get(date) ?? null,
      })),
    [dates, historyQuery.data],
  );

  const columns: ColumnDef<DayRow>[] = React.useMemo(
    () => [
      {
        accessorKey: 'date',
        header: tCommon('date'),
        cell: ({ row }) => row.original.date,
      },
      {
        id: 'checkInOut',
        header: t('checkInOut'),
        cell: ({ row }) => {
          const att = row.original.attendance;
          if (!att) return '—';
          return (
            <div className="flex flex-col">
              <span>
                {att.clock?.in_at || '—'} — {att.clock?.out_at || '—'}
                {att.timezone_abbr ? ` (${att.timezone_abbr})` : ''}
              </span>
              <span className="text-muted-foreground text-xs">
                {tCommon('duration')} {att.duration || att.clock?.duration || '—'}
              </span>
            </div>
          );
        },
      },
      {
        id: 'shift',
        header: t('shift'),
        cell: ({ row }) =>
          row.original.attendance?.shift?.name ||
          row.original.attendance?.metadata?.shift_name ||
          '—',
      },
      {
        id: 'source',
        header: t('source'),
        cell: ({ row }) => row.original.attendance?.source || '—',
      },
      {
        id: 'notes',
        header: tCommon('notes'),
        cell: ({ row }) => row.original.attendance?.notes || '—',
      },
      {
        id: 'status',
        header: tCommon('status'),
        cell: ({ row }) => {
          const status = row.original.attendance?.status_label;
          if (!status) return '—';
          const { variant, className, key } = getStatusAttendance(status);
          return (
            <StatusBadge statusKey={key} variant={variant} className={className} />
          );
        },
      },
    ],
    [t, tCommon],
  );

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div>
        <h2 className="font-semibold text-xl">{t('attendanceTracker')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('recentDaysRange', {
            days: RECENT_DAY_COUNT,
            from: dayjs(rangeFrom).format('DD MMM YYYY'),
            to: dayjs(rangeTo).format('DD MMM YYYY'),
          })}
        </p>
      </div>

      {historyQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : historyQuery.isError ? (
        <p className="text-sm text-destructive">{t('failedLoadRecentAttendance')}</p>
      ) : (
        <DataTable columns={columns} data={rows} />
      )}
    </div>
  );
}
