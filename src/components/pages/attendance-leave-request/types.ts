import { ILeaveResponse } from "@/services/employees/leave/types";

export interface Filters {
  // department_ids?: number[];
  // job_position_ids?: number[];
  search?: string;
  /** Inclusive leave-date overlap range. Empty = all dates (paginated). */
  start_date?: string;
  end_date?: string;
  status?: number;
  /** HR filter: leaves whose treatment has not been confirmed. URL-safe `"1"` or omit. */
  not_confirmed?: string;
}

export interface AdvancedFilterProps {
  onReset: () => void;
}

export interface ILeaveSummary {
  new_requests: {
    today: number;
    yesterday: number;
  };
  on_leave: {
    today: number;
  };
  pending: number;
  approved: number;
  rejected: number;
}

export interface LeaveListResponse {
  data: ILeaveResponse[];
  summary: ILeaveSummary;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
