/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from "@/lib/types";
import {
  IAssignManagerResponse,
  IEmployeeOrganizationStructure,
} from "../types";
import { api } from "@/lib/api";
import {
  AssignEmployeeFormValues,
  EditEmployeeFormValues,
} from "@/components/pages/organization-structure/types";

export const getOrgChart = async (
  employeeId?: string | null,
  maxDepth?: number | null,
): Promise<ApiResponse<IEmployeeOrganizationStructure[]>> => {
  const queryParams = new URLSearchParams();

  if (employeeId) {
    queryParams.append("employee_id", String(employeeId));
  }

  if (maxDepth != null) {
    queryParams.append("max_depth", String(maxDepth));
  }

  const url = `employees/structure/organization-chart?${queryParams.toString()}`;

  const response =
    await api.get<ApiResponse<IEmployeeOrganizationStructure[]>>(url);
  return response.json();
};

export const postAssignEmployee = async (
  payload: AssignEmployeeFormValues,
): Promise<ApiResponse<IAssignManagerResponse[]>> => {
  try {
    const response = await api.post<ApiResponse<IAssignManagerResponse[]>>(
      "employees/assign-manager",
      { json: payload },
    );
    return response.json();
  } catch (error: any) {
    if (error.response) {
      const errJson = await error.response.json();
      let message = "An unexpected error occurred.";
      if (errJson?.message) {
        message = errJson.message;
      } else if (
        errJson?.errors &&
        typeof errJson.errors === "object" &&
        Object.values(errJson.errors).length > 0
      ) {
        const firstErrorArr = Object.values(errJson.errors)[0];
        if (Array.isArray(firstErrorArr) && firstErrorArr.length > 0) {
          message = firstErrorArr[0];
        }
      }
      throw new Error(message);
    }
    // Network or unexpected error
    throw new Error(error.message);
  }
};

export const postEditEmployee = async (
  payload: EditEmployeeFormValues,
): Promise<ApiResponse<IAssignManagerResponse[]>> => {
  try {
    const response = await api.post<ApiResponse<IAssignManagerResponse[]>>(
      "employees/assign-manager",
      { json: payload },
    );
    return response.json();
  } catch (error: any) {
    if (error.response) {
      const errJson = await error.response.json();
      let message = "An unexpected error occurred.";
      if (errJson?.message) {
        message = errJson.message;
      } else if (
        errJson?.errors &&
        typeof errJson.errors === "object" &&
        Object.values(errJson.errors).length > 0
      ) {
        const firstErrorArr = Object.values(errJson.errors)[0];
        if (Array.isArray(firstErrorArr) && firstErrorArr.length > 0) {
          message = firstErrorArr[0];
        }
      }
      throw new Error(message);
    }
    // Network or unexpected error
    throw new Error(error.message);
  }
};
