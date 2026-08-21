/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  ISelfAssessmentResponse,
  IMutateSelfAssessmentRequest,
  ISelfAssessmentDetailResponse,
  IEmployeeSelfAssessmentResponse,
  IEmployeeAssessmentAdminDetail,
  IAssessmentSubmission,
  IMutateEmployeeSelfAssessmentRequest,
} from "./types";
import { api, apiEmployee } from "@/lib/api";
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
): Promise<ApiResponse<IEmployeeAssessmentAdminDetail>> => {
  try {
    const response = await api.get<
      ApiResponse<IEmployeeAssessmentAdminDetail>
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

export const updateSelfAssessment = async (
  id: number,
  params: IMutateSelfAssessmentRequest,
): Promise<ApiResponse<ISelfAssessmentResponse>> => {
  try {
    const response = await api.put<ApiResponse<ISelfAssessmentResponse>>(
      `employee/self-assessments/${id}`,
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

export const exportSelfAssessmentExcel = async (
  periodId: number,
): Promise<Blob> => {
  try {
    const response = await api.get(
      `employee/self-assessments/${periodId}/export`,
      { timeout: 120000 },
    );
    return response.blob();
  } catch (error: any) {
    if (error?.name === "HTTPError" && error.response) {
      let message = "Failed to export self assessment";
      try {
        const errorResponse = await error.response.json();
        if (errorResponse?.message) {
          message = errorResponse.message;
        }
      } catch {
        // response body may not be JSON (e.g. fatal PHP error)
      }
      throw new Error(message);
    }
    throw error;
  }
};

export const getEmployeeSelfAssessments = async (
  pagination?: PaginationState,
  filters?: { search?: string; date?: string; status?: number },
): Promise<PaginatedResponse<IEmployeeSelfAssessmentResponse>> => {
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

  const response = await apiEmployee.get<
    PaginatedResponse<IEmployeeSelfAssessmentResponse>
  >("ess/self-assessment", {
    searchParams,
  });

  return response.json();
};

export const getEmployeeSelfAssessmentDetail = async (
  id: number,
): Promise<PaginatedResponse<IAssessmentSubmission>> => {
  const response = await apiEmployee.get<
    PaginatedResponse<IAssessmentSubmission>
  >(`ess/self-assessment/${id}/submission`);

  return response.json();
};

export const submitEmployeeSelfAssessment = async (
  id: number,
  params: IMutateEmployeeSelfAssessmentRequest,
): Promise<ApiResponse<ISelfAssessmentResponse>> => {
  try {
    const response = await apiEmployee.post<
      ApiResponse<ISelfAssessmentResponse>
    >(`ess/self-assessment/${id}/submission`, { json: params });
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

export const validateEmployeeSelfAssessment = async (
  id: number,
  params: IMutateEmployeeSelfAssessmentRequest,
): Promise<ApiResponse<ISelfAssessmentResponse>> => {
  try {
    const response = await apiEmployee.post<
      ApiResponse<ISelfAssessmentResponse>
    >(`ess/self-assessment/${id}/submission/validate`, { json: params });
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
