import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { Attendance, AttendanceDetail, AttendanceSummary, AttendanceSummaryDetail, RequestAttendance, RequestAttendanceStatus } from "./types";
import { PaginationState } from "@tanstack/react-table";

export const getAttendance = async (
  pagination?: PaginationState,
  filters?: { search?: string; date?: string; status?: string; }
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

  if (filters?.status) {
    searchParams.status = filters.status;
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

export const getAttendanceDetail = async (
  id: string,
  monthNumber?: number,
  year?: number,
): Promise<ApiResponse<PaginatedResponse<AttendanceDetail>>> => {
  const reformatMonth = monthNumber
    ? String(monthNumber).padStart(2, '0')
    : '';
  const response = await api.get<ApiResponse<PaginatedResponse<AttendanceDetail>>>(
    monthNumber && year
      ? `employee/attendances/users/${id}/history?period=${year}-${reformatMonth}`
      : `employee/attendances/users/${id}/history`
  );
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

export const getAttendanceDetailById = (
  id: string,
): Promise<ApiResponse<AttendanceDetail>> => {
  const response = api.get<ApiResponse<AttendanceDetail>>(
    `employee/attendances/${id}`,
  );
  return response.json();
};

export const exportAttendanceExcel = async (params?: {
  start_date?: string;
  end_date?: string;
  date?: string;
}): Promise<Blob> => {
  const searchParams: Record<string, string> = {};
  if (params?.start_date) {
    searchParams.start_date = params.start_date;
  }
  if (params?.end_date) {
    searchParams.end_date = params.end_date;
  }
  if (params?.date) {
    searchParams.date = params.date;
  }

  try {
    const response = await api.get("employee/attendances/export", {
      searchParams,
      timeout: 120000,
    });
    return response.blob();
  } catch (error: any) {
    if (error?.name === "HTTPError" && error.response) {
      let message = "Failed to export attendance";
      try {
        const errorResponse = await error.response.json();
        if (errorResponse?.message) {
          message = errorResponse.message;
        }
      } catch {
        // response body may not be JSON (e.g. fatal PHP error)
      }
      throw new Error(message);
    }
    throw error;
  }
};