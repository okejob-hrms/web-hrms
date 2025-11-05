/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { IInterviewScheduleRequest, IInterviewScheduleResponse } from "./types";

export const postInterviewSchedule = async (
  offboarding_id: number,
  params: IInterviewScheduleRequest,
): Promise<ApiResponse<IInterviewScheduleResponse>> => {
  try {
    const response = await api.post<ApiResponse<IInterviewScheduleResponse>>(
      `employee/offboardings/${offboarding_id}/schedule`,
      { json: params },
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

export const getInterviewSchedule = async (
  offboarding_id: number,
): Promise<ApiResponse<IInterviewScheduleResponse>> => {
  const response = await api.get<ApiResponse<IInterviewScheduleResponse>>(
    `employee/offboardings/${offboarding_id}/schedule`,
  );
  return response.json();
};

export const putInterviewSchedule = async (
  offboarding_id: number,
  params: IInterviewScheduleRequest,
): Promise<ApiResponse<IInterviewScheduleResponse>> => {
  try {
    const response = await api.post<ApiResponse<IInterviewScheduleResponse>>(
      `employee/offboardings/${offboarding_id}/schedule`,
      { json: params },
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
