import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  ISupervisorAssessmentMutation,
  ISupervisorAssessmentParam,
  ISupervisorAssessmentResponse,
} from "./hook";
import { api } from "@/lib/api";
import qs from "qs";

export const getAllSupervisorAssessment = async (
  params?: ISupervisorAssessmentParam,
): Promise<ApiResponse<PaginatedResponse<ISupervisorAssessmentResponse>>> => {
  try {
    return api
      .get(
        params
          ? `supervisor-assessments?${qs.stringify(params)}`
          : `supervisor-assessments`,
      )
      .json<ApiResponse<PaginatedResponse<ISupervisorAssessmentResponse>>>();
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

export const getSupervisorAssessmentDetail = async (
  id: number,
): Promise<ApiResponse<ISupervisorAssessmentResponse>> => {
  try {
    return api
      .get(`supervisor-assessments/${id}`)
      .json<ApiResponse<ISupervisorAssessmentResponse>>();
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

export const postAddSupervisorAssessment = async (
  params: ISupervisorAssessmentMutation,
): Promise<ApiResponse<ISupervisorAssessmentResponse>> => {
  try {
    return api
      .post(`supervisor-assessments`, { json: params })
      .json<ApiResponse<ISupervisorAssessmentResponse>>();
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

export const updateSupervisorAssessment = async (
  id: number,
  params: ISupervisorAssessmentMutation,
): Promise<ApiResponse<ISupervisorAssessmentResponse>> => {
  try {
    return api
      .put(`supervisor-assessments/${id}`, { json: params })
      .json<ApiResponse<ISupervisorAssessmentResponse>>();
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

export const deleteSupervisorAssessment = async (
  id: number,
): Promise<ApiResponse<ISupervisorAssessmentResponse>> => {
  try {
    return api
      .delete(`supervisor-assessments/${id}`)
      .json<ApiResponse<ISupervisorAssessmentResponse>>();
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
