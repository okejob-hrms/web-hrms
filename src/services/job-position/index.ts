/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { IPositionForm, JobPositionResponse } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { PaginationState } from "@tanstack/react-table";

export const postJobPosition = async (
  payload: IPositionForm,
): Promise<ApiResponse<JobPositionResponse>> => {
  try {
    const response = await api.post<ApiResponse<JobPositionResponse>>(
      "job-positions",
      { json: payload },
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

export const getJobPosition = async (): Promise<
  PaginatedResponse<JobPositionResponse>
> => {
  const response = await api.get<PaginatedResponse<JobPositionResponse>>(
    "job-positions",
    {
      searchParams: {
        per_page: 10000,
      },
    },
  );
  return response.json();
};

export const postJobPositionManagement = async (
  payload: IPositionForm,
): Promise<ApiResponse<JobPositionResponse>> => {
  const response = await api.post<ApiResponse<JobPositionResponse>>(
    "job-positions",
    {
      json: payload,
    },
  );
  return response.json();
};

export const getJobPositionPagination = async (
  pagination?: PaginationState,
): Promise<PaginatedResponse<JobPositionResponse>> => {
  const searchParams = pagination
    ? {
        page: (pagination.pageIndex + 1).toString(),
        per_page: pagination.pageSize.toString(),
      }
    : {
        page: "1",
        per_page: "10000",
      };

  const response = await api.get<PaginatedResponse<JobPositionResponse>>(
    "job-positions",
    {
      searchParams,
    },
  );
  return response.json();
};

export const putJobPositions = async ({
  id,
  payload,
}: {
  id: number;
  payload: IPositionForm;
}): Promise<ApiResponse<JobPositionResponse>> => {
  const response = await api.put<ApiResponse<JobPositionResponse>>(
    `job-positions/${id}`,
    {
      json: payload,
    },
  );
  return response.json();
};

export const deleteJobPositions = async ({
  id,
}: {
  id: number;
}): Promise<ApiResponse<IPositionForm>> => {
  const response = await api.delete<ApiResponse<null>>(`job-positions/${id}`);
  return response.json();
};
