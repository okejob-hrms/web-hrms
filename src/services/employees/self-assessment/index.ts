/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  ISelfAssessmentResponse,
  IMutateSelfAssessmentRequest,
  ISelfAssessmentDetailResponse,
  IEmployeeSelfAssessmentResponse,
} from "./types";
import { api } from "@/lib/api";
import { PaginationState } from "@tanstack/react-table";

export const getSelfAssessments = async (
  pagination?: PaginationState,
  filters?: { search?: string; date?: string; status?: number },
): Promise<ApiResponse<PaginatedResponse<ISelfAssessmentResponse>>> => {
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

  const response = await api.get<ISelfAssessmentResponse>(
    "employee/self-assessments",
    {
      searchParams,
    },
  );

  return response.json();
};

export const getDetailSelfAssessment = async (
  id: number,
): Promise<ApiResponse<ISelfAssessmentDetailResponse>> => {
  try {
    const response = await api.get<ApiResponse<ISelfAssessmentDetailResponse>>(
      `employee/self-assessments/${id}`,
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

export const getDetailEmployeeAssessment = async (
  id: number,
): Promise<ApiResponse<IEmployeeSelfAssessmentResponse>> => {
  try {
    const response = await api.get<
      ApiResponse<IEmployeeSelfAssessmentResponse>
    >(`employee/self-assessments/${id}/employee`);
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

export const createSelfAssessment = async (
  params: IMutateSelfAssessmentRequest,
): Promise<ApiResponse<ISelfAssessmentResponse>> => {
  try {
    const response = await api.post<ApiResponse<ISelfAssessmentResponse>>(
      "employee/self-assessments",
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
