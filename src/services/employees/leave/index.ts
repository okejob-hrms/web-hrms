/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiResponse,
  ApiSummaryResponse,
  PaginatedResponse,
} from "@/lib/types";
import {
  ILeaveResponse,
  ILeaveSummary,
  IMutateLeaveRequest,
  IUserLeaveBalanceResponse,
} from "./types";
import { api } from "@/lib/api";
import { PaginationState } from "@tanstack/react-table";

export const getLeaves = async (
  pagination?: PaginationState,
  filters?: { search?: string; date?: string; status?: number },
): Promise<
  ApiSummaryResponse<PaginatedResponse<ILeaveResponse>, ILeaveSummary>
> => {
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

  const response = await api.get<ILeaveResponse>("employee/leaves", {
    searchParams,
  });

  return response.json();
};

export const getUserLeaveBalance = async (
  user_id: number,
): Promise<ApiResponse<IUserLeaveBalanceResponse>> => {
  const response = await api.get<IUserLeaveBalanceResponse>(
    `employee/leaves/${user_id}/balance`,
  );

  return response.json();
};

export const createLeave = async (
  params: IMutateLeaveRequest,
): Promise<ApiResponse<PaginatedResponse<ILeaveResponse>>> => {
  try {
    const response = await api.post<
      ApiResponse<PaginatedResponse<ILeaveResponse>>
    >("employee/leaves", { json: params });
    return response.json();
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);
      (enhancedError as any).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };
      throw enhancedError;
    }
    throw error;
  }
};

export const updateLeave = async (
  params: IMutateLeaveRequest,
  id: number,
): Promise<ApiResponse<PaginatedResponse<ILeaveResponse>>> => {
  try {
    const response = await api.put<
      ApiResponse<PaginatedResponse<ILeaveResponse>>
    >(`employee/leaves/${id}`, { json: params });
    return response.json();
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);
      (enhancedError as any).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };
      throw enhancedError;
    }
    throw error;
  }
};

export const deleteLeave = async (
  id: number,
): Promise<ApiResponse<PaginatedResponse<ILeaveResponse>>> => {
  try {
    const response = await api.delete<
      ApiResponse<PaginatedResponse<ILeaveResponse>>
    >(`employee/leaves/${id}`);
    return response.json();
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);
      (enhancedError as any).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };
      throw enhancedError;
    }
    throw error;
  }
};
