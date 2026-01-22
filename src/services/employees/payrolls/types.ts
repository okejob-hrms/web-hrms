export interface IEmployeePayroll {
  id: number;
  tenant_id: number;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  period_year: number;
  period_month: number;
  period_label: string;
  send_payslip_at: string;
  auto_send_payslip: boolean;
  status: number;
  status_label: string;
  generation_status: number;
  generation_status_label: string;
  notes: string | null;
  total_payslips: number;
  total_gross_pay: string;
  total_net_pay: string;
  locked_at: string | null;
  sent_at: string | null;
  can_be_locked: boolean;
  can_be_sent: boolean;
  can_be_cancelled: boolean;
  is_generating: boolean;
  is_generation_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface IAllowance {
  allowance_name: string;
  allowance_value: number;
  allowance_type_id: number;
}

export interface IEmployeeShort {
  id: number;
  name: string;
  email: string;
  salary_nett: string;
  base_salary: string;
  job_title: string;
  job_level: string;
  department: string;
  npwp: string;
}

export interface IEmployeePayrollDetail {
  id: number;
  employee: IEmployeeShort;
  gross_pay: string;
  net_pay: number;
  working_hours: string;
  working_days: number;
  allowance: IAllowance[];
  overtime: any[]; // Define if known
  additional_earning: any[]; // Define if known
  deduction: any[]; // Define if known
  currency: string;
  status: number;
  status_label: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  payrun_id: number;
  employee_id: number | null;
  employment_id: number;
  payrun: IEmployeePayroll;
  can_be_edited: boolean;
  can_be_approved: boolean;
  can_be_voided: boolean;
  total_allowances: number;
  total_overtime: string;
  total_penalties: string;
  total_additional_earnings: number;
  total_deductions: number;
  created_by?: {
    id: number;
    name: string;
    email: string;
  };
}
