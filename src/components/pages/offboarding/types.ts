export interface Filters {
  department_id?: number;
  job_position_id?: number;
  search?: string;
  start_date?: string | null;
  end_date?: string | null;
}

export interface AdvancedFilterProps {
  onReset: () => void;
}
