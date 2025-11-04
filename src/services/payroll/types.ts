export interface ResponsePayrollList {
    data: ResponsePayrollItem[];
    message: string;
    pagination: ResponsePayrollPagination;
    status: string;
}

export interface ResponsePayrollItem {
    auto_send_payslip: boolean;
    can_be_cancelled: boolean;
    can_be_locked: boolean;
    can_be_sent: boolean;
    created_at: string;
    created_by: ResponsePayrollAuthor;
    generation_status: number;
    generation_status_label: string;
    id: number;
    is_generating: boolean;
    is_generation_completed: boolean;
    locked_at: null;
    notes: string;
    period_label: string;
    period_month: number;
    period_year: number;
    send_payslip_at: string;
    sent_at: null;
    status: number;
    status_label: string;
    tenant_id: number;
    updated_at: string;
}

export interface ResponsePayrollAuthor {
    email: string;
    id: number;
    name: string;
}

export interface ResponsePayrollPagination {
    current_page: number;
    first: string;
    from: number;
    last: string;
    last_page: number;
    next: string;
    per_page: number;
    prev: string;
    to: number;
    total: number;
}

export interface RequestPayrollGroup {
    notes: string;
    period_month: number;
    period_year: number;
    auto_send_payslip?: boolean;
    send_payslip_at?: string;
}

export interface ResponsePayrollDetail {
    status: string;
    message: string;
    data: ResponsePayrollItem;
}

export interface PayslipResponse {
  status: string;
  message: string;
  data: {
    payrun: Payrun;
    payslips: Payslip[];
  };
  pagination: Pagination;
}

export interface Payrun {
  id: number;
  tenant_id: number;
  created_by: PayrunCreatedBy;
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
  total_payruns: number | null;
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

export interface PayrunCreatedBy {
  id: number;
  name: string;
  email: string;
}

export interface Payslip {
  id: number;
  employee: PayslipEmployee;
  gross_pay: string;
  net_pay: number;
  working_hours: number;
  working_days: number;
  allowance: PayslipAllowance[];
  overtime: [];
  additional_earning: [];
  deduction: [];
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
  can_be_edited: boolean;
  can_be_approved: boolean;
  can_be_voided: boolean;
  total_allowances: number;
  total_overtime: number;
  total_additional_earnings: number;
}

export interface PayslipEmployee {
  id: number;
  name: string;
  email: string;
  salary_nett: string;
  job_title: string;
  job_level: string;
}

export interface PayslipAllowance {
  allowance_name: string;
  allowance_value: number;
  allowance_type_id: number;
}

// export interface PayslipOvertime {
// }

// export interface PayslipAdditionalEarning {
// }

// export interface PayslipDeduction {
// }

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}
