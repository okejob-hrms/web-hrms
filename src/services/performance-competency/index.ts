/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  IMutatePerformanceCompetency,
  IMutatePerformanceCompetencyLevel,
  IPerformanceCompetencyDetails,
  IPerformanceCompetencyLevel,
  IPerformanceCompetencyResponse,
} from "./types";

export const getPerformanceCompetencies = async (): Promise<
  ApiResponse<PaginatedResponse<IPerformanceCompetencyResponse>>
> => {
  try {
    return api
      .get(`setting/performance-competencies`)
      .json<ApiResponse<PaginatedResponse<IPerformanceCompetencyResponse>>>();
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

export const getPerformanceCompetenciesDetail = async (
  id: number,
): Promise<ApiResponse<IPerformanceCompetencyDetails>> => {
  try {
    return api
      .get(`setting/performance-competencies/${id}`)
      .json<ApiResponse<IPerformanceCompetencyDetails>>();
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

export const postAddPerformanceCompetency = async (
  params: IMutatePerformanceCompetency,
): Promise<ApiResponse<IPerformanceCompetencyResponse>> => {
  try {
    return api
      .post(`setting/performance-competencies`, { json: params })
      .json<ApiResponse<IPerformanceCompetencyResponse>>();
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

export const updatePerformanceCompetency = async (
  id: number,
  params: IMutatePerformanceCompetency,
): Promise<ApiResponse<IPerformanceCompetencyResponse>> => {
  try {
    return api
      .put(`setting/performance-competencies/${id}`, { json: params })
      .json<ApiResponse<IPerformanceCompetencyResponse>>();
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

export const deletePerformanceCompetency = async (
  id: number,
): Promise<ApiResponse<IPerformanceCompetencyDetails>> => {
  try {
    return api
      .delete(`setting/performance-competencies/${id}`)
      .json<ApiResponse<IPerformanceCompetencyDetails>>();
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

export const getPerformanceCompetencyLevels = async (): Promise<
  ApiResponse<PaginatedResponse<IPerformanceCompetencyLevel>>
> => {
  try {
    return api
      .get(`setting/performance-competency-levels`)
      .json<ApiResponse<PaginatedResponse<IPerformanceCompetencyLevel>>>();
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

export const getPerformanceCompetencyLevelDetail = async (
  id: number,
): Promise<ApiResponse<IPerformanceCompetencyLevel>> => {
  try {
    return api
      .get(`setting/performance-competency-levels/${id}`)
      .json<ApiResponse<IPerformanceCompetencyLevel>>();
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

export const postAddPerformanceCompetencyLevel = async (
  params: IMutatePerformanceCompetencyLevel,
): Promise<ApiResponse<IPerformanceCompetencyLevel>> => {
  try {
    return api
      .post(`setting/performance-competency-levels`, {
        json: params,
      })
      .json<ApiResponse<IPerformanceCompetencyLevel>>();
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

export const updatePerformanceCompetencyLevel = async (
  id: number,
  params: IMutatePerformanceCompetencyLevel,
): Promise<ApiResponse<IPerformanceCompetencyLevel>> => {
  try {
    return api
      .put(`setting/performance-competency-levels/${id}`, {
        json: params,
      })
      .json<ApiResponse<IPerformanceCompetencyLevel>>();
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

export const deletePerformanceCompetencyLevel = async (
  id: number,
): Promise<ApiResponse<IPerformanceCompetencyLevel>> => {
  try {
    return api
      .delete(`setting/performance-competency-levels/${id}`)
      .json<ApiResponse<IPerformanceCompetencyLevel>>();
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
