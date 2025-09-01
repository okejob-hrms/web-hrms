import { api } from "@/lib/api";
import { IJobLevelForm, JobLevel } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { PaginationState } from "@tanstack/react-table";

export const postJobLevel = async (
  payload: IJobLevelForm
): Promise<ApiResponse<JobLevel>> => {
  const response = await api.post<ApiResponse<JobLevel>>("job-positions", {
    json: { payload },
  });
  return response.json();
};

export const getJobLevels = async (): Promise<PaginatedResponse<JobLevel>> => {
  const response = await api.get<PaginatedResponse<JobLevel>>(
    "job-levels"
    // JSON.stringify(payload),
  );
  return response.json();
};

export const postJobLevelManagement = async (
  payload: IJobLevelForm
): Promise<ApiResponse<JobLevel>> => {
  const response = await api.post<ApiResponse<JobLevel>>("job-levels", {
    json: payload,
  });
  return response.json();
};

export const getJobLevelsPagination = async (
  pagination?: PaginationState
): Promise<PaginatedResponse<JobLevel>> => {
  let searchParams = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams = {
      page: page.toString(),
      per_page: per_page.toString(),
    };
  }
  const response = await api.get<PaginatedResponse<JobLevel>>(
    "job-levels",
    {
      searchParams,
    }
    // JSON.stringify(payload),
  );
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
