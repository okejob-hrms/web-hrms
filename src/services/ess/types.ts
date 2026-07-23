export interface DashboardAttendanceResponse {
    data:    DashboardAttendance;
    message: string;
    status:  string;
}

export interface DashboardAttendance {
    end_date:   string;
    month:      string;
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
  total: number;
}

/** @deprecated Use WaitingApprovalItem */
export type WaitingApprovalDataMeta = WaitingApprovalItem;

export interface WaitingApprovalItem {
  id: number;
  type: 'leave' | 'overtime' | 'offboarding' | string;
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
