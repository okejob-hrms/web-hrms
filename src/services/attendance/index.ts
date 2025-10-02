import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { Attendance, AttendanceDetail, AttendanceSummary, AttendanceSummaryDetail, RequestAttendance, RequestAttendanceStatus } from "./types";
import { PaginationState } from "@tanstack/react-table";

export const getAttendance = async (
  pagination?: PaginationState,
  filters?: { search?: string; date?: string }
): Promise<ApiResponse<PaginatedResponse<Attendance>>> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams.page = page.toString();
    searchParams.per_page = per_page.toString();
  }

  if (filters?.search) {
    searchParams.search = filters.search;
  }

  if (filters?.date) {
    searchParams.date = filters.date;
  }

  const response = await api.get<ApiResponse<PaginatedResponse<Attendance>>>(
    "employee/attendances",
    { searchParams }
  );

  return response.json();
};


export const postAttendance = async (
  payload: RequestAttendance
): Promise<ApiResponse<PaginatedResponse<Attendance>>> => {
  return api
    .post("employee/attendances", {
      json: payload,
    })
    .json<ApiResponse<PaginatedResponse<Attendance>>>();
};

export const putAttendance = async (
  id: string,
  payload: RequestAttendance
): Promise<ApiResponse<PaginatedResponse<Attendance>>> => {
  return api
    .put(`employee/attendances/${id}`, {
      json: payload,
    })
    .json<ApiResponse<PaginatedResponse<Attendance>>>();
};


export const getAttendanceStat = async (): Promise<AttendanceSummary> => {
  const response = await api.get<AttendanceSummary>("employee/attendances/stats");
  return response.json();
};

export const getAttendanceDetail = async (id: string): Promise<ApiResponse<PaginatedResponse<AttendanceDetail>>> => {
  const response = await api.get<ApiResponse<PaginatedResponse<AttendanceDetail>>>(`employee/attendances/users/${id}/history`);
  return response.json();
};

export const getAttendanceStatEmployee = async (id: string): Promise<AttendanceSummaryDetail> => {
  const response = await api.get<AttendanceSummaryDetail>(`employee/attendances/users/${id}/summary`);
  return response.json();
};

export const putAttendanceStatus = async (
  id: number,
  payload: RequestAttendanceStatus
): Promise<ApiResponse<PaginatedResponse<Attendance>>> => {
  return api
    .post(`employee/attendances/${id}/set-status`, {
      json: {
        ...payload,
        rejected_reason: '-',
        remarks: '-',
      },
    })
    .json<ApiResponse<PaginatedResponse<Attendance>>>();
};

export const deleteAttendance = async (
  id: number,
): Promise<ApiResponse<PaginatedResponse<Attendance>>> => {
  return api
    .delete(`employee/attendances/${id}`, {
      json: {},
    })
    .json<ApiResponse<PaginatedResponse<Attendance>>>();
};