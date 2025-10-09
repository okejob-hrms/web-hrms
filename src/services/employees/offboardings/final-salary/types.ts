export interface IFinalSalaryResponse {
  id: number | null;
  offboarding_id: number | null;
  base_salary: string;
  salary_nett: string;
  overtime_amount: string;
  allowance_amount: string;
  allowances_count: number;
  bonus_amount: string;
  reimbursement_amount: string;
  deduction_amount: string;
  total_amount: string;
  assigned_payrun_date: string | null;
  status: string | number | null;
  status_label: string;
  notes: string | null;
}
