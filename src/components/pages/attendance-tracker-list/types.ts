export interface Filters {
  search?: string;
  /** Inclusive range start (YYYY-MM-DD). Empty + empty end → BE defaults to today. */
  start_date?: string;
  /** Inclusive range end (YYYY-MM-DD). */
  end_date?: string;
  /** Attendance approval status: 0 waiting, 1 approved, 2 rejected, 3 absent */
  status?: string;
  /** Shift id */
  shift_id?: string;
  /** metadata.created_via: ess | manual | iclock | cronjob */
  source?: string;
}

export interface AdvancedFilterProps {
  onReset: () => void;
}
