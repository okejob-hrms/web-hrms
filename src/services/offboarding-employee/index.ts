/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from "@/lib/types";
import { api, apiEmployee } from "@/lib/api";
import { HandoverItem, OffboardingData, OffboardingProgressStep } from "./types";
import { IExitFormRequest, IHandoverItemRequest, IHandoverRequest } from "../form/types";


export const getOffboarding = async (): Promise<ApiResponse<OffboardingData>> => {
  try {
    const response = await apiEmployee.get<ApiResponse<OffboardingData>>(
      `emdash/my-offboarding`,
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

interface GetHandoverParams {
  id?: number;
  category?: string;
}

export const getHandoverItems = async ({ 
  id, 
  category 
}: GetHandoverParams = {}): Promise<ApiResponse<HandoverItem[]>> => {
  try {

    const searchParams: Record<string, string> = {}

    // if (id) {
    //   searchParams['recipient_user_id'] = `${id}`;
    // }

    if (category) {
      searchParams['category'] =  `${category}`;
    }

    const response = await apiEmployee.get<ApiResponse<HandoverItem[]>>(
      `emdash/my-offboarding/handover-items`,
      { searchParams }
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

export const postSubmitExitInterview = async (
  params: IExitFormRequest,
  offboardingId?: number,
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiEmployee.post<ApiResponse<any>>(
      `emdash/my-offboarding/${offboardingId}/submit-exit-interview`,
      {
        json: params,
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

export const submitHandover = async (
  params: IHandoverItemRequest,
): Promise<ApiResponse<any>> => {
  try {
    const isEdit = !!params.id;
    const method = isEdit ? 'put' : 'post';
    const url = isEdit 
      ? `emdash/my-offboarding/handover-items/${params.id}` // Typically PUT includes the ID in URL
      : `emdash/my-offboarding/handover-items`;

    const response = await apiEmployee[method]<ApiResponse<any>>(
      url,
      {
        json: params,
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

export const deleteHandoverItem = async (
  handoverItemId: number
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiEmployee.delete<ApiResponse<any>>(
      `emdash/my-offboarding/handover-items/${handoverItemId}`
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