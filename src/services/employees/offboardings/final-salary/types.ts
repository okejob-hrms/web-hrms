export interface IFinalSalaryResponse {
  id: number;
  offboarding_id: number;
  overtime_amount: string;
  bonus_amount: string;
  reimbursement_amount: string;
  deduction_amount: string;
  allowances: Allowance[];
  total_amount: string;
  notes: string;
  assigned_payrun_date: string | null;
  status: number;
  logged_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Allowance {
  allowance_type_id: number;
  amount: number;
}
