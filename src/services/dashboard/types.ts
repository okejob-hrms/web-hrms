export interface PendingResponse {
  message: string;
  status: string;
  data: {
    active_offboarding: number;
    employee_on_leave_today: number;
    pending_leave: number;
    pending_overtime: number;
    pending_payslip: number;
  };
}

export interface OffboardingResponse {
    data: DataOffboardingResponse;
    message: string;
    status: string;
}

export interface DataOffboardingResponse {
    branch: Branch[];
    branch_date: BranchDate[];
    department: Department[];
    department_date: DepartmentDate[];
    job_level: JobLevel[];
    job_level_date: JobLevelDate[];
    total: number;
    trend: Trend[];
}

export interface Branch {
    branch?: string;
    total?: number;
}

export interface BranchDate {
    branch: string;
    month: string;
    total: number;
}

export interface Department {
    department: string;
    total: number;
}

export interface DepartmentDate {
    department: string;
    month: string;
    total: number;
}

export interface JobLevel {
    job_level: string;
    total: number;
}

export interface JobLevelDate {
    job_level: string;
    month: string;
    total: number;
}

export interface Trend {
    month: string;
    total: number;
}

export interface DataOffboardingTrendResponse {
    data: ListOff[];
    message: string;
    pagination: Pagination;
    status: string;
}

export interface ListOff {
    department: string;
    job_level: string;
    job_position: string;
    join_date: string;
    last_working_date: string;
    user_id: number;
    user_name: string;
}

export interface Pagination {
    current_page: number;
    first: string;
    from: number;
    last: string;
    last_page: number;
    next: null;
    per_page: number;
    prev: null;
    to: number;
    total: number;
}

export interface AttendanceStatResponse {
    data: AttendanceStatData[];
    message: string;
    status: string;
}

export interface AttendanceStatData {
    absent: number;
    early: number;
    late: number;
    leave: number;
    month: string;
    on_time: number;
    overtime: number;
}

export interface EmployeeStatResponse {
    message: string;
    status: string;
    data: EmployeeDataStat;
}

export interface EmployeeDataStat {
    details: Detail[];
    total_employee: number;
}

export interface Detail {
    id: number;
    name: string;
    total_employees: number;
}

export interface ExperienceStatResponse {
    data: ExperienceData;
    message: string;
    status: string;
}

export interface ExperienceData {
    experienced: number;
    fresh_graduate: number;
    total: number;
}

export interface AgeStatResponse {
    data: AgeSpread[];
    message: string;
    status: string;
}

export interface AgeSpread {
    generation: string;
    total: number;
}

export interface GenderStatResponse {
    data: Genders[];
    message: string;
    status: string;
}

export interface Genders {
    gender: string;
    total: number;
}

export interface AttStatResponse {
    data: AttObjData;
    message: string;
    status: string;
}

export interface AttObjData {
    absent: AttObj;
    early_clock_in: AttObj;
    early_clock_out: AttObj;
    late_clock_in: AttObj;
    leave: AttObj;
    on_time: AttObj;
    overtime: AttObj;
}

export interface AttObj {
    diff: number;
    today: number;
}

export interface AttListStatResponse {
    data: AttListData[];
    message: string;
    pagination: Pagination;
    status: string;
}

export interface AttListData {
    absent: number;
    branch_name: string;
    early_clock_in: number;
    early_clock_out: number;
    late_clock_in: number;
    leave: number;
    name: string;
    on_time: number;
    user_id: number;
}

export interface ExperienceTrend {
    data: ExpTrends[];
    message: string;
    status: string;
}

export interface ExpTrends {
    experienced: number;
    fresh_graduate: number;
    total: number;
    year: number;
}

export interface ExpTrendListDataResponse {
    data: ExpTrendListData[];
    message: string;
    pagination: Pagination;
    status: string;
}

export interface ExpTrendListData {
    branch_name: string;
    experience_years: number;
    job_position: string;
    name: string;
    profile_id: number;
    user_id: number;
}

export interface AdditionalList {
    data: AdditionalItem;
    message: string;
    status: string;
}

export interface AdditionalItem {
    departments: ItemsOfAdd[];
    job_level: ItemsOfAdd[];
    job_position: ItemsOfAdd[];
    teams: ItemsOfAdd[];
}

export interface ItemsOfAdd {
    name: string;
    total: number;
}

export interface AdditionalListDetail {
    data: AdditionalListDetailData[];
    message: string;
    pagination: Pagination;
    status: string;
}

export interface AdditionalListDetailData {
    branch_name: string;
    name: string;
    total: number;
}

export interface PayrollSummary {
  current_total: number;
  last_year_count: number;
  last_year_total: number;
  percentage_change: number;
}

export interface PayrollDashboardData {
  base_salary: PayrollSummary;
  overtime_payroll: PayrollSummary;
  allowance: PayrollSummary;
  payslip: PayrollSummary;
  penalties: PayrollSummary;
}

export interface PayrollDashboardResponse {
  status: string;
  message: string;
  data: PayrollDashboardData;
}

export interface AgeListDataResponse {
    data:       AgeListData[];
    message:    string;
    pagination: Pagination;
    status:     string;
}

export interface AgeListData {
    branch:        string;
    category:      string;
    date_of_birth: string;
    name:          string;
    position:      string;
}

export interface PayrollTrendResponse {
    data:    PayrollTrendResponseDt[];
    message: string;
    status:  string;
}

export interface PayrollTrendResponseDt {
    allowance:    string;
    month:        string;
    overtime:     string;
    total_salary: string;
}