import { ApiResponse } from "@/lib/types";
import { IJobLevelGroup } from "../types";
import { api } from "@/lib/api";

export const getEmployeeGroupJobLevel = async (): Promise<
  ApiResponse<IJobLevelGroup[]>
> => {
  const response = await api.get<ApiResponse<IJobLevelGroup[]>>(
    "employees/group/job-level"
  );
  return response.json();
};
