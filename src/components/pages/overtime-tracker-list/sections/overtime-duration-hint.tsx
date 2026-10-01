'use client';

import { useTranslations } from 'next-intl';

function toMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(time?.trim() ?? '');
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Same rule as core: an end at or before the start is the next day; equal start and end is invalid. */
export function overtimeMinutes(start: string, end: string): number | null {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === null || e === null || s === e) return null;
  return e > s ? e - s : e + 1440 - s;
}

export function OvertimeDurationHint({
  start,
  end,
  showSameTimeError = true,
}: {
  start: string;
  end: string;
  showSameTimeError?: boolean;
}) {
  const t = useTranslations('attendance');
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === null || e === null) return null;

  const minutes = overtimeMinutes(start, end);
  if (minutes === null) {
    return showSameTimeError ? <p className="text-xs text-destructive">{t('overtimeSameTime')}</p> : null;
  }

  return (
    <p className="text-xs text-text-secondary">
      {t('overtimeDuration', { hours: Math.floor(minutes / 60), minutes: minutes % 60 })}
      {e < s ? ` · ${t('overtimeEndsNextDay')}` : ''}
    </p>
  );
}
