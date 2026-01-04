export interface OkrDashboardResponse {
  status: string;
  message: string;
  data: OkrDashboard[];
}

export interface KeyResult {
  id: number;
  name: string;
  frequency: number;
  frequency_label: string;
  format: number;
  format_label: string;
  direction: number;
  direction_label: string;
  aggregation: number;
  aggregation_label: string;
  status: number;
  average_actual_value: number;
  average_target_value: number;
  target_value: number;
  data: number[];
  labels: string[];
}

export interface OkrDashboard {
  id: number;
  name: string;
  okr_cycle_id: number;
  progress: number;
  status: number;
  key_results: KeyResult[];
}
