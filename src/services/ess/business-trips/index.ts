import { apiEmployee } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { PaginationState } from "@tanstack/react-table";
import { IBusinessTripResponse } from "@/services/business-trips/types";
import {
  IEssBusinessTripCreateRequest,
  IEssBusinessTripDetailResponse,
  IEssBusinessTripListResponse,
} from "./types";

export const getEssBusinessTrips = async (
  pagination?: PaginationState,
  filters?: {
    status?: number;
    start_date?: string;
    end_date?: string;
  },
): Promise<IEssBusinessTripListResponse> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    searchParams.page = String(pagination.pageIndex + 1);
    searchParams.per_page = String(pagination.pageSize);
  }
  if (filters?.status !== undefined) {
    searchParams.status = String(filters.status);
  }
  if (filters?.start_date) {
    searchParams.start_date = filters.start_date;
  }
  if (filters?.end_date) {
    searchParams.end_date = filters.end_date;
  }

  const response = await apiEmployee.get<IEssBusinessTripListResponse>(
    "ess/business-trips",
    { searchParams },
  );

  return response.json();
};

export const getEssBusinessTripDetail = async (
  id: number,
): Promise<IEssBusinessTripDetailResponse> => {
  const response = await apiEmployee.get<IEssBusinessTripDetailResponse>(
    `ess/business-trips/${id}`,
  );
  return response.json();
};

export const createEssBusinessTrip = async (
  payload: IEssBusinessTripCreateRequest,
): Promise<ApiResponse<IBusinessTripResponse>> => {
  const response = await apiEmployee.post<ApiResponse<IBusinessTripResponse>>(
    "ess/business-trips",
    { json: payload },
  );
  return response.json();
};

export const cancelEssBusinessTrip = async (
  id: number,
): Promise<ApiResponse<IBusinessTripResponse>> => {
  const response = await apiEmployee.delete<ApiResponse<IBusinessTripResponse>>(
    `ess/business-trips/${id}`,
  );
  return response.json();
};
