import { api } from "@/lib/api";
import { IPositionForm, JobPositionResponse } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";

export const postJobPosition = async (
  payload: IPositionForm,
): Promise<ApiResponse<JobPositionResponse>> => {
  const response = await api.post<ApiResponse<JobPositionResponse>>(
    "job-positions",
    { json: { payload } },
  );
  return response.json();
};

export const getJobPosition = async (): Promise<
  PaginatedResponse<JobPositionResponse>
> => {
  const response = await api.get<PaginatedResponse<JobPositionResponse>>(
    "job-positions",
    // JSON.stringify(payload),
  );
  return response.json();
};
