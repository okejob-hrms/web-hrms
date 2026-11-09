import type { AttendanceReviewIssue, ReviewRecord } from '@/services/attendance-review/types';

export const REVIEW_TABS = ['issues'] as const;

export type ReviewTab = (typeof REVIEW_TABS)[number];

export type PeriodError = 'invalidDate' | 'endBeforeStart' | 'tooLong';

export type RecordActionKind = 'reject' | 'mark_absent';

export interface RecordActionTarget {
  kind: RecordActionKind;
  issue: AttendanceReviewIssue;
  /** Null for a day issue without a record: mark absent then creates the absent row. */
  record: ReviewRecord | null;
}
