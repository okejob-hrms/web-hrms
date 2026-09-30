import dayjs from 'dayjs';
import { HTTPError } from 'ky';
import type { ApiErrorResponse } from '@/lib/types';

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

export type SelectOption = { value: string; label: string };

export type ShiftOption = { id: number; name: string };

export function toShiftOptions(shifts: ShiftOption[] | undefined): SelectOption[] {
  return shifts?.map((s) => ({ value: String(s.id), label: s.name })) ?? [];
}
