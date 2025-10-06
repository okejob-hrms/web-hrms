export interface IRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  description: string;
  permissions: IPermissionModule[]
}

export interface IRolesResponse {
  current_page: number;
  current_page_url: string;
  data: IRole[];
  first_page_url: string;
  from: number;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
}

export interface IRoleDetailResponse {
  status: string;
  message: string;
  data: IRole;
}

export interface IPermissionAction {
  id: number;
  name: string;
  granted: boolean;
}

export type IPermissionActionKey =
  | "view"
  | "create"
  | "edit"
  | "assign"
  | "deactivate"
  | "delete"
  | "export"

export type IPermissionActions = Record<IPermissionActionKey, IPermissionAction>

export interface IPermissionRow {
  key: string
  actions: IPermissionActions
}

export interface IPermissionModule {
  module: string
  columns: IPermissionActionKey[]
  rows: IPermissionRow[]
}

export interface IPermissionResponse {
  data: IPermissionModule[]
}

export interface IEmployee {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  department: string;
  department_id: number;
  job_level: string;
  job_level_id: number;
  job_position: string;
  job_position_id: number;
  status: number;
  start_date: string;
  end_date: string | null;
  photo_profile: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IEmployeePagination {
  current_page: number;
  current_page_url: string;
  data: IEmployee[];
  first_page_url: string;
  from: number;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface IEmployeeModule {
  status: string;
  message: string;
  data: IEmployeePagination;
}

export interface ICreateRolePayload {
  name: string;
  guard_name: string;
  permissions: number[];
  users: number[];
}

export interface ICreateRoleResponse {
  status: string;
  message: string;
  data: {
    id: number;
    guard_name: string;
    name: string;
  };
}

export interface CompanyResponse {
  data: Company;
}

export interface WorkScheduleResponse {
  status: string;
  message: WorkSchedulePart;
}

export interface WorkSchedulePart {
  late_tolerance: number;
  max_late_tolerance: number;
  schedules: WorkSchedule[];
}

export interface Company {
  id: number;
  name: string;
  legal_entity_name: string;
  industry: string;
  email: string;
  phone: string;
  logo: string | null;
  business_registration_number: string;
  website: string;
  address: string;
  is_active: boolean;
  payroll_bank_name: string;
  payroll_bank_account_number: string;
  payroll_bank_account_name: string;
  payroll_currency: string;
  work_schedules: WorkSchedule[];
  logo_url: string | null;
}

export interface WorkSchedule {
  day_of_week: number; // 1 = Monday, 7 = Sunday
  day_name: string;
  has_schedule: boolean;
  schedules: Schedule[];
  total_shifts: number;
}

export interface Schedule {
  id?: number;
  shift_id: number;
  sequence: number;
  shift_name: string;
  start_time: string; // format: HH:mm
  end_time: string;   // format: HH:mm
  ends_next_day: boolean;
  break_start_time?: string;
  break_end_time?: string;
  shift?: {
    id: number;
    name: string;
  }
}

export interface CompanyRequest {
  address: string;
  business_registration_number: string;
  email: string;
  industry: string;
  legal_entity_name: string;
  logo: string | null;
  name: string;
  payroll_bank_account_name: string;
  payroll_bank_account_number: string;
  payroll_bank_name: string;
  payroll_currency: string;
  phone: string;
  website: string;
  // work_schedules: WorkScheduleReq[];
}

export interface WorkScheduleReq {
  day_of_week: number;
  has_schedule: boolean;
  day_name: string;
  total_shifts: number;
  schedules?: Schedule[];
}

export interface AttendanceRequest {
  late_tolerance: number;
  max_late_tolerance: number;
  work_schedules: WorkScheduleReq[];
}

export interface ShiftResponse {
  data: ShiftItem[];
}

export interface ShiftItem {
  id: number;
  tenant_id: number;
  name: string;
}

export interface LateDeductions {
  created_at: string;
  duration_type: string;
  duration_type_label: string;
  ends_on: null;
  id: number;
  is_active: boolean;
  is_leave_impact: boolean;
  is_payroll_deduction: boolean;
  leave_impact: string;
  leave_impact_label: string;
  max_minutes: null;
  max_minutes_formatted: null;
  min_minutes: number;
  min_minutes_formatted: string;
  note: string;
  payroll_amount: string;
  payroll_amount_formatted: string;
  priority: number;
  starts_on: null;
  tenant_id: number;
  updated_at: string;
  shift: ShiftList[];
}

export interface ShiftList {
  shift_id: number;
  late_deduction_id: number;
  id: number;
  name: string;
}

export interface DeductionRequest {
  duration_type: string;
  ends_on?: string;
  is_active: boolean;
  is_leave_impact: boolean;
  is_payroll_deduction: boolean;
  leave_impact: string;
  max_minutes?: number;
  min_minutes: number;
  note?: string;
  payroll_amount: number;
  priority?: number | null;
  shift_id: number[];
  starts_on?: string;
}

export interface OvertimeResponse {
  data: OvertimeList[];
  message: string;
  status: string;
}

export interface OvertimeList {
  achievement: string;
  blood_type: string;
  bpjs: string;
  citizen_id_address: string;
  code: string;
  created_at: string;
  date_of_birth: string;
  gender: string;
  height: string;
  hobby: string;
  id: number;
  id_number: string;
  marital_status: number;
  marital_status_label: string;
  npwp: string;
  personal_description: string;
  phone_number: number;
  photo_profile: string;
  place_of_birth: string;
  residential_address: string;
  updated_at: string;
  user_id: number;
  weight: string;
}