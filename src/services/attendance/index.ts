import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { Attendance } from "./types";
import { PaginationState } from "@tanstack/react-table";

export const getAttendance = async (
  pagination?: PaginationState,
): Promise<ApiResponse<PaginatedResponse<Attendance>>> => {
  let searchParams = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams = {
      page: page.toString(),
      per_page: per_page.toString(),
    };
  }
  const response = await api.get<
    ApiResponse<PaginatedResponse<Attendance>>
  >("employee/attendances", {
    searchParams,
  });
  return response.json();
};