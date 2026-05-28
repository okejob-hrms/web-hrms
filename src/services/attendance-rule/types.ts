export type AttendanceRuleConditionType =
  | 'per_occurrence'
  | 'monthly_aggregate';

export type AttendanceRuleTriggerType = 'late' | 'early_leave' | 'both';

export type AttendanceRuleImpactType = 'base_salary' | 'allowance';

export type AttendanceRuleValueType = 'fixed' | 'percentage';

export interface AttendanceRuleShift {
  id: number;
  name: string;
}

export interface AttendanceRuleAllowanceTypeRef {
  id: number;
  name: string;
}

export interface AttendanceRule {
  id: number;
  tenant_id: number;
  name: string;
  condition_type: AttendanceRuleConditionType;
  condition_type_label: string;
  trigger_type: AttendanceRuleTriggerType;
  trigger_type_label: string;
  min_threshold: number | null;
  max_threshold: number | null;
  monthly_free_count: number | null;
  impact_type: AttendanceRuleImpactType;
  impact_type_label: string;
  target_allowance_type_id: number | null;
  target_allowance_type: AttendanceRuleAllowanceTypeRef | null;
  value_type: AttendanceRuleValueType;
  value_type_label: string;
  amount: string;
  amount_formatted: string;
  priority: number;
  is_active: boolean;
  starts_on: string | null;
  ends_on: string | null;
  note: string | null;
  shifts: AttendanceRuleShift[];
  created_at: string;
  updated_at: string;
}

export interface AttendanceRuleRequest {
  name: string;
  shift_id: number[];
  condition_type: AttendanceRuleConditionType;
  trigger_type: AttendanceRuleTriggerType;
  min_threshold?: number | null;
  max_threshold?: number | null;
  monthly_free_count?: number | null;
  impact_type: AttendanceRuleImpactType;
  target_allowance_type_id: number | null;
  value_type: AttendanceRuleValueType;
  amount: number;
  priority?: number;
  is_active: boolean;
  starts_on?: string | null;
  ends_on?: string | null;
  note?: string | null;
}

export interface AttendanceRuleListParams {
  page?: number;
  limit?: number;
  search?: string;
  condition_type?: AttendanceRuleConditionType;
  trigger_type?: AttendanceRuleTriggerType;
  is_active?: 0 | 1;
}

export interface AttendanceRuleListLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface AttendanceRuleListMetaLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface AttendanceRuleListMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: AttendanceRuleListMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface AttendanceRuleListResponse {
  data: AttendanceRule[];
  links: AttendanceRuleListLinks;
  meta: AttendanceRuleListMeta;
}
