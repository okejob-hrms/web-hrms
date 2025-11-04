import { api } from "@/lib/api";
import { RequestPayrollGroup, ResponsePayrollList } from "./types";
import { PaginationState } from "@tanstack/react-table";

export const getPayroll = async (
  pagination?: PaginationState,
  filters?: { search?: string; period_year?: string; period_month?: string }
): Promise<ResponsePayrollList> => {
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

  if (filters?.period_year) {
    searchParams.period_year = filters.period_year;
  }

  if (filters?.period_month) {
    searchParams.period_month = filters.period_month;
  }

  const response = await api.get<ResponsePayrollList>(
    "payruns",
    { searchParams }
  );

  return response.json();
};

export const postPayrollGroup = async (
  payload: RequestPayrollGroup,
): Promise<ResponsePayrollList> => {
  return api
    .post(`payruns`, {
      json: payload,
    })
    .json<ResponsePayrollList>();
};