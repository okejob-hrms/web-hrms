import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  IPenaltyListParams,
  IPenaltyRequest,
  IPenaltyResponse,
} from "./types";

export const getPenalties = async (params?: IPenaltyListParams) => {
  try {
    const searchParams: Record<string, string> = {};

    if (params?.user_id) searchParams.user_id = String(params.user_id);
    if (params?.page) searchParams.page = String(params.page);
    if (params?.limit) searchParams.limit = String(params.limit);
    if (params?.condition_type)
      searchParams.condition_type = params.condition_type;
    if (params?.period) searchParams.period = params.period;
    if (params?.valid_status) searchParams.valid_status = params.valid_status;

    const response = api.get<PaginatedResponse<IPenaltyResponse>>(
      "employee/penalties",
      { searchParams },
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
