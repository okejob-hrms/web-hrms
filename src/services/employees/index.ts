import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  IMutateEmployeeRequests,
  ICreateEmployeeResponse,
  IEmployeeDetailsResponse,
  IEmployeeResponse,
} from "./types";
import { api } from "@/lib/api";
import qs from "qs";
interface Params {
  search?: string;
  department_ids?: number[];
  job_level_ids?: number[];
  job_position_ids?: number[];
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
}

export const getEmployees = (
  params: Params,
): Promise<ApiResponse<PaginatedResponse<IEmployeeResponse>>> => {
  const cleanedParams = Object.entries(params ?? {}).reduce<
    Record<string, unknown>
  >((acc, [key, value]) => {
    if (value == null) return acc;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length === 0) return acc;
      acc[key] = trimmed;
      return acc;
    }
    if (Array.isArray(value)) {
      const filtered = value.filter(
        (v) => v != null && String(v).trim().length > 0,
      );
      if (filtered.length === 0) return acc;
      acc[key] = filtered;
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});

  const queryString = qs.stringify(cleanedParams, {
    encodeValuesOnly: true,
    arrayFormat: "brackets",
  });

  const response = api.get<ApiResponse<PaginatedResponse<IEmployeeResponse>>>(
    `employees${queryString ? `?${queryString}` : ""}`,
  );
  return response.json();
};

export const createEmployee = (
  params: IMutateEmployeeRequests,
): Promise<ApiResponse<ICreateEmployeeResponse>> => {
  const response = api.post<ApiResponse<ICreateEmployeeResponse>>(`employees`, {
    json: params,
  });
  return response.json();
};

export const updateEmployee = (
  params: IMutateEmployeeRequests,
  id: number
): Promise<ApiResponse<ICreateEmployeeResponse>> => {
  const response = api.put<ApiResponse<ICreateEmployeeResponse>>(`employees/${id}`, {
    json: params,
  });
  return response.json();
};

export const deleteEmployee = (
  id: number,
): Promise<ApiResponse<IEmployeeResponse>> => {
  const response = api.delete<ApiResponse<IEmployeeResponse>>(
    `employees/${id}`,
  );
  return response.json();
};

export const getEmployeeDetail = (
  id: number,
): Promise<ApiResponse<IEmployeeDetailsResponse>> => {
  const response = api.get<ApiResponse<IEmployeeDetailsResponse>>(
    `employees/${id}`,
  );
  return response.json();
};
