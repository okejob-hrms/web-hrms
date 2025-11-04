/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { ILeaveTypeResponse, IMutateLeaveTypeRequest } from "./types";
import { PaginationState } from "@tanstack/react-table";

export const getLeaveTypes = async (
  pagination?: PaginationState,
): Promise<ApiResponse<ILeaveTypeResponse[]>> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams.page = page.toString();
    searchParams.per_page = per_page.toString();
  }
  const response = await api.get<ILeaveTypeResponse>("employee/leave-types", {
    searchParams,
  });

  return response.json();
};

export const createLeaveType = async (
  params: IMutateLeaveTypeRequest,
): Promise<ApiResponse<PaginatedResponse<ILeaveTypeResponse>>> => {
  try {
    const response = await api.post<
      ApiResponse<PaginatedResponse<ILeaveTypeResponse>>
    >("employee/leave-types", { json: params });
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

export const updateLeaveType = async (
  params: IMutateLeaveTypeRequest,
  id: number,
): Promise<ApiResponse<PaginatedResponse<ILeaveTypeResponse>>> => {
  try {
    const response = await api.put<
      ApiResponse<PaginatedResponse<ILeaveTypeResponse>>
    >(`employee/leave-types/${id}`, { json: params });
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

export const deleteLeaveType = async (
  id: number,
): Promise<ApiResponse<PaginatedResponse<ILeaveTypeResponse>>> => {
  try {
    const response = await api.delete<
      ApiResponse<PaginatedResponse<ILeaveTypeResponse>>
    >(`employee/leave-types/${id}`);
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
