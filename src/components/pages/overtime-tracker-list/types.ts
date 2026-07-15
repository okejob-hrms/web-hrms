export interface Filters {
  // department_ids?: number[];
  // job_position_ids?: number[];
  search?: string;
  /** Optional single-day override (takes priority over start/end). */
  date?: string;
  /** Inclusive range; FE defaults to current month for hardening. */
  start_date?: string;
  end_date?: string;
  status?: number;
}

export interface AdvancedFilterProps {
  onReset: () => void;
}
