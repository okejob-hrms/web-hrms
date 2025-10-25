/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { ILeaveBalanceResponse, IMutateLeaveBalanceRequest } from "./types";
import { PaginationState } from "@tanstack/react-table";

export const getLeaveBalances = async (
  pagination?: PaginationState,
): Promise<ApiResponse<PaginatedResponse<ILeaveBalanceResponse>>> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams.page = page.toString();
    searchParams.per_page = per_page.toString();
  }

  const response = await api.get<ILeaveBalanceResponse>(
    "employee/leave-balances",
    { searchParams },
  );

  return response.json();
};

export const getLeaveBalanceDetail = async (
  id: number,
): Promise<ApiResponse<ILeaveBalanceResponse>> => {
  const response = await api.get<ILeaveBalanceResponse>(
    `employee/leave-balances/${id}`,
  );

  return response.json();
};

export const createLeaveBalance = async (
  params: IMutateLeaveBalanceRequest,
): Promise<ApiResponse<PaginatedResponse<ILeaveBalanceResponse>>> => {
  try {
    const response = await api.post<
      ApiResponse<PaginatedResponse<ILeaveBalanceResponse>>
    >("employee/leave-balances", { json: params });
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

export const updateLeaveBalance = async (
  params: IMutateLeaveBalanceRequest,
  id: number,
): Promise<ApiResponse<PaginatedResponse<ILeaveBalanceResponse>>> => {
  try {
    const response = await api.put<
      ApiResponse<PaginatedResponse<ILeaveBalanceResponse>>
    >(`employee/leave-balances/${id}`, { json: params });
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

export const deleteLeaveBalance = async (
  id: number,
): Promise<ApiResponse<PaginatedResponse<ILeaveBalanceResponse>>> => {
  try {
    const response = await api.delete<
      ApiResponse<PaginatedResponse<ILeaveBalanceResponse>>
    >(`employee/leave-balances/${id}`);
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
