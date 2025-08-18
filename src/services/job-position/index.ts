import { api } from "@/lib/api";
import { IPositionForm, JobPositionResponse } from "./types";
import { PaginatedResponse } from "@/lib/types";

export const postJobPosition = async (payload: IPositionForm) => {
  const response = await api.post("job-positions", { json: { payload } });
  return response;
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
