/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { IManageAccessDocumentResponse } from "./types";
import { ApiResponse } from "@/lib/types";

interface Params {
  employee_document_id: number;
  access_level: string;
  link_enabled: boolean;
  granteeables: {
    granteeable_type: string;
    granteeable_id: number;
  }[];
}

export const postManageAccessDocument = async (
  params: Params,
): Promise<IManageAccessDocumentResponse> => {
  try {
    const response = api.post<IManageAccessDocumentResponse>(
      `documents/access-control`,
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

export const getManageAccessDocument = async (
  id: number,
): Promise<ApiResponse<IManageAccessDocumentResponse>> => {
  try {
    const response = api.get<ApiResponse<IManageAccessDocumentResponse>>(
      `documents/access-control/${id}`,
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
