import { ApiResponse } from "@/lib/types";
import {
  IAssignManagerResponse,
  IEmployeeOrganizationStructure,
} from "../types";
import { api } from "@/lib/api";
import { AssignEmployeeFormValues } from "@/components/pages/organization-structure/types";

export const getOrgChart = async (
  employeeId?: number | null
): Promise<ApiResponse<IEmployeeOrganizationStructure[]>> => {
  const queryParams = new URLSearchParams();

  if (employeeId) {
    queryParams.append("employee_id", String(employeeId));
  }

  const url = `employees/structure/organization-chart?${queryParams.toString()}`;

  const response =
    await api.get<ApiResponse<IEmployeeOrganizationStructure[]>>(url);
  return response.json();
};

export const postAssignEmployee = async (
  payload: AssignEmployeeFormValues
): Promise<ApiResponse<IAssignManagerResponse[]>> => {
  const response = await api.post<ApiResponse<IAssignManagerResponse[]>>(
    "employees/assign-manager",
    { json: payload }
  );
  return response.json();
};
