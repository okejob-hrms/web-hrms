import { ApiResponse } from "@/lib/types";
import {
  IAssignManagerResponse,
  IEmployeeOrganizationStructure,
} from "../types";
import { api } from "@/lib/api";
import { AssignEmployeeFormValues } from "@/components/pages/organization-structure/types";

export const getOrgChart = async (): Promise<
  ApiResponse<IEmployeeOrganizationStructure[]>
> => {
  const response = await api.get<ApiResponse<IEmployeeOrganizationStructure[]>>(
    "employees/structure/organization-chart"
  );
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
