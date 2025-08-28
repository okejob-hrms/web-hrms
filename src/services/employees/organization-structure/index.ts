import { ApiResponse } from "@/lib/types";
import { IEmployeeOrganizationStructure } from "../types";
import { api } from "@/lib/api";

export const getOrgChart = async (): Promise<ApiResponse<IEmployeeOrganizationStructure[]>> => {
  const response = await api.get<ApiResponse<IEmployeeOrganizationStructure[]>>("employees/structure/organization-chart");
  return response.json();
};