'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { Badge } from '@/components/ui/badge';
import { formatPeriodDateWithWeekday } from '@/lib/payroll-period';
import { resolveLocale } from '@/lib/i18n/locale';
import { cn } from '@/lib/utils';
import type {
  ReviewDayRecordSummary,
  ReviewPunch,
  ReviewPunchRole,
} from '@/services/attendance-review/types';
import { minutesParts } from './format';

interface MachinePunchDaysProps {
  issueDate: string | null;
  punches: ReviewPunch[];
  dayRecords: ReviewDayRecordSummary[];
}

const ROLE_ORDER: ReviewPunchRole[] = ['in', 'break', 'out', 'unmatched'];

export function MachinePunchDays({ issueDate, punches, dayRecords }: MachinePunchDaysProps) {
  const t = useTranslations('attendanceReview');
  const locale = resolveLocale(useLocale());

  const days = React.useMemo(() => buildDays(issueDate, punches, dayRecords), [issueDate, punches, dayRecords]);

  if (days.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-secondary">{t('machinePunches')}</span>
      <div className="flex flex-col gap-1">
        {days.map((day) => (
          <div
            key={day.date}
            className={cn(
              'flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border px-2.5 py-1.5 text-sm',
              day.isIssueDay ? 'border-amber-300 bg-amber-50/60' : 'border-gray-200 bg-gray-50/40',
            )}
          >
            <span
              className={cn(
                'w-28 shrink-0 text-xs font-medium',
                day.isIssueDay ? 'text-amber-900' : 'text-text-secondary',
              )}
            >
              {formatPeriodDateWithWeekday(day.date, locale)}
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {day.punches.length === 0 ? (
                <span className="text-xs text-text-secondary">—</span>
              ) : (
                day.punches.map((punch) => (
                  <PunchChip key={punch.id} punch={punch} locale={locale} />
                ))
              )}
            </div>
            <span className="ml-auto shrink-0 text-xs text-text-secondary">
              {day.record ? (
                <>
                  {day.record.shift?.name ?? t('noShift')}
                  {day.record.worked_minutes != null
                    ? ` · ${t('worked', minutesParts(day.record.worked_minutes))}`
                    : day.record.duration
                      ? ` · ${day.record.duration}`
                      : ''}
                </>
              ) : (
                t('noRecord')
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PunchChip({ punch, locale }: { punch: ReviewPunch; locale: string }) {
  const t = useTranslations('attendanceReview');
  const time = dayjs(punch.at_local);
  const timeLabel = time.isValid() ? time.format('HH:mm') : punch.at_local.slice(11, 16);
  // Overnight out: always show the punch weekday so the day is clear across day rows.
  const weekday =
    punch.role === 'out' && time.isValid()
      ? time.locale(locale === 'id' ? 'id' : 'en').format('ddd')
      : null;

  const unmatched = punch.role === 'unmatched';

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-normal',
        unmatched && 'border-amber-400 text-amber-700',
        punch.role === 'in' && 'border-emerald-300 text-emerald-800',
        punch.role === 'out' && 'border-sky-300 text-sky-800',
        punch.role === 'break' && 'border-violet-300 text-violet-800',
      )}
      title={t(`punchRole.${punch.role}`)}
    >
      {unmatched
        ? `${timeLabel} · ${t('punchRole.unmatched')}`
        : `${t(`punchRole.${punch.role}`)} ${timeLabel}${weekday ? ` (${weekday})` : ''}`}
    </Badge>
  );
}

interface DayBucket {
  date: string;
  isIssueDay: boolean;
  punches: ReviewPunch[];
  record: ReviewDayRecordSummary['record'];
}

function buildDays(
  issueDate: string | null,
  punches: ReviewPunch[],
  dayRecords: ReviewDayRecordSummary[],
): DayBucket[] {
  if (dayRecords.length > 0) {
    return dayRecords.map((day) => ({
      date: day.date,
      isIssueDay: day.is_issue_day,
      punches: punches
        .filter((punch) => punch.at_local.startsWith(day.date))
        .sort((a, b) => a.at_local.localeCompare(b.at_local) || ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)),
      record: day.record,
    }));
  }

  if (!issueDate || punches.length === 0) return [];

  const day = dayjs(issueDate);
  return [-1, 0, 1].map((offset) => {
    const date = day.add(offset, 'day').format('YYYY-MM-DD');
    return {
      date,
      isIssueDay: offset === 0,
      punches: punches
        .filter((punch) => punch.at_local.startsWith(date))
        .sort((a, b) => a.at_local.localeCompare(b.at_local)),
      record: null,
    };
  });
}
