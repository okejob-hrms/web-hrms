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
  leaves: WaitingApprovalDataMeta[];
  overtimes: WaitingApprovalDataMeta[];
  offboardings: WaitingApprovalDataMeta[];
  total: number;
}

export interface WaitingApprovalDataMeta {
    approver_status: number;
    id: number;
    comments: string;
    created_at: string;
    type: string;
    user: {
        name: string;
        id: number;
        email: string;
    }
}