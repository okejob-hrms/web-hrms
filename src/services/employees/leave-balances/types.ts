export interface ILeaveBalanceResponse {
  id: number;
  job_level_id: number;
  balance: number;
  reset_period_day: number;
  reset_period_month: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  job_level: {
    id: number;
    name: string;
  } | null;
}

export interface IMutateLeaveBalanceRequest {
  job_level_id: number;
  balance: number;
  reset_period_day: number;
  reset_period_month: number;
}
