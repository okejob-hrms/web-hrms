export interface ILeaveEntitlement {
  id: number;
  leave_type_id: number;
  job_level: string;
  quota_days: number;
  carry_over_allowed: boolean;
  max_carry_over_days: number;
  deduct_employee_balance: boolean;
  carry_over_expiry: string;
  created_at: string;
  updated_at: string;
}

export interface ILeaveTypeResponse {
  id: number;
  name: string;
  description: string;
  gender: string;
  quota_configuration: string;
  created_at: string;
  updated_at: string;
  entitlements: ILeaveEntitlement[];
}

export interface IMutateLeaveTypeRequest {
  name?: string;
  description?: string;
  gender?: string;
  quota_configuration?: string;
  quota_configuration_detail?: {
    job_level: number;
    quota_days: number;
    carry_over_allowed: boolean;
    max_carry_over_days: number;
    deduct_employee_balance: boolean;
    carry_over_expiry: string;
  }[];
}
