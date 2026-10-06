/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiResponse,
  ApiSummaryResponse,
  PaginatedResponse,
} from "@/lib/types";
import {
  ILeaveDetails,
  ILeaveEmployeeResponse,
  ILeaveResponse,
  ILeaveSummary,
  IMutateLeaveRequest,
  IMutateLeaveStatus,
  IUserLeaveBalanceResponse,
} from "./types";
import { api, apiEmployee } from "@/lib/api";
import { PaginationState } from "@tanstack/react-table";

export const getLeaves = async (
  pagination?: PaginationState,
  filters?: {
    search?: string;
    start_date?: string;
    end_date?: string;
    status?: number;
  },
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

  // Leave index accepts inclusive overlap via start_date/end_date (and legacy date)
  if (filters?.start_date) {
    searchParams.start_date = filters.start_date;
  }
  if (filters?.end_date) {
    searchParams.end_date = filters.end_date;
  }

  const response = await api.get<ILeaveResponse>("employee/leaves", {
    searchParams,
  });

  return response.json();
};

export const getDetailLeave = async (
  id: number,
): Promise<ApiResponse<ILeaveDetails>> => {
  const response = await api.get<ApiResponse<ILeaveDetails>>(
    `employee/leaves/${id}`,
  );

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

export const updateStatusLeave = async (
  params: IMutateLeaveStatus,
  id: number,
): Promise<ApiResponse<ILeaveResponse>> => {
  try {
    const response = await api.post<ApiResponse<ILeaveResponse>>(
      `employee/leaves/${id}/action`,
      { json: params },
    );
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


// EMPLOYEE

export const getLeavesEmployee = async (
  pagination?: PaginationState,
  filters?: {
    search?: string;
    start_date?: string;
    end_date?: string;
    status?: number;
  },
): Promise<ILeaveEmployeeResponse> => {
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

  // EmDash leave list is period-oriented; omit date params for "all"
  if (filters?.start_date) {
    searchParams.date = filters.start_date;
  }

  const response = await apiEmployee.get<ILeaveResponse>("emdash/my-leave", {
    searchParams,
  });

  return response.json();
};

export const createLeaveEmployee = async (
  params: IMutateLeaveRequest,
): Promise<ApiResponse<PaginatedResponse<ILeaveResponse>>> => {
  try {
    const response = await apiEmployee.post<
      ApiResponse<PaginatedResponse<ILeaveResponse>>
    >("emdash/my-leave", { json: params });
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