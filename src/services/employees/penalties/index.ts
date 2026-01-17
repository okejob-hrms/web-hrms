import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { IPenaltyRequest, IPenaltyResponse } from "./types";

export const getPenalties = async (userId?: number) => {
  try {
    const url = userId
      ? `employee/penalties?user_id=${userId}`
      : `employee/penalties`;
    const response = api.get<PaginatedResponse<IPenaltyResponse>>(url);
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

export const getDetailsPenalty = async (id: number) => {
  try {
    const response = await api.get<ApiResponse<IPenaltyResponse>>(
      `employee/penalties/${id}`,
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

export const createPenalty = async (data: IPenaltyRequest) => {
  try {
    const response = await api.post<ApiResponse<IPenaltyResponse>>(
      "employee/penalties",
      { json: data },
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

export const updatePenalty = async (id: number, data: IPenaltyRequest) => {
  try {
    const response = await api.put<ApiResponse<IPenaltyResponse>>(
      `employee/penalties/${id}`,
      { json: data },
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

export const deletePenalty = async (id: number) => {
  try {
    const response = await api.delete<ApiResponse<IPenaltyResponse>>(
      `employee/penalties/${id}`,
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
