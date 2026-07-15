/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { IJobLevelForm, JobLevel } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { PaginationState } from "@tanstack/react-table";

export const postJobLevel = async (
  payload: IJobLevelForm,
): Promise<ApiResponse<JobLevel>> => {
  try {
    const response = await api.post<ApiResponse<JobLevel>>("job-levels", {
      json: payload,
    });
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

export const getJobLevels = async (): Promise<PaginatedResponse<JobLevel>> => {
  // Backend defaults to per_page=10; dropdowns need the full list for preselected IDs.
  const response = await api.get<PaginatedResponse<JobLevel>>("job-levels", {
    searchParams: {
      page: "1",
      per_page: "10000",
    },
  });
  return response.json();
};

export const postJobLevelManagement = async (
  payload: IJobLevelForm,
): Promise<ApiResponse<JobLevel>> => {
  try {
    const response = await api.post<ApiResponse<JobLevel>>("job-levels", {
      json: payload,
    });
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

export const getJobLevelsPagination = async (
  pagination?: PaginationState,
): Promise<PaginatedResponse<JobLevel>> => {
  const searchParams = pagination
    ? {
        page: (pagination.pageIndex + 1).toString(),
        per_page: pagination.pageSize.toString(),
      }
    : {
        page: "1",
        per_page: "10000",
      };

  const response = await api.get<PaginatedResponse<JobLevel>>("job-levels", {
    searchParams,
  });
  return response.json();
};

export const putJobLevels = async ({
  id,
  payload,
}: {
  id: number;
  payload: IJobLevelForm;
}): Promise<ApiResponse<JobLevel>> => {
  const response = await api.put<ApiResponse<JobLevel>>(`job-levels/${id}`, {
    json: payload,
  });
  return response.json();
};

export const deleteJobLevels = async ({
  id,
}: {
  id: number;
}): Promise<ApiResponse<IJobLevelForm>> => {
  const response = await api.delete<ApiResponse<null>>(`job-levels/${id}`);
  return response.json();
};
