import { api, apiEmployee } from "@/lib/api";
import { PaginationState } from "@tanstack/react-table";
import { OvertimeData, RequestOvertime, RequestOvertimeStatus } from "./types";

export const getOvertime = async (
  pagination?: PaginationState,
  filters?: { search?: string; date?: string; status?: number }
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

  if (filters?.date) {
    searchParams.date = filters.date;
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
  filters?: { search?: string; date?: string; status?: number }
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

  if (filters?.date) {
    searchParams.date = filters.date;
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