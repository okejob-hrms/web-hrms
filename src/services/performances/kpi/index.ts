/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { IKPI, IKPIDetails, IKPIParam, IMutateKPIRequest } from "./types";
import qs from "qs";

export const getAllKPIs = async (
  params?: IKPIParam,
): Promise<PaginatedResponse<IKPI>> => {
  try {
    return api
      .get(
        params
          ? `key-performance-indicators?${qs.stringify(params)}`
          : `key-performance-indicators`,
      )
      .json<PaginatedResponse<IKPI>>();
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

export const getKPIDetails = async (
  id: number,
): Promise<ApiResponse<IKPIDetails>> => {
  try {
    return api
      .get(`key-performance-indicators/${id}`)
      .json<ApiResponse<IKPIDetails>>();
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

export const postAddKPI = async (
  params: IMutateKPIRequest,
): Promise<ApiResponse<IKPI>> => {
  try {
    return api
      .post(`key-performance-indicators`, { json: params })
      .json<ApiResponse<IKPI>>();
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

export const updateKPI = async (
  params: IMutateKPIRequest,
  id: number,
): Promise<ApiResponse<IKPI>> => {
  try {
    return api
      .put(`key-performance-indicators/${id}`, { json: params })
      .json<ApiResponse<IKPI>>();
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

export const deleteKPI = async (
  id: number,
): Promise<PaginatedResponse<IKPIDetails>> => {
  try {
    return api
      .delete(`key-performance-indicators/${id}`)
      .json<PaginatedResponse<IKPIDetails>>();
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
