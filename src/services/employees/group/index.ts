import { ApiResponse } from "@/lib/types";
import { IJobLevelGroup } from "../types";
import { api } from "@/lib/api";

type GetEmployeeGroupParams = {
  search?: string;
  // status?: string;
  // page?: number;
};

export const getEmployeeGroupJobLevel = async (
  params?: GetEmployeeGroupParams,
): Promise<ApiResponse<IJobLevelGroup[]>> => {
  const queryParams = new URLSearchParams();

  if (params?.search) {
    queryParams.append("search", params.search);
  }

  const url = `employees/group/job-level?${queryParams.toString()}`;

  const response = await api.get<ApiResponse<IJobLevelGroup[]>>(url);
  return response.json();
};
