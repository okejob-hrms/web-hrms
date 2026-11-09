import { ApiPagination } from '@/lib/types';

export type ReviewSeverity = 'blocker' | 'warning' | 'info';

/** `approved`: row issue whose record is already approved (shown, never counted as open). */
export type ReviewIssueState = 'open' | 'accepted' | 'approved';

export type ReviewStateFilter = 'open' | 'accepted' | 'all';

export type ReviewAction =
  | 'edit'
  | 'accept'
  | 'reject'
  | 'mark_absent'
  | 'swap'
  | 'merge'
  | 'add_record'
  | 'open_unresolved'
  | 'open_adjustments'
  | 'open_overtime'
  | 'open_employee'
  | 'open_unknown_pins';

export interface ReviewPeriodRange {
  /** YYYY-MM-DD, inclusive */
  start: string;
  /** YYYY-MM-DD, inclusive */
  end: string;
}

export interface ReviewPeriodPayload extends ReviewPeriodRange {
  label: string;
  days: number;
}

export interface ReviewPeriodStatus {
  id: number;
  status: 'open' | 'completed';
  completed_at: string | null;
  completed_by: string | null;
}

export interface ReviewCheckCount {
  code: string;
  severity: ReviewSeverity;
  /** Localized by the API from Accept-Language */
  title: string | null;
  open: number;
  accepted: number;
  approved: number;
}

export interface UnresolvedNoRosterGroup {
  week_start: string;
  branch_id: number | null;
  branch: string | null;
  punch_count: number;
  issue_count: number;
}

export interface AttendanceReviewSummary {
  period: ReviewPeriodPayload;
  review: ReviewPeriodStatus | null;
  counts: {
    employees: number;
    records: number;
    waiting: number;
    approved: number;
    rejected: number;
    absent: number;
    approvable_now: number;
    changed_since_completed: number;
  };
  issues: {
    blocker: { open: number; accepted: number };
    warning: { open: number; accepted: number };
    info: { open: number };
  };
  by_check: ReviewCheckCount[];
  unresolved_by_reason: Record<string, number>;
  unresolved_no_roster_groups: UnresolvedNoRosterGroup[];
  computed_at: string;
}

export interface ReviewEmployee {
  user_id: number;
  name: string | null;
  code: string | null;
  branch_id: number | null;
  branch: string | null;
  department: string | null;
}

export interface ReviewRecord {
  id: number;
  /** Booked (counted) date, YYYY-MM-DD */
  attendance_date: string;
  shift: { id: number; name: string | null } | null;
  /** "YYYY-MM-DD HH:mm" in the branch timezone */
  in_local: string | null;
  /** "YYYY-MM-DD HH:mm" in the branch timezone */
  out_local: string | null;
  is_overnight: boolean;
  worked_minutes: number | null;
  duration: string | null;
  overtime_minutes: number;
  /** 0 waiting, 1 approved, 2 rejected, 3 absent */
  status: number;
  status_label: string;
  clock_sources: { in: string | null; out: string | null };
  shift_resolution: string | null;
  break_punches: { at: string | null; source: string | null }[];
}

export type ReviewPunchRole = 'in' | 'out' | 'break' | 'unmatched';

export interface ReviewPunch {
  id: number;
  /** "YYYY-MM-DD HH:mm" in the branch timezone */
  at_local: string;
  status: number;
  status_label: 'pending' | 'processed' | 'unmatched' | 'failed' | 'unresolved' | 'other';
  attendance_id: number | null;
  /** Booked date of the linked record, when any. */
  attendance_date: string | null;
  unresolved_reason: string | null;
  /** How the punch is used by a linked record, or unmatched. */
  role: ReviewPunchRole;
  suggested_shift_id: number | null;
  suggested_counted_date: string | null;
}

export interface ReviewDayRecordSummary {
  date: string;
  is_issue_day: boolean;
  record: {
    id: number;
    shift: { id: number; name: string | null } | null;
    duration: string | null;
    worked_minutes: number | null;
  } | null;
}

export interface ReviewShiftOption {
  id: number;
  name: string | null;
  counted_date: string;
  start_local: string;
  end_local: string;
}

export interface ReviewAcknowledgement {
  id: number;
  note: string;
  by: string | null;
  at: string | null;
}

export interface AttendanceReviewIssue {
  /** Stable key for acknowledgements; never shown in UI text */
  issue_key: string;
  code: string;
  severity: ReviewSeverity;
  state: ReviewIssueState;
  title: string | null;
  employee: ReviewEmployee | null;
  date: string | null;
  records: ReviewRecord[];
  machine_punches: ReviewPunch[];
  /** Day-before / issue day / day-after summaries for the punch rows. */
  day_records: ReviewDayRecordSummary[];
  /** Shifts available around the issue date when unmatched punches exist. */
  shift_options: ReviewShiftOption[];
  params: Record<string, unknown>;
  actions: ReviewAction[];
  payroll_impact: string | null;
  acknowledgement: ReviewAcknowledgement | null;
}

export interface ReviewIssueFilters {
  code?: string;
  severity?: ReviewSeverity;
  state?: ReviewStateFilter;
  branch_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AttendanceReviewSummaryResponse {
  status: string;
  message: string;
  data: AttendanceReviewSummary;
}

export interface AttendanceReviewIssueListResponse {
  status: string;
  message: string;
  data: AttendanceReviewIssue[];
  pagination: ApiPagination;
}

export interface BulkApprovePayload {
  start_date: string;
  end_date: string;
  attendance_ids?: number[];
}

export interface BulkApproveResult {
  approved: number;
  skipped_by_reason: Record<string, number>;
  remaining_waiting: number;
}

export interface BulkApproveResponse {
  status: string;
  message: string;
  data: BulkApproveResult;
}

export interface AcknowledgeIssuePayload {
  start_date: string;
  end_date: string;
  issue_key: string;
  note: string;
}

export interface AcknowledgeIssueResponse {
  status: string;
  message: string;
  data: ReviewAcknowledgement;
}

export type ResolveUnresolvedAction = 'assign' | 'discard';

export interface ResolveUnresolvedItem {
  log_id: number;
  action: ResolveUnresolvedAction;
  counted_date?: string;
  shift_id?: number;
  reason?: string;
}

export interface ResolveUnresolvedPayload {
  items: ResolveUnresolvedItem[];
}

export interface ResolveUnresolvedResult {
  resolved: number;
  log_ids: number[];
}

export interface ResolveUnresolvedResponse {
  status: string;
  message: string;
  data: ResolveUnresolvedResult;
}
