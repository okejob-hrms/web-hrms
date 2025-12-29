export interface IOKRResponse {
  id: number;
  period: string;
  period_year: number;
  name: string;
  start_date: string;
  end_date: string;
  status: number;
  status_label: string;
  tenant_id: number;
  objectives_count: number;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface IOKRCycle {
  period_year: number;
  page: number;
  per_page: number;
  status: string;
}

export interface IOKRCycleRequest {
  end_date: string;
  period: string;
  period_year: string;
  start_date: string;
}

export interface IOKRObjectiveRequest {
  okr_cycle_id: number;
  title: string;
  description?: string;
}

export interface IOKRKeyResult {
  id: number;
  title: string;
  description: string;
  frequency: number;
  frequency_label: string;
  format: number;
  format_label: string;
  start_value: number;
  current_value: number;
  target_value: number;
  status: number;
  status_label: string;
  direction: number;
  direction_label: string;
  aggregation: number;
  aggregation_label: string;
  progress: number;
  objective_id: number;
  job_position_id: number;
  job_level_id: number;
  tenant_id: number;
  created_at: string;
  updated_at: string;
  assignments_count: number;
  assignments: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    employee_id: number;
    employee_code: string;
    avatar_url: string | null;
  }[];
}

export interface IOKRObjective {
  id: number;
  title: string;
  description: string;
  progress: number;
  status: number;
  status_label: string;
  okr_cycle_id: number;
  tenant_id: number;
  key_results_count: number;
  key_results: IOKRKeyResult[];
  created_at: string;
  updated_at: string;
}

export interface IOKRKeyResultsSummary {
  total: number;
  draft: number;
  active: number;
  done: number;
  archived: number;
}

export interface IOKRDetailsResponse {
  id: number;
  period: string;
  period_year: number;
  name: string;
  start_date: string;
  end_date: string;
  status: number;
  status_label: string;
  tenant_id: number;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  objectives_count: number;
  objectives: IOKRObjective[];
  key_results: IOKRKeyResultsSummary;
  created_at: string;
  updated_at: string;
}

export interface IOKRKeyResultRequest {
  objective_id: number;
  job_position_id: number;
  job_level_id: number;
  title: string;
  description?: string;
  frequency: number;
  format: number;
  start_value?: number;
  current_value?: number;
  target_value: number;
  status?: number;
  direction: number;
  aggregation: number;
}

export interface IOKRTrackingPeriodCycle {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

export interface IOKRTrackingPeriodEntry {
  period_id: number;
  label: string;
  actual_value: number;
  target_value: number;
}

export interface IOKRTrackingKeyResult {
  title: string;
  okr_key_result_id: number;
  okr_cycle_id: number;
  frequency: number;
  start_at: string;
  end_at: string;
  tracking_table: IOKRTrackingPeriodEntry[];
}

export interface IOKRTrackingPeriodsResponse {
  cycle: IOKRTrackingPeriodCycle;
  objective_frequency: string;
  key_result: IOKRTrackingKeyResult[];
}

export interface IOKRTrackingPeriodRequest {
  key_result_id: number;
  tracking_period_id: number;
  actual_value: number;
}
