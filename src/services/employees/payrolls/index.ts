import { api } from "@/lib/api";
import { IEmployeePayroll, IEmployeePayrollDetail } from "./types";
import { PaginatedResponse, ApiResponse } from "@/lib/types";

export const getPayrollEmployee = async (
  user_id: number,
): Promise<PaginatedResponse<IEmployeePayroll>> => {
  try {
    const response = await api.get<PaginatedResponse<IEmployeePayroll>>(
      `employees/${user_id}/payrolls`,
    );

    return response.json();
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);
      (enhancedError as any).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };
      throw enhancedError;
    }
    throw error;
  }
};

export const getPayrollEmployeeDetails = async (
  user_id: number,
  payroll_id: number,
): Promise<ApiResponse<IEmployeePayrollDetail>> => {
  try {
    const response = await api.get<ApiResponse<IEmployeePayrollDetail>>(
      `employees/${user_id}/payrolls/${payroll_id}`,
    );

    return response.json();
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);
      (enhancedError as any).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };
      throw enhancedError;
    }
    throw error;
  }
};
