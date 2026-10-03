import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { HTTPError } from 'ky';
import { useLocale } from 'next-intl';
import type { ApiErrorResponse } from '@/lib/types';

/** Formats dates with day and month names in the UI language. */
export function useLocalDateFormat() {
  const locale = useLocale() === 'id' ? 'id' : 'en';
  return (date: dayjs.ConfigType, format: string) => dayjs(date).locale(locale).format(format);
}

export async function getErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const errorData = (await error.response.json()) as ApiErrorResponse & {
        errors?: Record<string, string[]>;
      };
      const firstFieldError = errorData.errors
        ? Object.values(errorData.errors).flat()[0]
        : undefined;
      if (firstFieldError) return firstFieldError;
      if (errorData.message) return errorData.message;
    } catch {
      // fall through
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function dateToStr(d: Date | undefined): string {
  return d ? dayjs(d).format('YYYY-MM-DD') : '';
}

export function strToDate(s: string): Date | undefined {
  return s ? dayjs(s).toDate() : undefined;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const raw = String(value).slice(0, 10);
  return dayjs(raw).isValid() ? dayjs(raw).format('YYYY-MM-DD') : raw;
}

export function isAssignmentActive(effectiveTo: string | null | undefined): boolean {
  if (!effectiveTo) return true;
  return !dayjs(String(effectiveTo).slice(0, 10)).isBefore(dayjs(), 'day');
}

/** Monday of the week containing `date` (rosters run Monday–Sunday). */
export function weekStartOf(date: dayjs.ConfigType = undefined): string {
  const d = dayjs(date);
  return d.subtract((d.day() + 6) % 7, 'day').format('YYYY-MM-DD');
}

export function shiftWeek(weekStart: string, weeks: number): string {
  return dayjs(weekStart).add(weeks * 7, 'day').format('YYYY-MM-DD');
}

export type RelativeWeekLabel = 'this' | 'next' | 'last';

/** Compare selected Monday to branch-local current Monday (YYYY-MM-DD). */
export function relativeWeekLabel(
  weekStart: string,
  currentWeekStart: string,
): RelativeWeekLabel | null {
  if (weekStart === currentWeekStart) return 'this';
  if (weekStart === shiftWeek(currentWeekStart, 1)) return 'next';
  if (weekStart === shiftWeek(currentWeekStart, -1)) return 'last';
  return null;
}

export function isWeekEnded(weekStart: string, currentWeekStart: string): boolean {
  return dayjs(weekStart).isBefore(dayjs(currentWeekStart), 'day');
}

export type SelectOption = { value: string; label: string };

export type ShiftOption = { id: number; name: string };

export function toShiftOptions(shifts: ShiftOption[] | undefined): SelectOption[] {
  return shifts?.map((s) => ({ value: String(s.id), label: s.name })) ?? [];
}
