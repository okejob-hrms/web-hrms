import { api } from "@/lib/api";
import { IJobLevelForm, JobLevel } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";

export const postJobLevel = async (
  payload: IJobLevelForm,
): Promise<ApiResponse<JobLevel>> => {
  const response = await api.post<ApiResponse<JobLevel>>("job-positions", {
    json: { payload },
  });
  return response.json();
};

export const getJobLevels = async (): Promise<PaginatedResponse<JobLevel>> => {
  const response = await api.get<PaginatedResponse<JobLevel>>(
    "job-levels",
    // JSON.stringify(payload),
  );
  return response.json();
};
