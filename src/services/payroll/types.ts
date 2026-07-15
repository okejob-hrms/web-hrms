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
    total_gross_pay: string;
    total_payslips: string;
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
  total_gross_pay: string;
  total_payslips: string;
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
  additional_earning: PayslipAdditionalItem[];
  deduction: DeductionList[];
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
  total_deductions: number;
}

export interface DeductionList {
  salary_deduction_id: number;
  name: string;
  type: string;
  amount: number;
  calculation_basis: string;
  contribution_type: string;
}

export interface PayslipAdditionalItem {
  id: number;
  name: string;
  amount: number;
}

export interface PayslipEmployee {
  id: number;
  code?: string | null;
  name: string;
  email: string;
  salary_nett: string;
  job_title: string;
  job_level: string;
  department: string;
  npwp:string;
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

export interface AllowanceItem {
  allowance_name: string;
  allowance_value: string;
  allowance_type_id: string;
};

export interface AllowanceRequest {
  payslip_id: number;
  allowance: AllowanceItem[];
}

export interface WorkHourPayrun {
  working_hours: number;
  working_days: number;
}

export interface WorkingHourRequest {
  payslip_id: number;
  working_hours: number;
  working_days: number;
}

export interface OvertimePayrun {
  overtime_amount: number;
}

export interface OvertimeRequest {
  payslip_id: number;
  overtime_amount: number;
}

export interface AdditionalItem {
  name: string;
  amount: number;
}

export interface AdditionalRequest {
  payslip_id: number;
  earnings: AdditionalItem[];
}

export interface PenaltyPayrun {
  penalties_amount: number;
}

export interface PenaltyRequest {
  payslip_id: number;
  penalties_amount: number;
}

export interface PayrunViewResponse {
    data: PayrunViewResponseList[];
    message: string;
    pagination: Pagination;
    status: string;
}

export interface PayrunViewResponseList {
    created_at: string;
    employee: EmployeePayrunViewResponse;
    id: number;
    payrun: PayrunPayrunViewResponse;
    print_access_granted_at: string;
    print_access_requested_at: string;
    print_access_status: number;
    print_access_status_label: string;
    view_access_granted_at: string;
    view_access_requested_at: string;
    view_access_status: number;
    view_access_status_label: string;
    updated_at: string;
}

export interface EmployeePayrunViewResponse {
    avatar_url: null;
    email: string;
    employee_code: string;
    employee_id: number;
    id: number;
    name: string;
    phone: null;
}

export interface PayrunPayrunViewResponse {
    id: number;
    period_label: string;
    period_month: number;
    period_year: number;
}

export interface Pagination {
    current_page: number;
    first: string;
    from: number;
    last: string;
    last_page: number;
    next: string | null;
    per_page: number;
    prev: string | null;
    to: number;
    total: number;
}

export interface TotalSpendResponse {
  status: string;
  message: string;
  data: TotalSpendData;
}

export interface TotalSpendData {
  payrun_id: number;
  period_label: string;
  allowance: SpendItem;
  overtime: SpendItem;
  additional_earning: SpendItem;
  penalties: SpendItem;
  deduction: SpendItem;
  spend: SpendItem;
  gross_pay: SpendItem;
  net_pay: SpendItem;
  deductions_by_name: SpendItem[];
}

export interface SpendItem {
  label: string;
  total: number;
}

export interface PayrunLog {
  data: PayrunLogList[];
  message: string;
  pagination: Pagination;
  status: string;
}

export interface PayrunLogList {
  actor?: Actor;
  created_at?: string;
  entity?: string;
  event?: string;
  id?: number;
  message?: string;
}

export interface Actor {
  avatar_url: null;
  email: string;
  employee_code: string;
  employee_id: number;
  id: number;
  name: string;
  phone: null;
}
