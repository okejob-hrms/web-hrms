'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useLocale, useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/tables/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { getAttendanceDetail } from '@/services/attendance';
import type { AttendanceDetail } from '@/services/attendance/types';
import { getStatusAttendance } from '@/lib/helpers';
import { formatPeriodDateWithWeekday, formatPeriodRange } from '@/lib/payroll-period';
import { PayslipAttendanceActions } from './payslip-attendance-actions';

type DayRow = {
  date: string;
  attendance: AttendanceDetail | null;
};

type PayslipAttendanceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
  employeeName: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  showActions?: boolean;
};

function monthsInRange(start: string, end: string): Array<{ month: number; year: number }> {
  const months: Array<{ month: number; year: number }> = [];
  let cursor = dayjs(start).startOf('month');
  const last = dayjs(end).startOf('month');
  if (!cursor.isValid() || !last.isValid()) return months;

  while (!cursor.isAfter(last, 'month')) {
    months.push({ month: cursor.month() + 1, year: cursor.year() });
    cursor = cursor.add(1, 'month');
  }
  return months;
}

function datesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = dayjs(start).startOf('day');
  const last = dayjs(end).startOf('day');
  if (!cursor.isValid() || !last.isValid() || last.isBefore(cursor, 'day')) {
    return dates;
  }

  while (!cursor.isAfter(last, 'day')) {
    dates.push(cursor.format('YYYY-MM-DD'));
    cursor = cursor.add(1, 'day');
  }
  return dates;
}

function normalizeDate(value?: string | null): string | null {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
}

function attendanceSourceLabel(
  attendance: AttendanceDetail | null,
  tAtt: ReturnType<typeof useTranslations<'attendance'>>,
): string {
  if (!attendance) return '—';

  const via = attendance.metadata?.created_via?.toLowerCase();
  switch (via) {
    case 'ess':
      return tAtt('sourceEss');
    case 'manual':
      return tAtt('sourceManual');
    case 'iclock':
    case 'adms_csv':
      return tAtt('sourceIclock');
    case 'cronjob':
      return tAtt('sourceCronjob');
    default:
      break;
  }

  const source = attendance.source?.trim();
  switch (source) {
    case 'ESS (Mobile)':
      return tAtt('sourceEss');
    case 'Manual':
      return tAtt('sourceManual');
    case 'Fingerprint Machine':
      return tAtt('sourceIclock');
    case 'System (Auto)':
      return tAtt('sourceCronjob');
    default:
      return source && source !== '-' ? source : '—';
  }
}

async function fetchMonthAttendance(
  userId: string,
  month: number,
  year: number,
): Promise<AttendanceDetail[]> {
  const first = await getAttendanceDetail(userId, month, year, {
    per_page: 100,
    page: 1,
  });
  const rows = [...(first.data?.data ?? [])];
  const lastPage = first.data?.last_page ?? 1;

  for (let page = 2; page <= lastPage; page += 1) {
    const next = await getAttendanceDetail(userId, month, year, {
      per_page: 100,
      page,
    });
    rows.push(...(next.data?.data ?? []));
  }

  return rows;
}

export function PayslipAttendanceModal({
  open,
  onOpenChange,
  userId,
  employeeName,
  periodStart,
  periodEnd,
  showActions = false,
}: PayslipAttendanceModalProps) {
  const t = useTranslations('payroll');
  const tAtt = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const start = periodStart ?? '';
  const end = periodEnd ?? '';
  const months = React.useMemo(() => monthsInRange(start, end), [start, end]);
  const dates = React.useMemo(() => datesInRange(start, end), [start, end]);

  const historyQuery = useQuery({
    queryKey: ['payslip-attendance', userId, start, end],
    queryFn: async () => {
      const pages = await Promise.all(
        months.map(({ month, year }) =>
          fetchMonthAttendance(String(userId), month, year),
        ),
      );
      const byDate = new Map<string, AttendanceDetail>();
      for (const rows of pages) {
        for (const row of rows) {
          const key = normalizeDate(row.attendance_date);
          if (key) byDate.set(key, row);
        }
      }
      return byDate;
    },
    enabled:
      open &&
      Number.isFinite(userId) &&
      (userId ?? 0) > 0 &&
      dates.length > 0,
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
        cell: ({ row }) => formatPeriodDateWithWeekday(row.original.date, locale),
      },
      {
        id: 'checkInOut',
        header: tAtt('checkInOut'),
        cell: ({ row }) => {
          const att = row.original.attendance;
          if (!att) return '—';
          const clockIn = att.clock?.in_at;
          const clockOut = att.clock?.out_at;
          const duration = att.duration || att.clock?.duration;
          return (
            <div className="flex flex-col">
              <span>
                {clockIn || '—'} — {clockOut || '—'}
                {att.timezone_abbr && (clockIn || clockOut)
                  ? ` (${att.timezone_abbr})`
                  : ''}
              </span>
              {duration ? (
                <span className="text-muted-foreground text-xs">
                  {tCommon('duration')} {duration}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'shift',
        header: tAtt('shift'),
        cell: ({ row }) =>
          row.original.attendance?.shift?.name ||
          row.original.attendance?.metadata?.shift_name ||
          '—',
      },
      {
        id: 'source',
        header: tAtt('source'),
        cell: ({ row }) => attendanceSourceLabel(row.original.attendance, tAtt),
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
      ...(showActions
        ? [
            {
              id: 'actions',
              header: tCommon('actions'),
              cell: ({ row }) => {
                if (!userId) return null;
                return (
                  <PayslipAttendanceActions
                    userId={userId}
                    date={row.original.date}
                    attendance={row.original.attendance}
                    queryKey={['payslip-attendance', userId, start, end]}
                  />
                );
              },
            } satisfies ColumnDef<DayRow>,
          ]
        : []),
    ],
    [end, locale, showActions, start, tAtt, tCommon, userId],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full flex-col overflow-hidden bg-white p-6 sm:max-w-5xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {t('payslipAttendanceTitle', { name: employeeName })}
          </DialogTitle>
          <DialogDescription>
            {formatPeriodRange(start, end, locale) ?? t('payslipAttendanceHint')}
          </DialogDescription>
        </DialogHeader>
        <p className="shrink-0 text-xs text-muted-foreground">
          {t('payslipAttendanceHint')}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto [&>div]:h-auto [&_[data-slot=scroll-area]]:h-auto [&_[data-slot=scroll-area-viewport]]:overflow-y-hidden! [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:hidden">
          {historyQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : historyQuery.isError ? (
            <p className="text-sm text-destructive">
              {tAtt('failedLoadRecentAttendance')}
            </p>
          ) : (
            <DataTable columns={columns} data={rows} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
