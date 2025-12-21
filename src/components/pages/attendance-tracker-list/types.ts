export interface Filters {
  // department_ids?: number[];
  // job_position_ids?: number[];
  search?: string;
  date?: string;
  status?: string;
  // start_date?: string | null;
  // end_date?: string | null;
}

export interface AdvancedFilterProps {
  onReset: () => void;
}
