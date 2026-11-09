import dayjs from 'dayjs';
import 'dayjs/locale/id';
import type { ReviewSeverity } from '@/services/attendance-review/types';

const uiLocale = (locale: string) => (locale === 'id' ? 'id' : 'en');

/** "Mon 1 Sep 19:02" from a branch-local "YYYY-MM-DD HH:mm" (no timezone shift). */
export function formatLocalDateTime(value: string | null | undefined, locale: string): string | null {
  if (!value) return null;
  const parsed = dayjs(value);
  if (!parsed.isValid()) return value;
  return parsed.locale(uiLocale(locale)).format('ddd D MMM HH:mm');
}

export function minutesParts(total: number): { hours: number; minutes: number } {
  const value = Math.max(0, Math.round(total));
  return { hours: Math.floor(value / 60), minutes: value % 60 };
}

export const SEVERITY_STYLES: Record<ReviewSeverity, { badge: string; dot: string; border: string }> = {
  blocker: {
    badge: 'border-transparent bg-red-100 text-red-700',
    dot: 'bg-red-500',
    border: 'border-l-red-500',
  },
  warning: {
    badge: 'border-transparent bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-l-amber-500',
  },
  info: {
    badge: 'border-transparent bg-gray-100 text-gray-700',
    dot: 'bg-gray-400',
    border: 'border-l-gray-300',
  },
};
