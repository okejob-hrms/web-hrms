import { api } from "@/lib/api";
import { JobLevel } from "./types";
import { PaginatedResponse } from "@/lib/types";

export const getJobLevels = async (): Promise<PaginatedResponse<JobLevel>> => {
  const response = await api.get<PaginatedResponse<JobLevel>>(
    "job-levels",
    // JSON.stringify(payload),
  );
  return response.json();
};
