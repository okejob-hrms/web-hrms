import { apiEmployee } from "@/lib/api";
import {
  DashboardAttendanceResponse,
  DashboardAttendanceTrend,
  EssLeaveActionPayload,
  EssOvertimeStatusPayload,
  WaitingResponse,
  EssAttendanceHistory,
  EssAttendanceHistoryResponse,
  EssAttendanceAdjustPayload,
  EssLeaveBalance,
  EssLeaveListResponse,
  EssPayslipListResponse,
  EssPayslipDetailResponse,
  EssSupervisorAssessmentListResponse,
} from "./types";

type PersonalTrendApiResponse = {
  status: string;
  message: string;
  data: {
    start_date: string;
    end_date: string;
    trend: Array<{
      date: string;
      on_time: number;
      late: number;
      overtime: number;
      absent: number;
      leave: number;
    }>;
    summary: {
      on_time: number;
      late: number;
      overtime: number;
      absent: number;
      leave: number;
    };
  };
};

export const getAttendanceDashboardEmployee = async (
  filters: { start_date?: string; end_date?: string }
): Promise<DashboardAttendanceResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.start_date) {
    searchParams.start_date = filters.start_date
  }

  if (filters.end_date) {
    searchParams.end_date = filters.end_date
  }

  const response = await apiEmployee.get<PersonalTrendApiResponse>(
    'ess/attendance/trend',
    { searchParams }
  )

  const json = await response.json()
  const trend: DashboardAttendanceTrend[] = (json.data.trend ?? []).map((item) => ({
    date: item.date,
    ontime: item.on_time,
    late: item.late,
    overtime: item.overtime,
    absent: item.absent,
    leave: item.leave,
  }))

  return {
    status: json.status,
    message: json.message,
    data: {
      start_date: json.data.start_date,
      end_date: json.data.end_date,
      trend,
      summary: {
        total_ontime: json.data.summary.on_time,
        total_late: json.data.summary.late,
        total_overtime: json.data.summary.overtime,
        total_absent: json.data.summary.absent,
        total_leave: json.data.summary.leave,
      },
    },
  }
}

export const getWaitingDashboardEmployee = async (): Promise<WaitingResponse> => {
  const response = await apiEmployee.get<WaitingResponse>(
    'emdash/waiting-for-approval',
  )

  return response.json()
}

export const essLeaveAction = async (
  leaveId: number,
  payload: EssLeaveActionPayload,
) => {
  const response = await apiEmployee.post(
    `ess/leave/${leaveId}/action`,
    { json: payload },
  );
  return response.json();
};

export const essLeaveCancel = async (
  leaveId: number,
  payload?: { notes?: string },
) => {
  const response = await apiEmployee.post(
    `ess/leave/${leaveId}/cancel`,
    { json: payload ?? {} },
  );
  return response.json();
};

export const essBusinessTripApprove = async (
  tripId: number,
  payload?: { notes?: string },
) => {
  const response = await apiEmployee.post(
    `ess/business-trips/${tripId}/approve`,
    { json: payload ?? {} },
  );
  return response.json();
};

export const essBusinessTripReject = async (
  tripId: number,
  payload?: { notes?: string },
) => {
  const response = await apiEmployee.post(
    `ess/business-trips/${tripId}/reject`,
    { json: payload ?? {} },
  );
  return response.json();
};

export const essOvertimeStatus = async (
  overtimeId: number,
  payload: EssOvertimeStatusPayload,
) => {
  const response = await apiEmployee.post(
    `ess/overtime/${overtimeId}/status`,
    { json: payload },
  );
  return response.json();
};

// ─── Attendance history ────────────────────────────────────────────────────
export const getEssAttendanceHistory = async (params?: {
  period?: string;   // Y-m e.g. "2026-10"
  status?: string;
}): Promise<EssAttendanceHistoryResponse> => {
  const searchParams: Record<string, string> = {};
  if (params?.period) searchParams.period = params.period;
  if (params?.status !== undefined && params.status !== '')
    searchParams.status = params.status;
  const response = await apiEmployee.get<EssAttendanceHistoryResponse>(
    'ess/attendance/history',
    { searchParams },
  );
  return response.json();
};

export const adjustEssAttendance = async (
  id: number,
  payload: EssAttendanceAdjustPayload,
) => {
  const response = await apiEmployee.put(
    `ess/attendance/${id}`,
    { json: payload },
  );
  return response.json();
};

// ─── Leave balance + ESS leave list ───────────────────────────────────────
export const getEssLeaveBalance = async (): Promise<{ data: EssLeaveBalance[] }> => {
  const response = await apiEmployee.get<{ data: EssLeaveBalance[] }>(
    'ess/leave/balance',
  );
  return response.json();
};

export const getEssLeaves = async (params?: {
  status?: number;
  per_page?: number;
  page?: number;
}): Promise<EssLeaveListResponse> => {
  const searchParams: Record<string, string> = {};
  if (params?.status !== undefined) searchParams.status = String(params.status);
  if (params?.per_page) searchParams.per_page = String(params.per_page);
  if (params?.page) searchParams.page = String(params.page);
  const response = await apiEmployee.get<EssLeaveListResponse>(
    'ess/leave',
    { searchParams },
  );
  return response.json();
};

// ─── Payslip ─────────────────────────────────────────────────────────────
export const getEssPayslips = async (params?: {
  per_page?: number;
  page?: number;
}): Promise<EssPayslipListResponse> => {
  const searchParams: Record<string, string> = {};
  if (params?.per_page) searchParams.per_page = String(params.per_page);
  if (params?.page) searchParams.page = String(params.page);
  const response = await apiEmployee.get<EssPayslipListResponse>(
    'ess/payslip',
    { searchParams },
  );
  return response.json();
};

export const getEssPayslipDetail = async (id: number): Promise<EssPayslipDetailResponse> => {
  const response = await apiEmployee.get<EssPayslipDetailResponse>(`ess/payslip/${id}`);
  return response.json();
};

export const requestEssPayslipView = async (id: number) => {
  const response = await apiEmployee.post(`ess/payslip/${id}/request-view`, { json: {} });
  return response.json();
};

export const requestEssPayslipPrint = async (id: number) => {
  const response = await apiEmployee.post(`ess/payslip/${id}/request-print`, { json: {} });
  return response.json();
};

// ─── ESS Supervisor Assessment ────────────────────────────────────────────
export const getEssSupervisorAssessments = async (params?: {
  per_page?: number;
  page?: number;
}): Promise<EssSupervisorAssessmentListResponse> => {
  const searchParams: Record<string, string> = {};
  if (params?.per_page) searchParams.per_page = String(params.per_page);
  if (params?.page) searchParams.page = String(params.page);
  const response = await apiEmployee.get<EssSupervisorAssessmentListResponse>(
    'ess/supervisor-assessments',
    { searchParams },
  );
  return response.json();
};
