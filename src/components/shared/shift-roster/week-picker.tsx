'use client';

import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { shiftWeek, useLocalDateFormat, weekStartOf } from './utils';

type WeekPickerProps = {
  weekStart: string;
  onChange: (weekStart: string) => void;
};

export function WeekPicker({ weekStart, onChange }: WeekPickerProps) {
  const t = useTranslations('rosterWeek');
  const formatDate = useLocalDateFormat();
  const start = dayjs(weekStart);
  const end = start.add(6, 'day');
  const isCurrent = weekStart === weekStartOf();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="icon" aria-label={t('previousWeek')} onClick={() => onChange(shiftWeek(weekStart, -1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[200px] text-center text-sm font-medium">
        {formatDate(start, 'DD MMM')} – {formatDate(end, 'DD MMM YYYY')}
      </div>
      <Button variant="outline" size="icon" aria-label={t('nextWeek')} onClick={() => onChange(shiftWeek(weekStart, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" disabled={isCurrent} onClick={() => onChange(weekStartOf())}>
        {t('thisWeek')}
      </Button>
    </div>
  );
}
