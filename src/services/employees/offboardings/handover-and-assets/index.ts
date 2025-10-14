/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  IEquipmentFacilityHandoverRequest,
  IWorkAndHandoverResponse,
  IWorkDocumentHandoverRequest,
} from "./types";
import { api } from "@/lib/api";

interface Params {
  offboarding_id: number;
  category?: string;
  handover_item_id?: number;
}

export const getHandoverAssetsReturn = async (
  params: Params,
): Promise<ApiResponse<PaginatedResponse<IWorkAndHandoverResponse>>> => {
  try {
    const response = await api.get<
      ApiResponse<PaginatedResponse<IWorkAndHandoverResponse>>
    >(
      `employee/offboardings/${params.offboarding_id}/handover-asset-return?category=${params.category ?? "work"}`,
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

export const deleteHandoverAssetsReturn = async (
  params: Params,
): Promise<ApiResponse<IWorkAndHandoverResponse>> => {
  try {
    const response = await api.delete<ApiResponse<IWorkAndHandoverResponse>>(
      `employee/offboardings/${params.offboarding_id}/handover-asset-return/${params.handover_item_id}`,
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

export const storeWorkDocumentHandover = async (
  offboarding_id: number,
  params: IWorkDocumentHandoverRequest,
): Promise<ApiResponse<IWorkAndHandoverResponse>> => {
  try {
    const response = await api.post<ApiResponse<IWorkAndHandoverResponse>>(
      `employee/offboardings/${offboarding_id}/handover-asset-return`,
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

export const storeEquipmentFacilityHandover = async (
  offboarding_id: number,
  params: IEquipmentFacilityHandoverRequest,
): Promise<ApiResponse<IWorkAndHandoverResponse>> => {
  try {
    const response = await api.post<ApiResponse<IWorkAndHandoverResponse>>(
      `employee/offboardings/${offboarding_id}/handover-asset-return`,
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

export const updateWorkDocumentHandover = async (
  offboarding_id: number,
  params: IWorkDocumentHandoverRequest,
  handover_item_id: number,
): Promise<ApiResponse<IWorkAndHandoverResponse>> => {
  try {
    const response = await api.put<ApiResponse<IWorkAndHandoverResponse>>(
      `employee/offboardings/${offboarding_id}/handover-asset-return/${handover_item_id}`,
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

export const updateEquipmentFacilityHandover = async (
  offboarding_id: number,
  params: IEquipmentFacilityHandoverRequest,
  handover_item_id: number,
): Promise<ApiResponse<IWorkAndHandoverResponse>> => {
  try {
    const response = await api.put<ApiResponse<IWorkAndHandoverResponse>>(
      `employee/offboardings/${offboarding_id}/handover-asset-return/${handover_item_id}`,
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
