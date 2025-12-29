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
