import { api, apiEmployee } from "@/lib/api";
import { PaginationState } from "@tanstack/react-table";
import { OvertimeData, RequestOvertime, RequestOvertimeStatus } from "./types";

export const getOvertime = async (
  pagination?: PaginationState,
  filters?: {
    search?: string;
    date?: string;
    start_date?: string;
    end_date?: string;
    status?: number;
  }
): Promise<OvertimeData> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams.page = page.toString();
    searchParams.per_page = per_page.toString();
  }

  if (filters?.status !== undefined) {
    searchParams.status = filters.status.toString();
  }

  if (filters?.search) {
    searchParams.search = filters.search;
  }

  // Single-day date wins over month range when set
  if (filters?.date) {
    searchParams.date = filters.date;
  } else {
    if (filters?.start_date) {
      searchParams.start_date = filters.start_date;
    }
    if (filters?.end_date) {
      searchParams.end_date = filters.end_date;
    }
  }

  const response = await api.get<OvertimeData>(
    "employee/overtimes",
    { searchParams }
  );

  return response.json();
};

export const putOvertimeStatus = async (
  id: number,
  payload: RequestOvertimeStatus
): Promise<OvertimeData> => {
  return api
    .post(`employee/overtimes/${id}/status`, {
      json: payload,
    })
    .json<OvertimeData>();
};

export const putOvertime = async (
  id: number,
  payload: RequestOvertime
): Promise<OvertimeData> => {
  return api
    .put(`employee/overtimes/${id}`, {
      json: payload,
    })
    .json<OvertimeData>();
};

export const deleteOvertime = async (
  id: number,
): Promise<OvertimeData> => {
  return api
    .delete(`employee/overtimes/${id}`, {
      json: {},
    })
    .json<OvertimeData>();
};

export const getOvertimeEmployee = async (
  pagination?: PaginationState,
  filters?: {
    search?: string;
    date?: string;
    start_date?: string;
    end_date?: string;
    status?: number;
  }
): Promise<OvertimeData> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams.page = page.toString();
    searchParams.per_page = per_page.toString();
  }

  if (filters?.status !== undefined) {
    searchParams.status = filters.status.toString();
  }

  if (filters?.search) {
    searchParams.search = filters.search;
  }

  // EmDash accepts period=Y-m; derive from explicit day or start of month window
  if (filters?.date) {
    searchParams.period = filters.date.slice(0, 7);
  } else if (filters?.start_date) {
    searchParams.period = filters.start_date.slice(0, 7);
  }

  const response = await apiEmployee.get<OvertimeData>(
    "emdash/my-overtime",
    { searchParams }
  );

  return response.json();
};

export const addOvertime = async (
  payload: RequestOvertime
): Promise<OvertimeData> => {
  return apiEmployee
    .post(`emdash/my-overtime`, {
      json: payload,
    })
    .json<OvertimeData>();
};

export const putOvertimeeEmployee = async (
  id: number,
  payload: RequestOvertime
): Promise<OvertimeData> => {
  return apiEmployee
    .put(`emdash/my-overtime/${id}`, {
      json: payload,
    })
    .json<OvertimeData>();
};