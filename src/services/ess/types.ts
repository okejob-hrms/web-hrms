export interface DashboardAttendanceResponse {
    data:    DashboardAttendance;
    message: string;
    status:  string;
}

export interface DashboardAttendance {
    end_date:   string;
    start_date: string;
    summary:    DashboardAttendanceSummary;
    trend:      DashboardAttendanceTrend[];
}

export interface DashboardAttendanceSummary {
    total_absent:   number;
    total_late:     number;
    total_leave:    number;
    total_ontime:   number;
    total_overtime: number;
}

export interface DashboardAttendanceTrend {
    absent:   number;
    date:     string;
    late:     number;
    leave:    number;
    ontime:   number;
    overtime: number;
}

export interface WaitingResponse {
  status: string;
  message: string;
  data: WaitingApprovalData;
}

export interface WaitingApprovalData {
  leaves: WaitingApprovalItem[];
  overtimes: WaitingApprovalItem[];
  offboardings: WaitingApprovalItem[];
  business_trips?: WaitingApprovalItem[];
  total: number;
}

/** @deprecated Use WaitingApprovalItem */
export type WaitingApprovalDataMeta = WaitingApprovalItem;

export interface WaitingApprovalItem {
  id: number;
  type: 'leave' | 'overtime' | 'offboarding' | 'business_trip' | string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  leave_type?: {
    id: number;
    name: string;
  } | null;
  start_date?: string;
  end_date?: string;
  reason?: string;
  destination?: string;
  overtime_date?: string;
  request_date?: string;
  start_time?: string;
  end_time?: string;
  duration?: string | number;
  notes?: string;
  comments?: string;
  status?: number;
  status_label?: string;
  approver_status?: number;
  approver_notes?: string;
  created_at?: string;
}

export interface EssLeaveActionPayload {
  action: 'approve' | 'reject';
  notes?: string;
}

export interface EssOvertimeStatusPayload {
  status: 2 | 3;
}

// ─── Attendance History ───────────────────────────────────────────────────
export interface EssAttendanceHistory {
  id: number;
  attendance_date: string;
  clock_in_at: string | null;
  clock_out_at: string | null;
  duration: string | null;
  shift_id: number | null;
  shift_name: string | null;
  status: number;
  status_label: string;
  notes: string | null;
  pending_adjustment?: boolean;
  source?: string | null;
}

export interface EssAttendanceHistoryResponse {
  status: string;
  message: string;
  data: EssAttendanceHistory[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next: string | null;
    prev: string | null;
  };
}

export interface EssAttendanceAdjustPayload {
  shift_id?: number;
  clock_in_at?: string;  // H:i
  clock_out_at?: string; // H:i
  notes?: string;
}

// ─── Leave Balance ────────────────────────────────────────────────────────
export interface EssLeaveBalance {
  leave_type_id: number;
  leave_type_name: string;
  balance: number;
  used: number;
  remaining: number;
}

export interface EssLeaveItem {
  id: number;
  leave_type: { id: number; name: string } | null;
  start_date: string;
  end_date: string;
  duration: number;
  reason: string;
  status: number;
  status_label: string;
  created_at: string;
  notes?: string | null;
}

export interface EssLeaveListResponse {
  status: string;
  message: string;
  data: EssLeaveItem[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next: string | null;
    prev: string | null;
  };
}

// ─── Payslip ─────────────────────────────────────────────────────────────
export interface EssPayslipItem {
  id: number;
  period: string;
  period_label?: string;
  status: number;
  status_label: string;
  net_salary?: number;
  gross_salary?: number;
  created_at: string;
}

export interface EssPayslipListResponse {
  status: string;
  message: string;
  data: EssPayslipItem[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next: string | null;
    prev: string | null;
  };
}

export interface EssPayslipDetailResponse {
  status: string;
  message: string;
  data: EssPayslipItem & Record<string, unknown>;
}

// ─── Supervisor Assessment ────────────────────────────────────────────────
export interface EssSupervisorAssessmentItem {
  id: number;
  status: number;
  status_label: string;
  period?: string;
  assessors?: { id: number; user?: { id: number; name: string } }[];
  form?: { id: number; name: string } | null;
  schedule?: { date: string; start_time: string; end_time: string } | null;
  created_at: string;
}

export interface EssSupervisorAssessmentListResponse {
  status: string;
  message: string;
  data: EssSupervisorAssessmentItem[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
