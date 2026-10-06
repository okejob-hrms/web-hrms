export interface Filters {
  // department_ids?: number[];
  // job_position_ids?: number[];
  search?: string;
  /** Inclusive overtime_date range. Empty = all dates (paginated). */
  start_date?: string;
  end_date?: string;
  status?: number;
}

export interface AdvancedFilterProps {
  onReset: () => void;
}
