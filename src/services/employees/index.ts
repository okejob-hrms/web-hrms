import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { IEmployeeResponse } from "./types";
import { api } from "@/lib/api";
import qs from "qs";
// /api/v1/employees?search&job_level_ids[]&job_position_ids[]&status&start_date&end_date
interface Params {
  search?: string;
  department_ids?: string[];
  job_level_ids?: string[];
  job_position_ids?: string[];
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
}

export const getEmployees = (
  params: Params,
): Promise<ApiResponse<PaginatedResponse<IEmployeeResponse>>> => {
  const response = api.get<ApiResponse<PaginatedResponse<IEmployeeResponse>>>(
    `employees${params ? `?${qs.stringify(params, { encodeValuesOnly: true })}` : ""}`,
  );
  return response.json();
};
