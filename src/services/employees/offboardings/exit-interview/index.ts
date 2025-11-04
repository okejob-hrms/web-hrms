/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import {
  IFormSubmissionRequest,
  IGetAnswerSubmissionOffboardingRequest,
} from "./types";

export const postNotifyEmployee = async (offboarding_id: number) => {
  try {
    const response = await api.post(
      `employee/offboardings/${offboarding_id}/exit-interview/notify`,
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

export const postSubmissionExitInterview = async (
  offboarding_id: number,
  params: IFormSubmissionRequest,
) => {
  try {
    const response = await api.post(
      `employee/offboardings/${offboarding_id}/exit-interview`,
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

export const getAnswerSubmissionOffboarding = async (
  offboarding_id: number,
  params: IGetAnswerSubmissionOffboardingRequest,
) => {
  try {
    const response = await api.get(
      `employee/offboardings/${offboarding_id}/exit-interview`,
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
