export interface IPenaltyMeta {
  label?: string;
  minutes?: number;
  count?: number;
  rule_name?: string;
  value_type?: "fixed" | "percentage";
  impact_type?: "base_salary" | "allowance";
  trigger_type?: "late" | "early_leave" | "both";
  max_threshold?: number;
  min_threshold?: number;
  occurrence_index?: number;
  configured_amount?: number;
  monthly_free_count?: number;
  target_allowance_type_id?: number | null;
}

export interface IPenaltyResponse {
  id: number;
  user_id: number;
  attendance_rule_id?: number;
  period?: string;
  point: number;
  value_type?: string;
  amount?: string;
  condition_type?: "per_occurrence" | "monthly_aggregate" | string;
  name: string;
  description: string;
  valid_until: string | null;
  meta?: IPenaltyMeta | null;
  created_by?: number;
  author_id?: number;
  created_at: string;
  updated_at: string;
}

export interface IPenaltyRequest {
  user_id: number;
  point: number;
  name: string;
  description: string;
  valid_until: string | null;
}
