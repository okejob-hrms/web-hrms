import type { AttendanceReviewIssue } from '@/services/attendance-review/types';

type Translate = {
  (key: string): string;
  has: (key: string) => boolean;
};

/** Prefer UI locale labels so the sidebar/cards stay in sync even if the API title is English. */
export function checkTitle(t: Translate, code: string, fallback?: string | null): string {
  const key = `checks.${code}`;
  if (t.has(key)) return t(key);
  return fallback || code;
}

export function issueTitle(t: Translate, issue: AttendanceReviewIssue): string {
  const variant = typeof issue.params.variant === 'string' ? issue.params.variant : null;
  if (variant) {
    const variantKey = `checkVariants.${issue.code}.${variant}`;
    if (t.has(variantKey)) return t(variantKey);
  }
  return checkTitle(t, issue.code, issue.title);
}

/** Map API payroll-impact lines through FE copy (code-specific, else the API string). */
export function issuePayrollImpact(t: Translate, issue: AttendanceReviewIssue): string | null {
  if (!issue.payroll_impact) return null;
  const byCode = `payrollImpactByCode.${issue.code}`;
  if (t.has(byCode)) return t(byCode);
  return issue.payroll_impact;
}
