import { api } from "@/lib/api";
import { PaginationState } from "@tanstack/react-table";
import { IBusinessTripListResponse } from "./types";

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
