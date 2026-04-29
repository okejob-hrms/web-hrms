import { api } from "@/lib/api";
import { PaginationState } from "@tanstack/react-table";
import { ApiResponse } from "@/lib/types";
import {
  IBusinessTripActionRequest,
  IBusinessTripDetailResponse,
  IBusinessTripListResponse,
  IBusinessTripResponse,
} from "./types";

export const getBusinessTrips = async (
  pagination?: PaginationState,
  filters?: {
    start_date?: string;
    end_date?: string;
    status?: number;
    user_id?: number;
  },
): Promise<IBusinessTripListResponse> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    searchParams.page = String(pagination.pageIndex + 1);
    searchParams.per_page = String(pagination.pageSize);
  }

  if (filters?.start_date) {
    searchParams.start_date = filters.start_date;
  }

  if (filters?.end_date) {
    searchParams.end_date = filters.end_date;
  }

  if (filters?.status !== undefined) {
    searchParams.status = String(filters.status);
  }

  if (filters?.user_id !== undefined) {
    searchParams.user_id = String(filters.user_id);
  }

  const response = await api.get<IBusinessTripListResponse>(
    "employee/business-trips",
    { searchParams },
  );

  return response.json();
};

export const getBusinessTripDetail = async (
  id: number,
): Promise<IBusinessTripDetailResponse> => {
  const response = await api.get<IBusinessTripDetailResponse>(
    `employee/business-trips/${id}`,
  );
  return response.json();
};

const normalizeNotes = (notes?: string | null): string | null => {
  if (notes === undefined || notes === null) return null;
  const trimmed = notes.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const approveBusinessTrip = async (
  id: number,
  payload?: IBusinessTripActionRequest,
): Promise<ApiResponse<IBusinessTripResponse>> => {
  const response = await api.post<ApiResponse<IBusinessTripResponse>>(
    `employee/business-trips/${id}/approve`,
    { json: { notes: normalizeNotes(payload?.notes) } },
  );
  return response.json();
};

export const rejectBusinessTrip = async (
  id: number,
  payload?: IBusinessTripActionRequest,
): Promise<ApiResponse<IBusinessTripResponse>> => {
  const response = await api.post<ApiResponse<IBusinessTripResponse>>(
    `employee/business-trips/${id}/reject`,
    { json: { notes: normalizeNotes(payload?.notes) } },
  );
  return response.json();
};
