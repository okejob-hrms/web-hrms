import { api } from "@/lib/api";
import { DataOffboardingTrendResponse, OffboardingResponse, PendingResponse } from "./types";
import { PaginationState } from "@tanstack/react-table";

export const getPendingStat = async (): Promise<PendingResponse> => {
  const response = await api.get<PendingResponse>("dashboard/pending/stat");
  return response.json();
};

export const getOffboardingStat = async (
  filters: { startDate?: string; endDate?: string }
): Promise<OffboardingResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.startDate) {
    searchParams.start_date = filters.startDate
  }

  if (filters.endDate) {
    searchParams.end_date = filters.endDate
  }

  const response = await api.get<OffboardingResponse>(
    'dashboard/offboarding/trend',
    { searchParams }
  )

  return response.json()
}

export const getOffboardingList = async (
  pagination?: PaginationState,
  search?: string,
): Promise<DataOffboardingTrendResponse> => {
  const searchParams: Record<string, string> = {}

  if (pagination) {
    searchParams.page = String(pagination.pageIndex + 1)
    searchParams.per_page = String(pagination.pageSize)
  }

  if (search?.trim()) {
    searchParams.search = search
  }

  const response = await api.get<DataOffboardingTrendResponse>(
    'dashboard/offboarding/recent',
    { searchParams }
  )

  return response.json()
}
