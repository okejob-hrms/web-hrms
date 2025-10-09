/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { IFinalSalaryResponse, IMutateFinalSalaryRequest } from "./types";

export const getShowFinalSalary = async (
  offboarding_id: number,
): Promise<ApiResponse<IFinalSalaryResponse>> => {
  try {
    const response = await api.get(
      `employee/offboardings/${offboarding_id}/final-salary`,
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

export const postFinalSalary = async (
  offboarding_id: number,
  payload: IMutateFinalSalaryRequest,
): Promise<ApiResponse<IFinalSalaryResponse>> => {
  try {
    const response = await api.get(
      `employee/offboardings/${offboarding_id}/final-salary`,
      { json: payload },
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

export const postCancelledOffboarding = async (offboarding_id: number) => {
  try {
    const response = await api.post(
      `employee/offboardings/${offboarding_id}/cancel`,
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

export const postAssignPayruns = async (
  offboarding_id: number,
  date: string,
) => {
  try {
    const response = await api.post(
      `employee/offboardings/${offboarding_id}/final-salary/assign-to-payrun`,
      { json: { assigned_payrun_date: date } },
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
