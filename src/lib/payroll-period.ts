import dayjs from 'dayjs';
import 'dayjs/locale/id';

export const MAX_PAY_PERIOD_DAYS = 31;

/**
 * "27 Aug 2026 – 26 Sep 2026" in the UI locale; falls back to the server label when dates are missing.
 */
export function formatPeriodRange(
  start: string | null | undefined,
  end: string | null | undefined,
  locale: string,
  fallback?: string | null,
): string | null {
  if (!start || !end || !dayjs(start).isValid() || !dayjs(end).isValid()) {
    return fallback ?? null;
  }
  const lang = locale === 'id' ? 'id' : 'en';
  const format = (value: string) => dayjs(value).locale(lang).format('D MMM YYYY');

  return `${format(start)} – ${format(end)}`;
}

/**
 * Payroll month for a date range: the month holding most of its days, ties going to the
 * later month. Mirrors PayPeriod::majorityLabel() in core-hrms.
 */
export function majorityLabel(
  start: string,
  end: string,
): { year: number; month: number } | null {
  let cursor = dayjs(start);
  const last = dayjs(end);
  if (!cursor.isValid() || !last.isValid() || last.isBefore(cursor, 'day')) {
    return null;
  }

  let best = { year: last.year(), month: last.month() + 1 };
  let bestDays = 0;

  while (!cursor.isAfter(last, 'day')) {
    const monthEnd = cursor.endOf('month');
    const segmentEnd = monthEnd.isBefore(last, 'day') ? monthEnd : last;
    const days = segmentEnd.startOf('day').diff(cursor.startOf('day'), 'day') + 1;

    if (days >= bestDays) {
      best = { year: cursor.year(), month: cursor.month() + 1 };
      bestDays = days;
    }

    cursor = segmentEnd.add(1, 'day').startOf('day');
  }

  return best;
}

export function periodDays(start: string, end: string): number {
  if (!start || !end) return 0;
  return dayjs(end).diff(dayjs(start), 'day') + 1;
}
