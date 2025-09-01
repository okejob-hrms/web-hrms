import { api } from "@/lib/api";
import { IPositionForm, JobPositionResponse } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { PaginationState } from "@tanstack/react-table";

export const postJobPosition = async (
  payload: IPositionForm
): Promise<ApiResponse<JobPositionResponse>> => {
  const response = await api.post<ApiResponse<JobPositionResponse>>(
    "job-positions",
    { json: { payload } }
  );
  return response.json();
};

export const getJobPosition = async (): Promise<
  PaginatedResponse<JobPositionResponse>
> => {
  const response = await api.get<PaginatedResponse<JobPositionResponse>>(
    "job-positions"
    // JSON.stringify(payload),
  );
  return response.json();
};

export const postJobPositionManagement = async (
  payload: IPositionForm
): Promise<ApiResponse<JobPositionResponse>> => {
  const response = await api.post<ApiResponse<JobPositionResponse>>(
    "job-positions",
    {
      json: payload,
    }
  );
  return response.json();
};

export const getJobPositionPagination = async (
  pagination?: PaginationState
): Promise<PaginatedResponse<JobPositionResponse>> => {
  let searchParams = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams = {
      page: page.toString(),
      per_page: per_page.toString(),
    };
  }
  const response = await api.get<PaginatedResponse<JobPositionResponse>>(
    "job-positions",
    {
      searchParams,
    }
    // JSON.stringify(payload),
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
    }
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
