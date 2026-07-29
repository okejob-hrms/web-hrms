import { formatCurrency } from '@/lib/formatting';

/** RBAC permission required to view salary / compensation amounts. */
export const COMPENSATION_VIEW_PERMISSION =
  'payroll_management.compensation.view';

export const COMPENSATION_CENSORED_PLACEHOLDER = '••••';

/**
 * Format a currency amount, or return a censored placeholder when the value
 * is null/undefined (API-redacted) or the caller lacks permission.
 */
export function formatCurrencyOrCensored(
  value: number | string | null | undefined,
  canView: boolean,
  placeholder: string = COMPENSATION_CENSORED_PLACEHOLDER,
): string {
  if (!canView || value === null || value === undefined || value === '') {
    return placeholder;
  }
  return formatCurrency(value);
}
