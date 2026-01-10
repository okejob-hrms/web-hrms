import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { api } from "@/lib/api";
import qs from "qs";
import { ICreateEmployeeResponse } from "../types";
import {
  IMutateOffboardingRequests,
  IOffboardingDetailResponse,
  IOffboardingResponse,
} from "./types";

interface Params {
  search?: string;
  department_id?: number;
  job_position_id?: number;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
  page?: number;
  per_page?: number;
}

export const getOffboardings = (
  params: Params,
  status?: number,
): Promise<PaginatedResponse<IOffboardingResponse>> => {
  const cleanedParams = Object.entries({
    ...params,
    ...(status !== undefined ? { status } : {}),
  }).reduce<Record<string, unknown>>((acc, [key, value]) => {
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

  const response = api.get<PaginatedResponse<IOffboardingResponse>>(
    `employee/offboardings${queryString ? `?${queryString}` : ""}`,
  );

  return response.json();
};

export const createInitiateOffboarding = (
  params: IMutateOffboardingRequests,
): Promise<ApiResponse<ICreateEmployeeResponse>> => {
  const response = api.post<ApiResponse<ICreateEmployeeResponse>>(
    `employee/offboardings`,
    {
      json: params,
    },
  );
  return response.json();
};

export const getDetailOffboarding = (
  offboarding_id: number,
): Promise<IOffboardingDetailResponse> => {
  const response = api.get<IOffboardingDetailResponse>(
    `employee/offboardings/${offboarding_id}`,
  );
  return response.json();
};
