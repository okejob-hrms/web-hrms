import type { AttendanceReviewIssue } from '@/services/attendance-review/types';

export interface RosterHint {
  week_start: string;
  branch_id: number | null;
  branch: string | null;
  punch_count: number;
}

export function rosterHintFromIssue(issue: AttendanceReviewIssue): RosterHint | null {
  const raw = issue.params.roster_hint;
  if (!raw || typeof raw !== 'object') return null;
  const hint = raw as Record<string, unknown>;
  if (typeof hint.week_start !== 'string' || hint.week_start === '') return null;
  return {
    week_start: hint.week_start,
    branch_id: typeof hint.branch_id === 'number' ? hint.branch_id : null,
    branch: typeof hint.branch === 'string' ? hint.branch : null,
    punch_count: typeof hint.punch_count === 'number' ? hint.punch_count : 0,
  };
}

export function rosterWeekHref(weekStart: string): string {
  return `/settings/time-attendance/shift-roster?week=${encodeURIComponent(weekStart)}`;
}
