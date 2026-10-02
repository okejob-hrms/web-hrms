import { apiEmployee } from "@/lib/api";
import {
  DashboardAttendanceResponse,
  DashboardAttendanceTrend,
  EssLeaveActionPayload,
  EssOvertimeStatusPayload,
  WaitingResponse,
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
