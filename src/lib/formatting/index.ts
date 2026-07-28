import type { AppLocale } from '@/lib/i18n/locale';
import { toIntlLocale, resolveLocale } from '@/lib/i18n/locale';

/** IDR currency always uses id-ID regardless of UI locale */
const IDR_LOCALE = 'id-ID';

export function formatCurrencyIdr(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === '') {
    return 'Rp 0';
  }
  const number = Number(value);
  if (Number.isNaN(number)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat(IDR_LOCALE, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

/** Plain number grouping without currency symbol */
export function formatCurrency(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  const number = Number(value);
  if (Number.isNaN(number)) {
    return '0';
  }
  return new Intl.NumberFormat(IDR_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatNumber(
  value: number | string | null | undefined,
  locale: AppLocale,
): string {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  const number = Number(value);
  if (Number.isNaN(number)) {
    return '0';
  }
  return new Intl.NumberFormat(toIntlLocale(locale)).format(number);
}

export function formatDate(
  value: Date | string | number,
  locale: AppLocale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(toIntlLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(
  isoString: string,
  locale: AppLocale,
): { date: string; hour: string } {
  const dateObj = new Date(isoString);
  const intlLocale = toIntlLocale(locale);

  const date = dateObj.toLocaleDateString(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hour = dateObj.toLocaleTimeString(intlLocale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return { date, hour };
}

export function getMonthOptions(locale: AppLocale) {
  const intlLocale = toIntlLocale(locale);
  return Array.from({ length: 12 }, (_, i) => {
    const label = new Date(2000, i, 1).toLocaleDateString(intlLocale, {
      month: 'long',
    });
    return { id: i + 1, label };
  });
}

export function getMonthLabel(monthId: number, locale: AppLocale): string {
  return (
    getMonthOptions(locale).find((month) => month.id === monthId)?.label ??
    String(monthId)
  );
}

/** Format YYYY-MM period keys for charts and tables */
export function formatChartMonthLabel(
  period: string,
  locale: AppLocale,
  style: 'short' | 'long' = 'short',
): string {
  const [year, month] = period.split('-').map(Number);
  if (!year || !month) {
    return period;
  }

  return new Date(year, month - 1, 1).toLocaleDateString(toIntlLocale(locale), {
    month: style,
    ...(style === 'long' ? { year: 'numeric' } : {}),
  });
}

export function formatDayCount(count: number, locale: AppLocale): string {
  // Keep integers clean; trim float noise (e.g. 0.5 stays "0.5", avoid 0.30000000004).
  const display = Number.isInteger(count)
    ? String(count)
    : String(parseFloat(count.toFixed(2)));

  if (resolveLocale(locale) === 'id') {
    return `${display} hari`;
  }

  return count === 1 ? `${display} day` : `${display} days`;
}

/**
 * Parse API date strings as calendar dates in local time.
 * Avoids `new Date('YYYY-MM-DD')` UTC midnight shifting the day label.
 */
function parseCalendarDate(value: string): Date {
  const dateOnly = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? new Date(NaN)
    : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  locale: AppLocale,
): string {
  const intlLocale = toIntlLocale(locale);
  const start = parseCalendarDate(startDate);
  const end = parseCalendarDate(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '-';
  }

  const formatPart = (date: Date, options: Intl.DateTimeFormatOptions) =>
    date.toLocaleDateString(intlLocale, options);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return formatPart(start, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Always show month on both sides so "Sep 9 - 10, 2026" is not misread.
  if (start.getFullYear() === end.getFullYear()) {
    return `${formatPart(start, { month: 'short', day: 'numeric' })} - ${formatPart(end, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  return `${formatPart(start, { month: 'short', day: 'numeric', year: 'numeric' })} - ${formatPart(end, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export function getDayOptions(
  locale: AppLocale,
  count = 31,
  dayLabel: (day: number) => string,
) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    label: dayLabel(i + 1),
  }));
}

/** @deprecated Use formatCurrencyIdr — kept for backward compatibility */
export const rupiahFormatter = (number: number) => formatCurrencyIdr(number);
