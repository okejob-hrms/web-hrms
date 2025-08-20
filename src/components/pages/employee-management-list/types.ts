export interface Filters {
  department?: string[];
  position?: string[];
  search?: string;
  start_date?: string | null;
  end_date?: string | null;
}

export interface AdvancedFilterProps {
  onReset: () => void;
}
