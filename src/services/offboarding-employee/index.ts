/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { OffboardingData, OffboardingProgressStep } from "./types";


const API_URL_NO_V1 = 'https://api.okejobhub.fun/api';

export const getOffboarding = async (): Promise<ApiResponse<OffboardingData>> => {
  try {
    // We use the custom URL here. 
    // If 'api' is a 'ky' instance, we use prefixUrl to override the default.
    const response = await api.get<ApiResponse<OffboardingData>>(
      `ess/offboarding`,
      {
        prefixUrl: API_URL_NO_V1 
      }
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

export const getOffboardingProgress = async (id: number): Promise<ApiResponse<OffboardingProgressStep[]>> => {
  try {
    const response = await api.get<ApiResponse<OffboardingProgressStep[]>>(
      `employee/offboardings/${id}/progress`,
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