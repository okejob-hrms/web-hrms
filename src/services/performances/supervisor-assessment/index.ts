/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  IScheduleRequest,
  IScheduleResponse,
  ISupervisorAssessmentMutation,
  ISupervisorAssessmentParam,
  ISupervisorAssessmentResponse,
} from "./types";
import { api } from "@/lib/api";
import qs from "qs";

export const getAllSupervisorAssessment = async (
  params?: ISupervisorAssessmentParam,
): Promise<PaginatedResponse<ISupervisorAssessmentResponse>> => {
  try {
    return api
      .get(
        params
          ? `supervisor-assessments?${qs.stringify(params)}`
          : `supervisor-assessments`,
      )
      .json<PaginatedResponse<ISupervisorAssessmentResponse>>();
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

export const setSchedule = async (
  id: number,
  params: IScheduleRequest,
): Promise<ApiResponse<IScheduleResponse>> => {
  try {
    return api
      .post(`supervisor-assessments/${id}/schedule`, { json: params })
      .json<ApiResponse<IScheduleResponse>>();
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

export const getScheduleDetail = async (
  id: number,
): Promise<ApiResponse<IScheduleResponse>> => {
  try {
    return api
      .get(`supervisor-assessments/${id}/schedule`)
      .json<ApiResponse<IScheduleResponse>>();
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

export const updateAssessmentStatus = async (
  id: number,
  status: number,
): Promise<ApiResponse<IScheduleResponse>> => {
  try {
    return api
      .post(`supervisor-assessments/${id}/status`, { json: { status } })
      .json<ApiResponse<IScheduleResponse>>();
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
