'use client';

import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { relativeWeekLabel, shiftWeek, useLocalDateFormat, weekStartOf } from './utils';

type WeekPickerProps = {
  weekStart: string;
  onChange: (weekStart: string) => void;
  /** Preferred anchor from API meta (branch-local current Monday). */
  currentWeekStart?: string;
};

export function WeekPicker({ weekStart, onChange, currentWeekStart }: WeekPickerProps) {
  const t = useTranslations('rosterWeek');
  const formatDate = useLocalDateFormat();
  const start = dayjs(weekStart);
  const end = start.add(6, 'day');
  const anchorThisWeek = currentWeekStart ?? weekStartOf();
  const isCurrent = weekStart === anchorThisWeek;
  const relative = currentWeekStart ? relativeWeekLabel(weekStart, currentWeekStart) : null;
  const relativeText =
    relative === 'this'
      ? t('thisWeek')
      : relative === 'next'
        ? t('relativeNextWeek')
        : relative === 'last'
          ? t('relativeLastWeek')
          : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="icon" aria-label={t('previousWeek')} onClick={() => onChange(shiftWeek(weekStart, -1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex min-w-[200px] flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-sm font-medium">
        <span>
          {formatDate(start, 'DD MMM')} – {formatDate(end, 'DD MMM YYYY')}
        </span>
        {relativeText ? <span className="font-normal text-text-secondary">{relativeText}</span> : null}
      </div>
      <Button variant="outline" size="icon" aria-label={t('nextWeek')} onClick={() => onChange(shiftWeek(weekStart, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" disabled={isCurrent} onClick={() => onChange(anchorThisWeek)}>
        {t('thisWeek')}
      </Button>
    </div>
  );
}
